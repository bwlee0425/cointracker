# data_collection/serializers.py
from rest_framework import serializers
from .models import OrderBook, FundingRate, TradeVolume, Liquidation

class OrderBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderBook
        fields = ['symbol', 'timestamp', 'bids', 'asks']

class FundingRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundingRate
        fields = ['symbol', 'funding_rate', 'funding_time', 'timestamp']

class TradeVolumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradeVolume
        fields = ['symbol', 'buy_volume', 'sell_volume', 'timestamp']

class LiquidationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Liquidation
        fields = ['symbol', 'side', 'price', 'quantity', 'timestamp']