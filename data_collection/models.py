from django.db import models

class OrderBook(models.Model):
    symbol = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
    bids = models.JSONField()  # 매수 호가
    asks = models.JSONField()  # 매도 호가

    class Meta:
        indexes = [
            models.Index(fields=['symbol', 'timestamp'])
        ]

    def __str__(self):
        return f"{self.symbol} - {self.timestamp}"