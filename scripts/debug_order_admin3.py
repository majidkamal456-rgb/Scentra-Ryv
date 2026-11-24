import os
import traceback

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "startup.settings")

import django

django.setup()

from django.contrib.auth import get_user_model
from django.test import Client

u = get_user_model().objects.filter(is_superuser=True).first()
c = Client(HTTP_HOST="scentraryv.pk")
c.force_login(u)

for path in (
    "/admin/store/order/",
    "/admin/store/order/5/change/",
    "/admin/",
):
    try:
        r = c.get(path)
        print(path, "->", r.status_code)
        if r.status_code >= 500:
            print(r.content[:4000].decode("utf-8", "replace"))
    except Exception:
        print(path, "EXCEPTION")
        traceback.print_exc()

# Field presence
from store.models import Order

fields = [f.name for f in Order._meta.get_fields()]
needed = [
    "payment_screenshot",
    "flaship_tracking_number",
    "flaship_booking_error",
    "free_tester",
    "free_tester_name",
]
print("fields_ok", {k: k in fields for k in needed})
