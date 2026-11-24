"""Flaship Partners integration — cities, pickups, and shipment booking."""

from __future__ import annotations

import logging
from decimal import Decimal
from typing import Any

import requests
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

CITIES_CACHE_KEY = "flaship:integration_cities:v1"
PICKUPS_CACHE_KEY = "flaship:integration_pickups:v1"
CACHE_TTL = 60 * 60  # 1 hour

# Prefer Leopard for free-shipping cities; then common carriers
COURIER_PRIORITY = (
    "leopard",
    "tcs",
    "mnp",
    "trax",
    "daewoo",
    "daak",
    "tranzo",
    "dastaq",
    "dex",
    "alfa",
    "ahl",
)


def _api_key() -> str:
    return (getattr(settings, "FLASHIP_API_KEY", "") or "").strip()


def _headers(*, json_body: bool = False) -> dict[str, str]:
    headers = {"X-API-KEY": _api_key(), "Accept": "application/json"}
    if json_body:
        headers["Content-Type"] = "application/json"
    return headers


def _base() -> str:
    return (
        getattr(settings, "FLASHIP_API_BASE", "") or "https://partners.flaship.pk"
    ).rstrip("/")


def _cities_url() -> str:
    return getattr(
        settings,
        "FLASHIP_CITIES_URL",
        f"{_base()}/api/integration/cities/",
    )


def _pickups_url() -> str:
    return getattr(
        settings,
        "FLASHIP_PICKUPS_URL",
        f"{_base()}/api/integration/pickups/",
    )


def _bookings_url() -> str:
    return getattr(
        settings,
        "FLASHIP_BOOKINGS_URL",
        f"{_base()}/api/integration/bookings/",
    )


def _payments_url() -> str:
    return getattr(
        settings,
        "FLASHIP_PAYMENTS_URL",
        f"{_base()}/api/integration/payments/",
    )


def fetch_flaship_cities(*, force: bool = False, q: str | None = None) -> list[dict[str, Any]]:
    """Return normalized operational cities. Prefer city['name'] in booking payloads."""
    cache_key = CITIES_CACHE_KEY if not q else f"{CITIES_CACHE_KEY}:q:{q.lower()}"
    if not force:
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

    key = _api_key()
    if not key:
        logger.warning("FLASHIP_API_KEY missing — city list unavailable")
        return []

    params = {"q": q} if q else {}
    try:
        res = requests.get(
            _cities_url(),
            headers=_headers(),
            params=params,
            timeout=25,
        )
        res.raise_for_status()
        payload = res.json()
    except Exception:
        logger.exception("Flaship cities fetch failed")
        return []

    if not payload.get("success"):
        logger.error("Flaship cities error: %s", payload)
        return []

    cities = list(payload.get("cities") or [])
    cache.set(cache_key, cities, CACHE_TTL)
    if not q:
        cache.set(CITIES_CACHE_KEY, cities, CACHE_TTL)
    return cities


def fetch_pickups(*, force: bool = False) -> list[dict[str, Any]]:
    """GET /api/integration/pickups/ — merchant pickup locations."""
    if not force:
        cached = cache.get(PICKUPS_CACHE_KEY)
        if cached is not None:
            return cached

    if not _api_key():
        return []

    try:
        res = requests.get(_pickups_url(), headers=_headers(), timeout=20)
        res.raise_for_status()
        payload = res.json()
    except Exception:
        logger.exception("Flaship pickups fetch failed")
        return []

    if not payload.get("success"):
        logger.error("Flaship pickups error: %s", payload)
        return []

    pickups = list(payload.get("pickups") or payload.get("pickup_locations") or [])
    cache.set(PICKUPS_CACHE_KEY, pickups, CACHE_TTL)
    return pickups


def _pickup_choice_id() -> int | None:
    """Admin StoreSettings first, then optional env FLASHIP_PICKUP_ID."""
    try:
        from .models import StoreSettings

        settings_obj = StoreSettings.load()
        if settings_obj.flaship_pickup_id:
            return int(settings_obj.flaship_pickup_id)
    except Exception:
        logger.exception("Could not read StoreSettings pickup")

    configured = (getattr(settings, "FLASHIP_PICKUP_ID", "") or "").strip()
    if configured:
        try:
            return int(configured)
        except (TypeError, ValueError):
            return None
    return None


