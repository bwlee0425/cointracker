# data_collection/consumers.py
import json
import requests
from channels.generic.websocket import AsyncWebsocketConsumer
from binance.um_futures import UMFutures
import redis
import os
from dotenv import load_dotenv
import asyncio
import websockets
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from django.utils import timezone
from collections import defaultdict
from asgiref.sync import sync_to_async
from data_collection.models import OrderBook, TradeVolume, Liquidation

load_dotenv()

redis_client = redis.Redis.from_url(os.getenv('REDIS_URL'))
binance_client = UMFutures(
    key=os.getenv('BINANCE_API_KEY'),
    secret=os.getenv('BINANCE_SECRET_KEY')
)

logger = logging.getLogger(__name__)

class RealtimeDataConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.trade_volume_buffer = defaultdict(lambda: {'buy_volume': 0.0, 'sell_volume': 0.0})

    async def connect(self):
        try:
            # 테스트를 위해 BTCUSDT만 사용
            self.symbols = ['BTCUSDT']  # 임시로 하드코딩
            if not self.symbols:
                logger.warning("Failed to retrieve symbols. Closing WebSocket connection.")
                await self.close()
                return
            logger.info(f"Connected. Subscribed to symbols: {self.symbols}")
            for symbol in self.symbols:
                await self.channel_layer.group_add(
                    f"realtime_{symbol.lower()}",
                    self.channel_name
                )
            await self.accept()

            # WebSocket 스트림 시작
            streams = [
                f"{symbol.lower()}@depth",
                f"{symbol.lower()}@trade",
                f"{symbol.lower()}@forceOrder",
            ]
            asyncio.create_task(self.start_binance_stream('/'.join(streams)))

        except Exception as e:
            logger.error(f"Error during connect: {e}")
            await self.close()

    async def disconnect(self, close_code):
        logger.info(f"Disconnected with code: {close_code}")
        try:
            for symbol in self.symbols:
                await self.channel_layer.group_discard(
                    f"realtime_{symbol.lower()}",
                    self.channel_name
                )
        except AttributeError:
            pass

    async def get_symbols(self):
        retry_count = 0
        max_retries = 5
        while retry_count < max_retries:
            try:
                res = requests.get('https://fapi.binance.com/fapi/v1/ticker/24hr', timeout=10).json()
                symbols = [s['symbol'] for s in res if s['symbol'].endswith('USDT')]
                logger.info(f"Fetched symbols: {symbols}")
                return symbols
            except requests.exceptions.RequestException as e:
                retry_count += 1
                logger.error(f"Error fetching symbols from Binance API (attempt {retry_count}/{max_retries}): {e}. Retrying in 5s...")
                await asyncio.sleep(5)
        logger.error("Failed to fetch symbols after multiple retries.")
        return []

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=5, max=60), retry=retry_if_exception_type((ConnectionError, TimeoutError, websockets.ConnectionClosed)))
    async def start_binance_stream(self, stream):
        uri = f"wss://fstream.binance.com/stream?streams={stream}"
        ping_interval = 30  # 30초마다 핑 전송
        last_buffer_flush = asyncio.get_event_loop().time()
        while True:
            try:
                async with websockets.connect(uri, ping_interval=ping_interval) as websocket:
                    logger.info(f"Connected to Binance WebSocket stream: {uri}")
                    last_ping = asyncio.get_event_loop().time()
                    while True:
                        current_time = asyncio.get_event_loop().time()
                        if current_time - last_ping >= ping_interval:
                            await websocket.ping()
                            logger.info("Sent keepalive ping to Binance WebSocket")
                            last_ping = current_time

                        # 주기적으로 버퍼 플러시 (1초마다)
                        if current_time - last_buffer_flush >= 1:
                            await asyncio.sleep(0.1)  # 100ms 대기
                            for symbol in self.trade_volume_buffer:
                                trade_data = {
                                    'buy_volume': self.trade_volume_buffer[symbol]['buy_volume'],
                                    'sell_volume': self.trade_volume_buffer[symbol]['sell_volume'],
                                    'timestamp': timezone.now().isoformat(),
                                }
                                if trade_data['buy_volume'] > 0 or trade_data['sell_volume'] > 0:
                                    logger.info(f"Saving trade volume to Redis for {symbol}: {trade_data}")
                                    redis_client.setex(f"{symbol.lower()}_realtime_trade_volume", 60, json.dumps(trade_data))
                                    total_volume = trade_data['buy_volume'] + trade_data['sell_volume']
                                    await sync_to_async(TradeVolume.objects.create)(
                                        symbol=symbol,
                                        volume=total_volume,
                                        buy_volume=trade_data['buy_volume'],
                                        sell_volume=trade_data['sell_volume'],
                                        timestamp=timezone.datetime.fromisoformat(trade_data['timestamp'])
                                    )
                                    # WebSocket으로 tradeVolume 전송
                                    await self.channel_layer.group_send(
                                        f"realtime_{symbol.lower()}",
                                        {
                                            "type": "realtime_message",
                                            "message": {
                                                's': symbol,
                                                'e': 'trade',
                                                'tradeVolume': trade_data,
                                            }
                                        }
                                    )
                            self.trade_volume_buffer.clear()
                            last_buffer_flush = current_time

                        data = await asyncio.wait_for(websocket.recv(), timeout=ping_interval + 10)
                        data_json = json.loads(data)
                        if 'data' in data_json:
                            message = data_json['data']
                            symbol = message['s']
                            if message['e'] == 'depthUpdate':
                                redis_client.setex(f"{symbol.lower()}_orderbook", 60, json.dumps(message))
                                await sync_to_async(OrderBook.objects.create)(
                                    symbol=symbol,
                                    bids=message.get('b', []),
                                    asks=message.get('a', [])
                                )
                                await self.channel_layer.group_send(
                                    f"realtime_{symbol.lower()}",
                                    {
                                        "type": "realtime_message",
                                        "message": {
                                            's': symbol,
                                            'e': 'depthUpdate',
                                            'orderbook': message,
                                        }
                                    }
                                )
                            elif message['e'] == 'trade':
                                qty = float(message['q'])
                                is_buyer_maker = message.get('m', False)
                                self.trade_volume_buffer[symbol]['buy_volume'] += 0 if is_buyer_maker else qty
                                self.trade_volume_buffer[symbol]['sell_volume'] += qty if is_buyer_maker else 0
                                logger.debug(f"Trade buffer updated for {symbol}: {self.trade_volume_buffer[symbol]}")
                            elif message['e'] == 'forceOrder':
                                liquidation_data = {
                                    'last_liquidation': {
                                        'side': message['o']['S'],
                                        'price': float(message['o']['p']),
                                        'quantity': float(message['o']['q']),
                                        'timestamp': message['E'],
                                    }
                                }
                                redis_client.setex(f"{symbol.lower()}_liquidation", 60, json.dumps(liquidation_data))
                                await sync_to_async(Liquidation.objects.create)(
                                    symbol=symbol,
                                    side=liquidation_data['last_liquidation']['side'],
                                    price=liquidation_data['last_liquidation']['price'],
                                    quantity=liquidation_data['last_liquidation']['quantity'],
                                    timestamp=timezone.datetime.fromtimestamp(message['E'] / 1000, tz=timezone.utc)
                                )
                                await self.channel_layer.group_send(
                                    f"realtime_{symbol.lower()}",
                                    {
                                        "type": "realtime_message",
                                        "message": {
                                            's': symbol,
                                            'e': 'forceOrder',
                                            'liquidation': liquidation_data,
                                        }
                                    }
                                )
                            logger.info(f"Received data from Binance WebSocket: {message}")
            except websockets.exceptions.ConnectionClosedOK:
                logger.info("Binance WebSocket connection closed gracefully. Reconnecting in 5s...")
                await asyncio.sleep(5)
            except (ConnectionError, TimeoutError, websockets.ConnectionClosed) as e:
                logger.error(f"Binance WebSocket connection error: {e}. Reconnecting in 10s...")
                await asyncio.sleep(10)
            except Exception as e:
                logger.error(f"Unhandled error in Binance WebSocket: {e}. Reconnecting in 10s...")
                await asyncio.sleep(10)

    async def realtime_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))

class EchoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        logger.info("EchoConsumer connected")

    async def disconnect(self, close_code):
        logger.info(f"EchoConsumer disconnected with code: {close_code}")

    async def receive(self, text_data):
        logger.info(f"EchoConsumer received: {text_data}")
        await self.send(text_data=text_data)