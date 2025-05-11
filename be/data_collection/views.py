# data_collection/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
import redis
import json
from .models import OrderBook, FundingRate, TradeVolume, Liquidation
from .serializers import OrderBookSerializer, FundingRateSerializer, TradeVolumeSerializer, LiquidationSerializer
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample
from datetime import datetime

redis_client = redis.Redis.from_url(settings.REDIS_URL)

class RealtimeOrderBookView(APIView):
    @extend_schema(
        summary="Get real-time order book",
        description="Fetches the latest order book data for the specified symbol (default: BTCUSDT) from Redis.",
        tags=['realtime', 'orderbook'],
        responses={
            200: OpenApiResponse(description="Order book data", examples=[
                OpenApiExample(
                    name="Successful response",
                    value={"bids": [[50000.0, 1.5]], "asks": [[50001.0, 1.2]]},
                    media_type="application/json"
                )
            ]),
            404: OpenApiResponse(description="Order book data not found", examples=[
                OpenApiExample(
                    name="Not found",
                    value={"status": "no_realtime_data", "message": "No orderbook data available"},
                    media_type="application/json"
                )
            ])
        },
        parameters=[
            {
                'name': 'symbol',
                'in': 'query',
                'description': 'Symbol to fetch order book for (e.g., BTCUSDT)',
                'required': False,
                'type': 'string',
            }
        ],
        extensions={
            'x-code-samples': [
                {'lang': 'cURL', 'source': 'curl http://localhost:8000/api/realtime/orderbook/?symbol=BTCUSDT'},
                {'lang': 'Python', 'source': 'import requests\nresponse = requests.get("http://localhost:8000/api/realtime/orderbook/?symbol=BTCUSDT")\nprint(response.json())'},
            ]
        }
    )
    def get(self, request):
        symbol = request.query_params.get('symbol', 'BTCUSDT').upper()
        orderbook = redis_client.get(f"{symbol.lower()}_orderbook")
        if orderbook:
            return Response(json.loads(orderbook))
        return Response({"status": "no_realtime_data", "message": "No orderbook data available"}, status=404)

class RealtimeFundingRateView(APIView):
    @extend_schema(
        summary="Get real-time funding rate",
        description="Fetches the latest funding rate data for the specified symbol (default: BTCUSDT) from Redis.",
        tags=['realtime', 'funding_rate'],
        responses={
            200: OpenApiResponse(description="Funding rate data", examples=[
                OpenApiExample(
                    name="Successful response",
                    value={"f": 0.0001, "T": 1697059200000},
                    media_type="application/json"
                )
            ]),
            404: OpenApiResponse(description="Funding rate data not found", examples=[
                OpenApiExample(
                    name="Not found",
                    value={"status": "no_realtime_data", "message": "No funding rate data available"},
                    media_type="application/json"
                )
            ])
        },
        parameters=[
            {
                'name': 'symbol',
                'in': 'query',
                'description': 'Symbol to fetch funding rate for (e.g., BTCUSDT)',
                'required': False,
                'type': 'string',
            }
        ],
        extensions={
            'x-code-samples': [
                {'lang': 'cURL', 'source': 'curl http://localhost:8000/api/realtime/funding_rate/?symbol=BTCUSDT'},
                {'lang': 'Python', 'source': 'import requests\nresponse = requests.get("http://localhost:8000/api/realtime/funding_rate/?symbol=BTCUSDT")\nprint(response.json())'},
            ]
        }
    )
    def get(self, request):
        symbol = request.query_params.get('symbol', 'BTCUSDT').upper()
        funding_rate = redis_client.get(f"{symbol.lower()}_funding_rate")
        if funding_rate:
            return Response(json.loads(funding_rate))
        return Response({"status": "no_realtime_data", "message": "No funding rate data available"}, status=404)

