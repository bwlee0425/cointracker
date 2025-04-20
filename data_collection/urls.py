from django.urls import path
from .views import OrderBookView

urlpatterns = [
    path('orderbook/<str:symbol>/', OrderBookView.as_view(), name='orderbook'),
]