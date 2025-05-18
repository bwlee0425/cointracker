from fastapi import FastAPI, WebSocket
import asyncio
import json
import logging
import redis
import websockets
from dotenv import load_dotenv
from pathlib import Path
from django.utils import timezone
from asgiref.sync import sync_to_async
from collections import defaultdict
from tenacity import retry, stop_after_attempt, wait_exponential
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()


from data_collection.models import OrderBook, Liquidation, TradeVolume

logger = logging.getLogger('data_collection')
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent / '.env')
redis_client = redis.Redis.from_url(os.getenv('REDIS_URL'))

app = FastAPI()

@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=4, max=10))
async def binance_orderbook():
    uri = "wss://fstream.binance.com/ws/btcusdt@depth"
    async with websockets.connect(uri) as websocket:
        logger.info(f"Connected to orderbook WebSocket: {uri}")
        while True:
            data = await websocket.recv()
            data_json = json.loads(data)
            try:
                redis_client.setex("btcusdt_orderbook", 10, json.dumps(data_json))
                await sync_to_async(OrderBook.objects.create)(
                    symbol="BTCUSDT",
                    bids=data_json.get("b", []),
                    asks=data_json.get("a", []),
                )
                logger.info(f"Saved orderbook for BTCUSDT at {timezone.now()}")
            except redis.RedisError as e:
                logger.error(f"Redis error: {e}")

@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=4, max=10))
async def binance_trades():
    uri = "wss://fstream.binance.com/ws/btcusdt@trade"
    buy_volume_buffer = defaultdict(float)
    sell_volume_buffer = defaultdict(float)
    async with websockets.connect(uri) as websocket:
        logger.info(f"Connected to trades WebSocket: {uri}")
        while True:
            data = await websocket.recv()
            trade_data = json.loads(data)
            is_buyer_maker = trade_data.get('m')
            quantity = float(trade_data.get('q', 0))
            timestamp = timezone.now().isoformat()
            if is_buyer_maker:
                sell_volume_buffer[timestamp] += quantity
            else:
                buy_volume_buffer[timestamp] += quantity
            if timezone.now().second % 1 == 0:
                total_buy_volume = sum(buy_volume_buffer.values())
                total_sell_volume = sum(sell_volume_buffer.values())
                volume_data = {
                    "buy_volume": total_buy_volume,
                    "sell_volume": total_sell_volume,
                    "timestamp": timestamp
                }
                try:
                    redis_client.setex("btcusdt_realtime_trade_volume", 10, json.dumps(volume_data))
                    await sync_to_async(TradeVolume.objects.create)(
                        symbol="BTCUSDT",
                        volume=total_buy_volume + total_sell_volume,
                        buy_volume=total_buy_volume,
                        sell_volume=total_sell_volume,
                    )
                    buy_volume_buffer.clear()
                    sell_volume_buffer.clear()
                    logger.debug(f"Saved trade volume to Redis: {volume_data}")
                except redis.RedisError as e:
                    logger.error(f"Redis error: {e}")

@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=4, max=10))
async def binance_liquidation():
    uri = "wss://fstream.binance.com/ws/btcusdt@forceOrder"
    async with websockets.connect(uri) as websocket:
        logger.info(f"Connected to liquidation WebSocket: {uri}")
        while True:
            data = await websocket.recv()
            data_json = json.loads(data)
            if 'o' in data_json and data_json['o']['s'] == 'BTCUSDT':
                side = data_json['o'].get('S', 'UNKNOWN')
                price = float(data_json['o'].get('p', 0))
                quantity = float(data_json['o'].get('q', 0))
                try:
                    redis_client.setex("btcusdt_liquidation", 10, json.dumps(data_json))
                    await sync_to_async(Liquidation.objects.create)(
                        symbol="BTCUSDT",
                        side=side,
                        price=price,
                        quantity=quantity,
                    )
                    logger.info(f"Saved liquidation for BTCUSDT at {timezone.now()}")
                except redis.RedisError as e:
                    logger.error(f"Redis error: {e}")

@app.on_event("startup")
async def startup_event():
    # WebSocket 백그라운드 태스크 시작
    asyncio.create_task(binance_orderbook())
    asyncio.create_task(binance_trades())
    asyncio.create_task(binance_liquidation())

@app.websocket("/ws/orderbook")
async def ws_orderbook(websocket: WebSocket):
    await websocket.accept()
    uri = "wss://fstream.binance.com/ws/btcusdt@depth"
    async with websockets.connect(uri) as binance_ws:
        while True:
            data = await binance_ws.recv()
            await websocket.send_text(data)