def resolve_pickup(pickups: list[dict[str, Any]] | None = None) -> dict[str, Any] | None:
    """
    Choose pickup for booking (never exposed on checkout UI):
    - Django admin StoreSettings.flaship_pickup_id if set and valid
    - else 1 live pickup → that one
    - else is_default=True, else first
    """
    rows = pickups if pickups is not None else fetch_pickups(force=True)
    if not rows:
        return None

    want = _pickup_choice_id()
    if want is not None:
        for p in rows:
            try:
                if int(p.get("id")) == want:
                    return p
            except (TypeError, ValueError):
                continue
        logger.warning(
            "Configured pickup_id=%s not in live Flaship pickups — using dynamic default",
            want,
        )

    if len(rows) == 1:
        return rows[0]

    for p in rows:
        if p.get("is_default"):
            return p
    return rows[0]


def pickup_admin_choices() -> list[tuple[int, str]]:
    """(id, label) for Django admin dropdown."""
    choices: list[tuple[int, str]] = []
    for p in fetch_pickups(force=True):
        try:
            pid = int(p.get("id"))
        except (TypeError, ValueError):
            continue
        name = p.get("name") or f"Pickup {pid}"
        city = p.get("city") or ""
        default = " · default" if p.get("is_default") else ""
        label = f"{name} · {city} (#{pid}){default}" if city else f"{name} (#{pid}){default}"
        choices.append((pid, label))
    return choices


def get_default_pickup_id() -> int | None:
    pickup = resolve_pickup()
    if not pickup:
        return None
    try:
        return int(pickup["id"])
    except (TypeError, ValueError, KeyError):
        return None


def city_has_leopard(city_row: dict[str, Any]) -> bool:
    for courier in city_row.get("couriers") or []:
        if str(courier.get("code") or "").lower() == "leopard":
            return True
    return False


def fetch_leopard_cities(*, force: bool = False) -> list[dict[str, Any]]:
    """Flaship cities endpoint filtered to Leopard courier only."""
    return [row for row in fetch_flaship_cities(force=force) if city_has_leopard(row)]


def normalize_city_name(value: str) -> str:
    if not value:
        return ""
    cleaned = "".join(ch.lower() if ch.isalnum() or ch.isspace() else " " for ch in str(value))
    return " ".join(cleaned.split())


def is_punjab_city_name(name: str) -> bool:
    """Punjab / ICT check via store.shipping allowlist (no free just for saying Punjab)."""
    from .shipping import is_nearby_city

    return is_nearby_city(name or "")


def city_qualifies_free_shipping(city_row: dict[str, Any]) -> bool:
    """Free DC only for Leopard-mapped Punjab / ICT cities from Flaship."""
    if not city_has_leopard(city_row):
        return False
    label = city_row.get("name") or city_row.get("normalized_name") or ""
    return is_punjab_city_name(str(label))


def find_city_by_name(name: str, cities: list[dict[str, Any]] | None = None) -> dict[str, Any] | None:
    needle = normalize_city_name(name)
    if not needle:
        return None
    rows = cities if cities is not None else fetch_flaship_cities()
    compact = needle.replace(" ", "")

    for row in rows:
        candidates = {
            normalize_city_name(row.get("name") or ""),
            normalize_city_name(row.get("normalized_name") or ""),
        }
        if needle in candidates:
            return row
        for c in candidates:
            if c and c.replace(" ", "") == compact:
                return row
    return None


def is_leopard_service_city(city: str, address: str | None = None) -> bool:
    """True when Flaship maps Leopard to this city (any province)."""
    rows = fetch_leopard_cities()
    if not rows:
        return False

    row = find_city_by_name(city, rows)
    if row:
        return True

    if address:
        addr = normalize_city_name(address)
        for row in rows:
            label = normalize_city_name(row.get("name") or "")
            if label and len(label) >= 4 and label in addr:
                return True
    return False


