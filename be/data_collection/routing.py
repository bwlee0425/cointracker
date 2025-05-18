# data_collection/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/realtime/$', consumers.RealtimeDataConsumer.as_asgi()),
    re_path(r'ws/echo/$', consumers.EchoConsumer.as_asgi()),  # 새로운 라우팅
]