# Generated by Django 5.2 on 2025-05-04 10:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_collection', '0003_alter_fundingrate_table_alter_liquidation_table_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='orderbook',
            name='asks',
            field=models.JSONField(default=list),
        ),
        migrations.AlterField(
            model_name='orderbook',
            name='bids',
            field=models.JSONField(default=list),
        ),
    ]
