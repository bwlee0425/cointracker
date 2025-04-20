from rest_framework.views import APIView
from rest_framework.response import Response
from .models import OrderBook
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

class OrderBookView(APIView):
    def get(self, request, symbol="btcusdt"):
        # Redis에서 최신 오더북 데이터 조회
        data = redis_client.get(f"{symbol}_orderbook")
        if data:
            return Response(json.loads(data))
        return Response({"error": "No data available"}, status=404)