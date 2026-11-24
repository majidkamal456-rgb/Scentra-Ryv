from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0005_order_flaship_booking'),
    ]

    operations = [
        migrations.CreateModel(
            name='StoreSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'flaship_pickup_id',
                    models.PositiveIntegerField(
                        blank=True,
                        help_text='Flaship pickup location used for shipment booking. Leave empty to auto-use the only / default pickup.',
                        null=True,
                    ),
                ),
                (
                    'flaship_pickup_label',
                    models.CharField(
                        blank=True,
                        help_text='Cached label from Flaship (name · city).',
                        max_length=255,
                    ),
                ),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Store settings',
                'verbose_name_plural': 'Store settings',
            },
        ),
    ]