class RealtimeTradeVolumeView(APIView):
    @extend_schema(
        summary="Get real-time trade volume",
        description="Fetches the latest real-time trade volume data for the specified symbol (default: BTCUSDT) from Redis.",
        tags=['realtime', 'trade_volume'],
        responses={
            200: OpenApiResponse(description="Real-time trade volume data", examples=[
                OpenApiExample(
                    name="Successful response",
                    value={"buy_volume": 10.5, "sell_volume": 8.3, "timestamp": "2025-04-21T05:00:00Z"},
                    media_type="application/json"
                )
            ]),
            404: OpenApiResponse(description="Real-time trade volume data not found", examples=[
                OpenApiExample(
                    name="Not found",
                    value={"status": "no_realtime_data", "message": "No trade volume data available"},
                    media_type="application/json"
                )
            ])
        },
        parameters=[
            {
                'name': 'symbol',
                'in': 'query',
                'description': 'Symbol to fetch trade volume for (e.g., BTCUSDT)',
                'required': False,
                'type': 'string',
            }
        ],
        extensions={
            'x-code-samples': [
                {'lang': 'cURL', 'source': 'curl http://localhost:8000/api/realtime/trade_volume/?symbol=BTCUSDT'},
                {'lang': 'Python', 'source': 'import requests\nresponse = requests.get("http://localhost:8000/api/realtime/trade_volume/?symbol=BTCUSDT")\nprint(response.json())'},
            ]
        }
    )
    def get(self, request):
        symbol = request.query_params.get('symbol', 'BTCUSDT').upper()
        trade_volume = redis_client.get(f"{symbol.lower()}_realtime_trade_volume")
        if trade_volume:
            return Response(json.loads(trade_volume))
        return Response({"status": "no_realtime_data", "message": "No trade volume data available"}, status=404)

class RealtimeLiquidationView(APIView):
    @extend_schema(
        summary="Get real-time liquidation data",
        description="Fetches the latest liquidation data for the specified symbol (default: BTCUSDT) from Redis. If no real-time data is available, returns the latest liquidation from PostgreSQL with a status message.",
        tags=['realtime', 'liquidation'],
        responses={
            200: OpenApiResponse(description="Liquidation data or latest historical data", examples=[
                OpenApiExample(
                    name="Real-time data",
                    value={"status": "success", "data": {"o": {"S": "BUY", "p": 50000.0, "q": 1.0}}},
                    media_type="application/json"
                ),
                OpenApiExample(
                    name="No real-time data",
                    value={"status": "no_realtime_data", "message": "No real-time liquidation data available", "last_liquidation": {"symbol": "BTCUSDT", "side": "BUY", "price": 50000.0, "quantity": 1.0}},
                    media_type="application/json"
                )
            ]),
        },
        parameters=[
            {
                'name': 'symbol',
                'in': 'query',
                'description': 'Symbol to fetch liquidation for (e.g., BTCUSDT)',
                'required': False,
                'type': 'string',
            }
        ],
        extensions={
            'x-code-samples': [
                {'lang': 'cURL', 'source': 'curl http://localhost:8000/api/realtime/liquidation/?symbol=BTCUSDT'},
                {'lang': 'Python', 'source': 'import requests\nresponse = requests.get("http://localhost:8000/api/realtime/liquidation/?symbol=BTCUSDT")\nprint(response.json())'},
            ]
        }
    )
    def get(self, request):
        symbol = request.query_params.get('symbol', 'BTCUSDT').upper()
        liquidation = redis_client.get(f"{symbol.lower()}_liquidation")
        if liquidation:
            return Response({"status": "success", "data": json.loads(liquidation)})

        # Redis 데이터 없으면 PostgreSQL에서 최신 데이터 조회
        last_liquidation = Liquidation.objects.filter(symbol=symbol).order_by('-timestamp').first()
        response_data = {
            "status": "no_realtime_data",
            "message": "No real-time liquidation data available",
            "last_liquidation": LiquidationSerializer(last_liquidation).data if last_liquidation else None
        }
        return Response(response_data)

