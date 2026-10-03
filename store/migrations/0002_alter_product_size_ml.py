# Matches the migration already present on production.
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='size_ml',
            field=models.CharField(default='50ml', max_length=20),
        ),
    ]
