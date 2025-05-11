import logging
from datetime import timezone as dt_timezone
from pathlib import Path
from dotenv import load_dotenv
import os
import django
import redis
import json
from celery import shared_task
from binance.um_futures import UMFutures
from django.utils import timezone
from data_collection.models import FundingRate, OrderBook, OpenInterest

logger = logging.getLogger(__name__)

# Django 환경 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / '.env')

redis_client = redis.Redis.from_url(os.getenv('REDIS_URL'))
binance_client = UMFutures(
    key=os.getenv('BINANCE_API_KEY'),
    secret=os.getenv('BINANCE_SECRET_KEY')
)

@shared_task
def fetch_funding_rate():
    logger.debug("Starting fetch_funding_rate task")
    try:
        funding_info = binance_client.funding_rate(symbol="BTCUSDT", limit=1)
        if not funding_info:
            logger.error("No funding info returned")
            return
        funding_data = funding_info[0]
        funding_rate = float(funding_data['fundingRate'])
        funding_time = timezone.datetime.fromtimestamp(funding_data['fundingTime'] / 1000, tz=dt_timezone.utc)
        FundingRate.objects.create(
            symbol="BTCUSDT",
            funding_rate=funding_rate,
            funding_time=funding_time,
        )
        redis_client.setex("btcusdt_funding_rate", 3600, json.dumps(funding_data, default=str))
        logger.info(f"Saved funding rate for BTCUSDT at {timezone.now()}")
    except Exception as e:
        logger.error(f"Funding rate task failed: {e}", exc_info=True)
        raise

@shared_task
def fetch_open_interest():
    logger.debug("Starting fetch_open_interest task")
    try:
        oi_data = binance_client.open_interest(symbol="BTCUSDT")
        if not oi_data:
            logger.error("No open interest data returned")
            return
        open_interest = float(oi_data['openInterest'])
        OpenInterest.objects.create(
            symbol="BTCUSDT",
            open_interest=open_interest,
        )
        redis_client.setex("btcusdt_open_interest", 3600, json.dumps(oi_data, default=str))
        logger.info(f"Saved open interest for BTCUSDT at {timezone.now()}")
    except Exception as e:
        logger.error(f"Open interest task failed: {e}", exc_info=True)
        raise

@shared_task
def fetch_orderbook():
    logger.debug("Starting fetch_orderbook task")
    try:
        orderbook = binance_client.depth(symbol="BTCUSDT", limit=10)
        if not orderbook:
            logger.error("No orderbook data returned")
            return
        bids = [[float(price), float(quantity)] for price, quantity in orderbook.get('bids', [])]
        asks = [[float(price), float(quantity)] for price, quantity in orderbook.get('asks', [])]
        OrderBook.objects.create(
            symbol="BTCUSDT",
            bids=bids,
            asks=asks,
        )
        redis_client.setex("btcusdt_orderbook", 3600, json.dumps(orderbook, default=str))
        logger.info(f"Saved orderbook for BTCUSDT at {timezone.now()}")
    except Exception as e:
        logger.error(f"Orderbook task failed: {e}", exc_info=True)
        raise