# Historical*View와 DataStatusView는 수정 제안이 없으므로 그대로 유지
class HistoricalOrderBookView(APIView):
    @extend_schema(
        summary="Get historical BTCUSDT order book data",
        description="Fetches the latest 5 order book records for BTCUSDT from PostgreSQL.",
        tags=['historical', 'orderbook'],
        responses={
            200: OrderBookSerializer(many=True),
        }
    )
    def get(self, request):
        orderbooks = OrderBook.objects.filter(symbol="BTCUSDT").order_by('-timestamp')[:5]
        serializer = OrderBookSerializer(orderbooks, many=True)
        return Response(serializer.data)

class HistoricalFundingRateView(APIView):
    @extend_schema(
        summary="Get historical BTCUSDT funding rate data",
        description="Fetches the latest 5 funding rate records for BTCUSDT from PostgreSQL.",
        tags=['historical', 'funding_rate'],
        responses={
            200: FundingRateSerializer(many=True),
        }
    )
    def get(self, request):
        funding_rates = FundingRate.objects.filter(symbol="BTCUSDT").order_by('-timestamp')[:5]
        serializer = FundingRateSerializer(funding_rates, many=True)
        return Response(serializer.data)

class HistoricalTradeVolumeView(APIView):
    @extend_schema(
        summary="Get historical BTCUSDT trade volume data",
        description="Fetches the latest 5 trade volume records for BTCUSDT from PostgreSQL.",
        tags=['historical', 'trade_volume'],
        responses={
            200: TradeVolumeSerializer(many=True),
        }
    )
    def get(self, request):
        trade_volumes = TradeVolume.objects.filter(symbol="BTCUSDT").order_by('-timestamp')[:5]
        serializer = TradeVolumeSerializer(trade_volumes, many=True)
        return Response(serializer.data)

class HistoricalLiquidationView(APIView):
    @extend_schema(
        summary="Get historical BTCUSDT liquidation data",
        description="Fetches the latest 5 liquidation records for BTCUSDT from PostgreSQL.",
        tags=['historical', 'liquidation'],
        responses={
            200: LiquidationSerializer(many=True),
        }
    )
    def get(self, request):
        liquidations = Liquidation.objects.filter(symbol="BTCUSDT").order_by('-timestamp')[:5]
        serializer = LiquidationSerializer(liquidations, many=True)
        return Response(serializer.data)

class DataStatusView(APIView):
    def get(self, request):
        response_data = {"status": "ok", "data_details": []}
        try:
            keys = redis_client.keys("btcusdt_*")
            if keys:
                for key in keys:
                    key_str = key.decode()
                    data_type = redis_client.type(key).decode()
                    data_value = redis_client.get(key)
                    last_update = None

                    # 데이터가 JSON 형태이고 'timestamp' 키를 포함하고 있다면 마지막 업데이트 시간 추출 시도
                    if data_type == "string":
                        try:
                            parsed_data = json.loads(data_value.decode())
                            if "timestamp" in parsed_data:
                                # 타임스탬프 형태에 따라 적절히 변환 (예: Unix timestamp)
                                if isinstance(parsed_data["timestamp"], (int, float)):
                                    last_update = datetime.fromtimestamp(parsed_data["timestamp"]).isoformat()
                                elif isinstance(parsed_data["timestamp"], str):
                                    # ISO 형식 등 다른 문자열 형식이면 그대로 사용하거나 필요에 따라 파싱
                                    last_update = parsed_data["timestamp"]
                        except json.JSONDecodeError:
                            pass  # JSON 형식이 아니면 무시

                    response_data["data_details"].append({
                        "key": key_str,
                        "type": data_type,
                        "last_update": last_update,
                        # 필요하다면 데이터의 일부를 미리보기 형식으로 포함할 수도 있습니다.
                        "preview": data_value.decode()[:50] + "..." if data_value else None
                    })
                response_data["message"] = f"{len(keys)}개의 데이터 상세 정보입니다."
                return Response(response_data)
            else:
                return Response({"status": "warning", "message": "확인된 데이터가 없습니다."}, status=204)
        except redis.RedisError as e:
            return Response({"status": "error", "error": str(e)}, status=503)