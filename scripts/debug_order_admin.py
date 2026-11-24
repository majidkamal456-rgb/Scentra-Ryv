import os
import traceback

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "startup.settings")

import django

django.setup()

from django.contrib.auth import get_user_model
from django.test import RequestFactory
from django.contrib.admin.sites import site

from store.models import Order
from store.admin import OrderAdmin

o = Order.objects.filter(pk=5).first()
print("order", o)
if o:
    print("number", o.order_number, "pay", o.payment_method, "status", o.status)
    print("screenshot", bool(o.payment_screenshot))
    try:
        print("screenshot_url", o.payment_screenshot.url if o.payment_screenshot else None)
    except Exception:
        traceback.print_exc()

admin = OrderAdmin(Order, site)
rf = RequestFactory()
User = get_user_model()
user = User.objects.filter(is_superuser=True).first()
req = rf.get("/admin/store/order/5/change/")
req.user = user

try:
    resp = admin.changeform_view(req, object_id="5")
    print("status_code", getattr(resp, "status_code", type(resp)))
except Exception:
    traceback.print_exc()
