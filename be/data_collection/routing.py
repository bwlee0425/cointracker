# cointracker/be/data_collection/routing.py
from django.urls import re_path
from .consumers import RealtimeDataConsumer

websocket_urlpatterns = [
    re_path(r'ws/realtime/$', RealtimeDataConsumer.as_asgi()),
]