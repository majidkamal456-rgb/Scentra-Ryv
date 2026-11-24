from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0006_storesettings'),
    ]

    operations = [
        migrations.CreateModel(
            name='FlashipCnAudit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tracking_number', models.CharField(db_index=True, max_length=64, unique=True)),
                ('order_number', models.CharField(blank=True, db_index=True, max_length=32)),
                ('external_ref_no', models.CharField(blank=True, max_length=64)),
                ('courier_code', models.CharField(blank=True, max_length=32)),
                ('shipment_status', models.CharField(blank=True, max_length=40)),
                ('finance_status', models.CharField(blank=True, max_length=40)),
                ('settlement_status', models.CharField(blank=True, db_index=True, max_length=40)),
                ('settlement_date', models.CharField(blank=True, max_length=32)),
                ('cheque_no', models.CharField(blank=True, max_length=64)),
                ('arrival_weight', models.CharField(blank=True, max_length=20)),
                ('cod_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('paid_amount', models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ('line_net', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('delivery_charges', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('service_charges', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('osa_charges', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('core_charges', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('income_tax', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('withholding_tax', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                (
                    'total_charges',
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        help_text='Total charges billed on the CN by courier/Flaship.',
                        max_digits=12,
                    ),
                ),
                (
                    'customer_shipping',
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        help_text='Delivery charges collected from customer on the store order.',
                        max_digits=12,
                    ),
                ),
                ('order_subtotal', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('order_total', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                (
                    'shipping_profit',
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        help_text='customer_shipping − total_charges',
                        max_digits=12,
                    ),
                ),
                (
                    'shipping_margin_pct',
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        help_text='Shipping profit ÷ customer shipping × 100 (or -100 if free ship + courier cost).',
                        max_digits=8,
                    ),
                ),
                (
                    'contribution_profit',
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        help_text='order_subtotal − total_charges (product revenue after courier cost)',
                        max_digits=12,
                    ),
                ),
                (
                    'contribution_margin_pct',
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        help_text='contribution_profit ÷ order_subtotal × 100',
                        max_digits=8,
                    ),
                ),
                ('raw_payload', models.JSONField(blank=True, default=dict)),
                ('synced_at', models.DateTimeField(auto_now=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'order',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='flaship_audits',
                        to='store.order',
                    ),
                ),
            ],
            options={
                'verbose_name': 'Flaship CN audit',
                'verbose_name_plural': 'Flaship CN audits',
                'ordering': ['-synced_at'],
            },
        ),
    ]
