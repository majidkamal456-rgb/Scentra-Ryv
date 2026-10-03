# Merge the two 0002 leaf nodes so migrate can proceed.
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0002_alter_product_size_ml'),
        ('store', '0002_product_reviews'),
    ]

    operations = []