def is_free_shipping_city(city: str, address: str | None = None) -> bool:
    """
    Free shipping: city must appear on Flaship with Leopard AND be Punjab/ICT.

    Karachi/Peshawar with Leopard → paid. Lahore/Faisalabad with Leopard → free.
    """
    leopard_rows = fetch_leopard_cities()
    if not leopard_rows:
        # Offline fallback — static Punjab allowlist only
        from .shipping import is_nearby_city

        return is_nearby_city(city or "", address)

    row = find_city_by_name(city, leopard_rows)
    if row and city_qualifies_free_shipping(row):
        return True

    if address:
        addr = normalize_city_name(address)
        for row in leopard_rows:
            if not city_qualifies_free_shipping(row):
                continue
            label = normalize_city_name(row.get("name") or "")
            if label and len(label) >= 4 and label in addr:
                return True
    return False


def shipping_city_options(*, leopard_only: bool = True) -> list[dict[str, Any]]:
    """
    Checkout city list from Flaship GET /cities/.

    Default: Leopard cities only.
    Free shipping (DC 0) = Leopard + Punjab/ICT.
    Everyone else on the list = SHIPPING_OTHER_RATE (Rs. 200–250).
    """
    free_rate = str(getattr(settings, "SHIPPING_NEARBY_RATE", "0.00"))
    paid_rate = str(getattr(settings, "SHIPPING_OTHER_RATE", "200.00"))
    source = fetch_leopard_cities() if leopard_only else fetch_flaship_cities()
    options = []
    for row in source:
        leopard = city_has_leopard(row)
        free = city_qualifies_free_shipping(row)
        options.append(
            {
                "id": row.get("id"),
                "name": row.get("name"),
                "normalized_name": row.get("normalized_name")
                or normalize_city_name(row.get("name") or ""),
                "has_leopard": leopard,
                "is_punjab": is_punjab_city_name(str(row.get("name") or "")),
                "free_shipping": free,
                "shipping": free_rate if free else paid_rate,
                "couriers": [
                    {
                        "code": c.get("code"),
                        "name": c.get("name"),
                        "courier_city_name": c.get("courier_city_name"),
                        "terminal_code": c.get("terminal_code"),
                    }
                    for c in (row.get("couriers") or [])
                    if str(c.get("code") or "").lower() == "leopard" or not leopard_only
                ],
            }
        )
    options.sort(key=lambda c: ((not c["free_shipping"]), (c["name"] or "").lower()))
    return options


def choose_courier_code(city_row: dict[str, Any] | None) -> str:
    """Pick best courier for city — Leopard first when mapped."""
    available = []
    if city_row:
        available = [
            str(c.get("code") or "").lower()
            for c in (city_row.get("couriers") or [])
            if c.get("code")
        ]
    for code in COURIER_PRIORITY:
        if code in available:
            return code
    if available:
        return available[0]
    return getattr(settings, "FLASHIP_FALLBACK_COURIER", "tcs") or "tcs"


def _money_str(value) -> str:
    try:
        return f"{Decimal(value):.2f}"
    except Exception:
        return "0.00"


def build_booking_payload(order) -> dict[str, Any]:
    """Build Flaship booking body from a Django Order."""
    cities = fetch_flaship_cities()
    city_row = find_city_by_name(order.city, cities)
    consignee_city = (city_row.get("name") if city_row else None) or order.city
    courier_code = choose_courier_code(city_row)

    pickup = resolve_pickup()
    if not pickup or pickup.get("id") is None:
        raise RuntimeError(
            "No Flaship pickup location found. Add one at "
            "partners.flaship.pk (GET /api/integration/pickups/)."
        )
    pickup_id = int(pickup["id"])

    product_parts = []
    pieces = 0
    for item in order.items.all():
        product_parts.append(f"{item.product_name} x{item.quantity}")
        pieces += int(item.quantity or 0)
    product_name = ", ".join(product_parts)[:220] or "Scentra Ryv perfume"
    pieces = max(1, pieces)

    # COD collects total; prepaid/bank → 0
    if getattr(order, "payment_method", "") == "cod":
        cod_amount = _money_str(order.total_amount)
    else:
        cod_amount = "0.00"

    weight = getattr(settings, "FLASHIP_DEFAULT_WEIGHT_KG", "0.500") or "0.500"
    service = getattr(settings, "FLASHIP_DEFAULT_SERVICE_TYPE", "overnight") or "overnight"

    phone = "".join(ch for ch in str(order.phone or "") if ch.isdigit() or ch == "+")
    if phone.startswith("92") and len(phone) >= 12:
        phone = "0" + phone[2:]
    elif phone.startswith("+92"):
        phone = "0" + phone[3:]

    notes = (order.notes or "").strip()
    instruction = notes[:240] if notes else "Fragile — perfume. Call before delivery."

    return {
        "pickup_id": pickup_id,
        "courier_code": courier_code,
        "service_type": service,
        "product_name": product_name,
        "net_weight": str(weight),
        "pieces": 1,
        "quantity": pieces,
        "cod_amount": cod_amount,
        "consignee_name": order.full_name,
        "consignee_phone_primary": phone or order.phone,
        "consignee_phone_secondary": "",
        "consignee_address": order.address,
        "consignee_city": consignee_city,
        "special_instruction": instruction,
        "external_ref_no": order.order_number,
    }


