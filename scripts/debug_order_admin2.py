import os
import traceback

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "startup.settings")

import django

django.setup()

from django.contrib.auth import get_user_model
from django.test import Client

u = get_user_model().objects.filter(is_superuser=True).first()
c = Client()
c.force_login(u)
try:
    r = c.get("/admin/store/order/5/change/")
    print("status", r.status_code)
    if r.status_code >= 400:
        print(r.content[:3000].decode("utf-8", "replace"))
    else:
        print("ok len", len(r.content))
except Exception:
    traceback.print_exc()
