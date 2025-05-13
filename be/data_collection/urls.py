# data_collection/urls.py
from django.urls import path
from .views import (
    RealtimeOrderBookView, RealtimeFundingRateView, RealtimeTradeVolumeView, RealtimeLiquidationView,
    HistoricalOrderBookView, HistoricalFundingRateView, HistoricalTradeVolumeView, HistoricalLiquidationView
)
from . import views

urlpatterns = [
    path('symbols/', views.SymbolListView.as_view(), name='symbol-list'),
    path('realtime/orderbook/', RealtimeOrderBookView.as_view(), name='realtime_orderbook'),
    path('realtime/funding_rate/', RealtimeFundingRateView.as_view(), name='realtime_funding_rate'),
    path('realtime/trade_volume/', RealtimeTradeVolumeView.as_view(), name='realtime_trade_volume'),
    path('realtime/liquidation/', RealtimeLiquidationView.as_view(), name='realtime_liquidation'),
    path('historical/orderbook/', HistoricalOrderBookView.as_view(), name='historical_orderbook'),
    path('historical/funding_rate/', HistoricalFundingRateView.as_view(), name='historical_funding_rate'),
    path('historical/trade_volume/', HistoricalTradeVolumeView.as_view(), name='historical_trade_volume'),
    path('historical/liquidation/', HistoricalLiquidationView.as_view(), name='historical_liquidation'),
]