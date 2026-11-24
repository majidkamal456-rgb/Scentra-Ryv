import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "startup.settings")
django.setup()

from store.flaship import sync_payment_audits
from store.models import FlashipCnAudit

result = sync_payment_audits()
print(result)
print("audits", FlashipCnAudit.objects.count())
for a in FlashipCnAudit.objects.all()[:10]:
    print(
        a.tracking_number,
        a.shipment_status,
        a.total_charges,
        a.cod_amount,
        a.settlement_status,
    )
