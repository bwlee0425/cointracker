from django.db import models

class FundingRate(models.Model):
    symbol = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
    funding_rate = models.FloatField()
    funding_time = models.DateTimeField()

    class Meta:
        db_table = 'data_collection_fundingrate'
        indexes = [models.Index(fields=['symbol', 'timestamp'])]

class OrderBook(models.Model):
    symbol = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
    bids = models.JSONField(default=list)  # 기본값 추가
    asks = models.JSONField(default=list)  # 기본값 추가

    class Meta:
        db_table = 'data_collection_orderbook'
        indexes = [models.Index(fields=['symbol', 'timestamp'])]

    def __str__(self):
        return f"{self.symbol} - {self.timestamp}"

class OpenInterest(models.Model):
    symbol = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
    open_interest = models.FloatField()

    class Meta:
        db_table = 'data_collection_openinterest'
        indexes = [models.Index(fields=['symbol', 'timestamp'])]

class Liquidation(models.Model):
    symbol = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
    side = models.CharField(max_length=10)  # LONG or SHORT
    quantity = models.FloatField()
    price = models.FloatField()

    class Meta:
        db_table = 'data_collection_liquidation'
        indexes = [models.Index(fields=['symbol', 'timestamp'])]

class TradeVolume(models.Model):
    symbol = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
    volume = models.FloatField()
    buy_volume = models.FloatField()
    sell_volume = models.FloatField()

    class Meta:
        db_table = 'data_collection_tradevolume'
        indexes = [models.Index(fields=['symbol', 'timestamp'])]