def create_booking(payload: dict[str, Any]) -> dict[str, Any]:
    if not _api_key():
        raise RuntimeError("FLASHIP_API_KEY is not set.")

    res = requests.post(
        _bookings_url(),
        headers=_headers(json_body=True),
        json=payload,
        timeout=40,
    )
    try:
        data = res.json()
    except Exception:
        data = {"success": False, "raw": res.text[:500]}

    if res.status_code >= 400 or not data.get("success"):
        logger.error("Flaship booking failed (%s): %s", res.status_code, data)
        raise RuntimeError(data.get("message") or data.get("error") or str(data))

    return data


def _tracking_url(tracking_number: str) -> str:
    base = getattr(
        settings,
        "FLASHIP_TRACKING_URL_TEMPLATE",
        f"{_base()}/api/integration/orders/{{tracking_number}}/tracking/",
    )
    return base.replace("{tracking_number}", str(tracking_number).strip())


def track_shipment(tracking_number: str) -> dict[str, Any]:
    """
    Live tracking history for a CN.

    Returns Flaship payload:
      success, tracking_number, status, live_courier_status, tracking[{status,time}], message
    Times are Asia/Karachi YYYY-MM-DD HH:MM:SS.
    """
    cn = (tracking_number or "").strip()
    if not cn:
        return {"success": False, "message": "tracking_number is required", "tracking": []}
    if not _api_key():
        return {"success": False, "message": "FLASHIP_API_KEY is not set", "tracking": []}

    try:
        res = requests.get(_tracking_url(cn), headers=_headers(), timeout=25)
        data = res.json()
    except Exception as exc:
        logger.exception("Flaship tracking failed for %s", cn)
        return {"success": False, "message": str(exc), "tracking": [], "tracking_number": cn}

    if res.status_code >= 400 or not data.get("success"):
        logger.warning("Flaship tracking error (%s): %s", res.status_code, data)
        return {
            "success": False,
            "tracking_number": cn,
            "status": data.get("status"),
            "live_courier_status": data.get("live_courier_status"),
            "tracking": list(data.get("tracking") or []),
            "message": data.get("message") or data.get("error") or f"HTTP {res.status_code}",
        }

    events = []
    for ev in data.get("tracking") or []:
        events.append(
            {
                "status": ev.get("status") or "",
                "time": ev.get("time") or "",
            }
        )

    return {
        "success": True,
        "tracking_number": data.get("tracking_number") or cn,
        "status": data.get("status"),
        "live_courier_status": data.get("live_courier_status"),
        "tracking": events,
        "message": data.get("message"),
    }


