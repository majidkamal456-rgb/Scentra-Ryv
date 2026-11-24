from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0003_merge_size_ml_and_reviews'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='free_tester',
            field=models.ForeignKey(
                blank=True,
                help_text='Free tester perfume chosen with this order (Buy 1 Get Free Tester offer).',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='free_tester_orders',
                to='store.product',
            ),
        ),
        migrations.AddField(
            model_name='order',
            name='free_tester_name',
            field=models.CharField(
                blank=True,
                help_text='Snapshot of free tester product name at order time.',
                max_length=200,
            ),
        ),
    ]
