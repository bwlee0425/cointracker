from django.core.management.base import BaseCommand
from django_celery_beat.models import PeriodicTask, IntervalSchedule

class Command(BaseCommand):
    help = 'Setup periodic tasks for Celery Beat'

    def handle(self, *args, **options):
        schedule, created = IntervalSchedule.objects.get_or_create(
            every=1,
            period=IntervalSchedule.MINUTES,
        )
        PeriodicTask.objects.get_or_create(
            interval=schedule,
            name='Fetch BTCUSDT funding rate every minute',
            task='data_collection.tasks.fetch_funding_rate',
        )
        self.stdout.write(self.style.SUCCESS('Periodic tasks setup completed'))