def sync_order_from_tracking(order, tracking: dict[str, Any] | None = None) -> dict[str, Any]:
    """Refresh order.flaship_* from live tracking; optionally bump Order.status."""
    from .models import Order

    cn = (order.flaship_tracking_number or "").strip()
    if not cn:
        return {"success": False, "message": "Order has no tracking number", "tracking": []}

    data = tracking if tracking is not None else track_shipment(cn)
    if not data.get("success"):
        return data

    status_code = str(data.get("status") or "").upper()
    live = str(data.get("live_courier_status") or "")[:120]
    order.flaship_booking_status = status_code or live or order.flaship_booking_status
    update_fields = ["flaship_booking_status", "updated_at"]

    # Map courier lifecycle onto store order statuses (never downgrade cancelled)
    if order.status != Order.STATUS_CANCELLED:
        if status_code in ("DELIVERED",) or "delivered" in live.lower():
            if order.status != Order.STATUS_DELIVERED:
                order.status = Order.STATUS_DELIVERED
                update_fields.append("status")
        elif status_code in (
            "IN_TRANSIT",
            "OUT_FOR_DELIVERY",
            "PICKED_UP",
            "DISPATCHED",
        ) or any(
            x in live.lower()
            for x in ("transit", "out for delivery", "picked")
        ):
            if order.status not in (Order.STATUS_SHIPPED, Order.STATUS_DELIVERED):
                order.status = Order.STATUS_SHIPPED
                update_fields.append("status")

    order.save(update_fields=update_fields)
    return data


def book_order_shipment(order, *, force: bool = False) -> dict[str, Any]:
    """
    Create a Flaship booking for an order and persist tracking fields.

    Does not raise to callers of checkout — returns {ok, error?}.
    """
    if order.flaship_tracking_number and not force:
        return {
            "ok": True,
            "skipped": True,
            "tracking_number": order.flaship_tracking_number,
        }

    try:
        payload = build_booking_payload(order)
        data = create_booking(payload)
    except Exception as exc:
        logger.exception("Flaship book_order_shipment failed for %s", order.order_number)
        order.flaship_booking_error = str(exc)[:500]
        order.save(update_fields=["flaship_booking_error", "updated_at"])
        return {"ok": False, "error": str(exc)}

    order.flaship_booking_id = str(data.get("id") or "")[:64]
    order.flaship_tracking_number = str(data.get("tracking_number") or "")[:64]
    order.flaship_courier_code = str(data.get("courier_code") or payload.get("courier_code") or "")[:32]
    order.flaship_booking_status = str(data.get("status") or "")[:40]
    order.flaship_label_url = str(data.get("courier_label_url") or "")[:500]
    order.flaship_booking_error = ""
    order.save(
        update_fields=[
            "flaship_booking_id",
            "flaship_tracking_number",
            "flaship_courier_code",
            "flaship_booking_status",
            "flaship_label_url",
            "flaship_booking_error",
            "updated_at",
        ]
    )
    return {
        "ok": True,
        "tracking_number": order.flaship_tracking_number,
        "courier_code": order.flaship_courier_code,
        "status": order.flaship_booking_status,
        "id": order.flaship_booking_id,
    }


def _dec(value, default: str = "0") -> Decimal:
    try:
        if value in (None, ""):
            return Decimal(default)
        return Decimal(str(value))
    except Exception:
        return Decimal(default)


def fetch_payments(
    *,
    page: int = 1,
    page_size: int = 50,
    settlement_status: str = "",
    search: str = "",
    start_date: str = "",
    end_date: str = "",
) -> dict[str, Any]:
    """
    GET /api/integration/payments/
    Returns Flaship payload: success, count, page, page_size, results[].
    """
    if not _api_key():
        return {"success": False, "count": 0, "results": [], "message": "FLASHIP_API_KEY missing"}

    params = {
        "page": page,
        "page_size": page_size,
        "settlement_status": settlement_status or "",
        "search": search or "",
        "start_date": start_date or "",
        "end_date": end_date or "",
    }
    try:
        res = requests.get(_payments_url(), headers=_headers(), params=params, timeout=40)
        data = res.json()
    except Exception as exc:
        logger.exception("Flaship payments fetch failed")
        return {"success": False, "count": 0, "results": [], "message": str(exc)}

    if res.status_code >= 400 or not data.get("success"):
        return {
            "success": False,
            "count": 0,
            "results": [],
            "message": data.get("message") or data.get("detail") or f"HTTP {res.status_code}",
        }
    return data


def fetch_all_payments(**filters) -> list[dict[str, Any]]:
    """Paginate through Flaship payments until exhausted."""
    page = 1
    page_size = int(filters.pop("page_size", 50) or 50)
    rows: list[dict[str, Any]] = []
    while True:
        payload = fetch_payments(page=page, page_size=page_size, **filters)
        if not payload.get("success"):
            logger.error("Flaship payments page %s failed: %s", page, payload.get("message"))
            break
        batch = list(payload.get("results") or [])
        rows.extend(batch)
        total = int(payload.get("count") or 0)
        if not batch or len(rows) >= total:
            break
        page += 1
        if page > 200:
            break
    return rows


