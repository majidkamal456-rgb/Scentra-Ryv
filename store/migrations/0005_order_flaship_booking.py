from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0004_order_free_tester'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='flaship_booking_id',
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name='order',
            name='flaship_tracking_number',
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name='order',
            name='flaship_courier_code',
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name='order',
            name='flaship_booking_status',
            field=models.CharField(blank=True, max_length=40),
        ),
        migrations.AddField(
            model_name='order',
            name='flaship_label_url',
            field=models.URLField(blank=True, max_length=500),
        ),
        migrations.AddField(
            model_name='order',
            name='flaship_booking_error',
            field=models.CharField(blank=True, max_length=500),
        ),
    ]
