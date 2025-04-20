import asyncio
import websockets
import json
import redis
from decouple import config
from models import OrderBook
from django.utils import timezone

# Redis 연결
redis_client = redis.Redis.from_url(config('REDIS_URL'))

async def binance_websocket():
    uri = "wss://fstream.binance.com/ws/btcusdt@depth"
    async with websockets.connect(uri) as websocket:
        while True:
            data = await websocket.recv()
            data_json = json.loads(data)
            # Redis에 캐싱 (1분 TTL)
            redis_client.setex("btcusdt_orderbook", 60, json.dumps(data_json))
            # PostgreSQL에 저장
            OrderBook.objects.create(
                symbol="BTCUSDT",
                bids=data_json.get("bids", []),
                asks=data_json.get("asks", []),
            )
            print(f"Saved orderbook for BTCUSDT at {timezone.now()}")

def run_websocket():
    asyncio.run(binance_websocket())

if __name__ == "__main__":
    run_websocket()