import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('cointracker')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'fetch-funding-rate-every-5-min': {
        'task': 'data_collection.tasks.fetch_funding_rate',
        'schedule': crontab(minute='*/5'),
    },
    'fetch-open-interest-every-5-min': {
        'task': 'data_collection.tasks.fetch_open_interest',
        'schedule': crontab(minute='*/5'),
    },
    'fetch-orderbook-every-5-min': {
        'task': 'data_collection.tasks.fetch_orderbook',
        'schedule': crontab(minute='*/5'),
    },
}