def sync_payment_audits(**filters) -> dict[str, Any]:
    """
    Pull Flaship payments into FlashipCnAudit and compute margin / profit vs store Order.
    """
    from .models import FlashipCnAudit, Order

    rows = fetch_all_payments(**filters)
    created = updated = 0

    for row in rows:
        cn = str(row.get("tracking_number") or "").strip()
        if not cn:
            continue

        courier_total = _dec(row.get("total_charges"))
        courier_delivery = _dec(row.get("delivery_charges"))
        courier_service = _dec(row.get("service_charges"))
        courier_osa = _dec(row.get("osa_charges"))
        courier_core = _dec(row.get("core_charges"))
        income_tax = _dec(row.get("income_tax"))
        withholding_tax = _dec(row.get("withholding_tax"))
        cod_amount = _dec(row.get("cod_amount"))
        line_net = _dec(row.get("line_net"))
        paid_amount = _dec(row.get("paid_amount")) if row.get("paid_amount") not in (None, "") else None

        order = (
            Order.objects.filter(flaship_tracking_number=cn).first()
            or Order.objects.filter(order_number=str(row.get("external_ref_no") or "").strip()).first()
        )

        customer_shipping = Decimal("0.00")
        order_subtotal = Decimal("0.00")
        order_total = Decimal("0.00")
        order_number = ""
        if order:
            customer_shipping = _dec(order.shipping)
            order_subtotal = _dec(order.subtotal)
            order_total = _dec(order.total_amount)
            order_number = order.order_number

        # Shipping margin: what customer paid as DC vs courier CN charges
        shipping_profit = customer_shipping - courier_total
        if customer_shipping > 0:
            shipping_margin_pct = (shipping_profit / customer_shipping) * Decimal("100")
        else:
            # Free shipping for customer → full courier cost is margin loss
            shipping_margin_pct = Decimal("0.00") if courier_total == 0 else Decimal("-100.00")

        # Contribution after courier: product revenue minus CN charges
        contribution = order_subtotal - courier_total
        if order_subtotal > 0:
            contribution_margin_pct = (contribution / order_subtotal) * Decimal("100")
        else:
            contribution_margin_pct = Decimal("0.00")

        defaults = {
            "order": order,
            "order_number": order_number,
            "external_ref_no": str(row.get("external_ref_no") or "")[:64],
            "courier_code": str(row.get("courier_code") or "")[:32],
            "shipment_status": str(row.get("shipment_status") or "")[:40],
            "finance_status": str(row.get("finance_status") or "")[:40],
            "settlement_status": str(row.get("settlement_status") or "")[:40],
            "settlement_date": str(row.get("settlement_date") or "")[:32],
            "cheque_no": str(row.get("cheque_no") or "")[:64],
            "arrival_weight": str(row.get("arrival_weight") or "")[:20],
            "cod_amount": cod_amount,
            "paid_amount": paid_amount,
            "line_net": line_net,
            "delivery_charges": courier_delivery,
            "service_charges": courier_service,
            "osa_charges": courier_osa,
            "core_charges": courier_core,
            "income_tax": income_tax,
            "withholding_tax": withholding_tax,
            "total_charges": courier_total,
            "customer_shipping": customer_shipping,
            "order_subtotal": order_subtotal,
            "order_total": order_total,
            "shipping_profit": shipping_profit,
            "shipping_margin_pct": shipping_margin_pct.quantize(Decimal("0.01")),
            "contribution_profit": contribution,
            "contribution_margin_pct": contribution_margin_pct.quantize(Decimal("0.01")),
            "raw_payload": row,
        }

        obj, was_created = FlashipCnAudit.objects.update_or_create(
            tracking_number=cn,
            defaults=defaults,
        )
        if was_created:
            created += 1
        else:
            updated += 1

    return {
        "ok": True,
        "fetched": len(rows),
        "created": created,
        "updated": updated,
    }
