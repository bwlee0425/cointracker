# config/asgi.py
import os
import django

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()  # ✅ Django 앱 초기화

from django.core.asgi import get_asgi_application
import data_collection.routing  # ✅ 안전하게 import

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            data_collection.routing.websocket_urlpatterns
        )
    ),
})
