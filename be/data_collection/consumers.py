# cointracker/be/data_collection/consumers.py
import json
import logging
import asyncio
import websockets
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone
from asgiref.sync import sync_to_async
from data_collection.models import OrderBook
from redis import Redis
from binance.um_futures import UMFutures
import requests

logger = logging.getLogger('data_collection')

# Redis 클라이언트
redis_client = Redis.from_url(os.getenv('REDIS_URL'))

class RealtimeDataConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.binance = UMFutures(
            key=os.getenv('BINANCE_API_KEY'),
            secret=os.getenv('BINANCE_SECRET_KEY')
        )
        self.symbols = await self.get_symbols()
        self.ws_tasks = []
        for symbol in self.symbols:
            task = asyncio.create_task(self.stream_data(symbol))
            self.ws_tasks.append(task)

    async def get_symbols(self):
        res = requests.get('https://fapi.binance.com/fapi/v1/ticker/24hr')
        return [item['symbol'] for item in res.json() if item['symbol'].endswith('USDT')]

    async def stream_data(self, symbol):
        uri = f"wss://fstream.binance.com/ws/{symbol.lower()}@depth"
        try:
            async with websockets.connect(uri) as websocket:
                logger.info(f"Connected to WebSocket for {symbol}: {uri}")
                while True:
                    data = await websocket.recv()
                    data_json = json.loads(data)
                    symbol = data_json.get('s', symbol)  # 심볼 확인
                    await self.save_to_db_and_redis(symbol, data_json)
                    await self.send(text_data=json.dumps(data_json))
        except Exception as e:
            logger.error(f"WebSocket error for {symbol}: {e}")

    async def save_to_db_and_redis(self, symbol, data):
        bids = data.get('b', [])
        asks = data.get('a', [])
        redis_client.setex(f"{symbol.lower()}_orderbook", 10, json.dumps(data))
        await sync_to_async(OrderBook.objects.create)(
            symbol=symbol,
            bids=bids,
            asks=asks,
        )
        logger.info(f"Saved orderbook for {symbol} at {timezone.now()}")

    async def disconnect(self, close_code):
        for task in self.ws_tasks:
            task.cancel()
        logger.info("WebSocket disconnected")