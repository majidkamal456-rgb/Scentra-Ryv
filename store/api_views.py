from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, parser_classes, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .api_serializers import (
    CheckoutSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductReviewSerializer,
)
from .emails import send_order_notification, send_return_request_notification
from .forms import ProductReviewForm, ReturnRequestForm
from .models import Order, OrderItem, Product, ProductReview, annotate_product_ratings
from .shipping import (
    NEARBY_CITIES,
    NEARBY_CITY_LABELS,
    NEARBY_PROVINCE_KEYWORDS,
    REMOTE_CITIES,
    REMOTE_CITY_LABELS,
    REMOTE_PROVINCE_KEYWORDS,
    calculate_shipping,
)


def _absolute_media(request, path):
    if not path:
        return None
    return request.build_absolute_uri(path) if request else path


@api_view(['GET'])
def product_list(request):
    qs = annotate_product_ratings(Product.objects.all())
    gender = request.query_params.get('gender', '')
    featured = request.query_params.get('featured', '')
    sort = request.query_params.get('sort', 'name')

    if gender in ('men', 'women', 'unisex'):
        qs = qs.filter(gender=gender)
    if featured in ('1', 'true', 'True'):
        qs = qs.filter(is_featured=True)

    if sort == 'price_asc':
        qs = qs.order_by('price')
    elif sort == 'price_desc':
        qs = qs.order_by('-price')
    else:
        qs = qs.order_by('name')

    serializer = ProductListSerializer(qs, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def product_detail(request, slug):
    product = get_object_or_404(annotate_product_ratings(Product.objects.all()), slug=slug)
    serializer = ProductDetailSerializer(product, context={'request': request})
    data = serializer.data
    related = annotate_product_ratings(Product.objects.exclude(pk=product.pk))[:6]
    data['related'] = ProductListSerializer(
        related, many=True, context={'request': request}
    ).data
    return Response(data)


@api_view(['GET'])
def review_list(request):
    """Approved reviews for home testimonials + product cards."""
    qs = ProductReview.objects.filter(is_approved=True).select_related('product')
    slug = request.query_params.get('product', '').strip()
    if slug:
        qs = qs.filter(product__slug=slug)
    qs = qs.order_by('-created_at')[:60]
    serializer = ProductReviewSerializer(qs, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def site_config(request):
    return Response({
        'whatsapp_number': getattr(settings, 'WHATSAPP_NUMBER', '923177478167'),
        'contact_email': getattr(settings, 'CONTACT_EMAIL', 'scentraryv@gmail.com'),
        'shipping_nearby_rate': str(settings.SHIPPING_NEARBY_RATE),
        'shipping_other_rate': str(settings.SHIPPING_OTHER_RATE),
        'bank_details': getattr(settings, 'BANK_DETAILS', {}),
        'nearby_cities': sorted(NEARBY_CITIES),
        'nearby_provinces': sorted(NEARBY_PROVINCE_KEYWORDS),
        'remote_cities': sorted(REMOTE_CITIES),
        'remote_provinces': sorted(REMOTE_PROVINCE_KEYWORDS),
        'remote_city_labels': list(REMOTE_CITY_LABELS),
        'nearby_city_labels': list(NEARBY_CITY_LABELS),
        'free_tester_offer': {
            'enabled': getattr(settings, 'FREE_TESTER_OFFER_ENABLED', True),
            'headline': getattr(
                settings,
                'FREE_TESTER_HEADLINE',
                'Buy any perfume — get a free tester',
            ),
            'subtext': getattr(
                settings,
                'FREE_TESTER_SUBTEXT',
                'Choose any fragrance tester free with your order.',
            ),
            'size_label': getattr(settings, 'FREE_TESTER_SIZE_LABEL', 'Free Tester'),
        },
    })


@api_view(['GET'])
def shipping_cities(request):
    """
    Flaship GET /cities/ → Leopard-operating cities only.

    Free shipping (DC 0):
      - Punjab / ICT Leopard cities, OR
      - Leopard destinations where inclusive DC (fuel + ST) <= ~181
    Else: SHIPPING_OTHER_RATE (Rs. 200).
    """
    from .flaship import estimate_leopard_inclusive_dc, shipping_city_options

    q = (request.query_params.get('q') or '').strip()
    free_only = (request.query_params.get('free') or '').lower() in ('1', 'true', 'yes')
    options = shipping_city_options(leopard_only=True)
    if free_only:
        options = [c for c in options if c.get('free_shipping')]
    if q:
        needle = q.lower()
        options = [
            c
            for c in options
            if needle in (c.get('name') or '').lower()
            or needle in (c.get('normalized_name') or '').lower()
        ]
    free_dc_max = str(getattr(settings, 'FLASHIP_FREE_DC_MAX', '181'))
    try:
        standard_dc = str(estimate_leopard_inclusive_dc())
    except Exception:
        standard_dc = free_dc_max
    return Response(
        {
            'success': True,
            'count': len(options),
            'shipping_free': str(settings.SHIPPING_NEARBY_RATE),
            'shipping_paid': str(settings.SHIPPING_OTHER_RATE),
            'free_dc_max': free_dc_max,
            'standard_leopard_dc': standard_dc,
            'rule': (
                f'Free for Punjab/ICT, or Leopard DC incl. fuel+ST <= {free_dc_max}; '
                f'else Rs. {settings.SHIPPING_OTHER_RATE}'
            ),
            'cities': options,
        }
    )


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def checkout_create(request):
    # Build a plain dict (not a QueryDict) so nested `items` validates correctly
    # for both JSON bodies and multipart FormData from the Next.js frontend.
    if hasattr(request.data, 'getlist'):
        payload = {key: request.data.get(key) for key in request.data.keys()}
    else:
        payload = dict(request.data)

    # FormData / JSON may send nested lists as JSON strings
    import json
    for key in ('items', 'free_tester_product_ids'):
        raw = payload.get(key)
        if isinstance(raw, str):
            try:
                payload[key] = json.loads(raw)
            except json.JSONDecodeError:
                return Response({key: f'Invalid {key} payload.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = CheckoutSerializer(data=payload)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    payment_method = data['payment_method']
    city = data['city']
    address = data.get('address') or ''
    items_data = data['items']
    offer_on = getattr(settings, 'FREE_TESTER_OFFER_ENABLED', True)
    tester_size = getattr(settings, 'FREE_TESTER_SIZE_LABEL', 'Free Tester')
    paid_qty = data.get('_paid_qty') or sum(int(i['quantity']) for i in items_data)
    free_tester_ids = list(data.get('free_tester_product_ids') or [])

    product_ids = [item['product_id'] for item in items_data]
    products = {p.id: p for p in Product.objects.filter(id__in=product_ids)}

    line_items = []
    subtotal = Decimal('0.00')
    total_qty = 0

    for item in items_data:
        product = products.get(item['product_id'])
        if not product:
            return Response(
                {'items': f"Product {item['product_id']} not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        qty = item['quantity']
        if qty > product.stock:
            return Response(
                {'items': f'Not enough stock for {product.name}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        size = item.get('size') or product.size_ml
        line_total = product.price * qty
        subtotal += line_total
        total_qty += qty
        line_items.append((product, qty, size))

    free_testers = []
    if offer_on:
        if len(free_tester_ids) != paid_qty:
            return Response(
                {
                    'free_tester_product_ids': (
                        f'Please choose {paid_qty} free tester'
                        f'{"s" if paid_qty != 1 else ""} '
                        f'(one per perfume in your cart).'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        tester_products = {
            p.id: p for p in Product.objects.filter(pk__in=set(free_tester_ids))
        }
        for tid in free_tester_ids:
            tester = tester_products.get(tid)
            if not tester:
                return Response(
                    {'free_tester_product_ids': f'Tester product {tid} was not found.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            free_testers.append(tester)

    shipping = calculate_shipping(total_qty, city, address=address)
    total = subtotal + shipping

    screenshot = request.FILES.get('payment_screenshot')
    if payment_method == Order.PAYMENT_BANK and not screenshot:
        return Response(
            {'payment_screenshot': 'Payment screenshot is required for bank transfer.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    primary_tester = free_testers[0] if free_testers else None
    tester_names = ', '.join(t.name for t in free_testers)

    with transaction.atomic():
        order = Order(
            full_name=data['full_name'],
            phone=data['phone'],
            address=data['address'],
            city=city,
            email=data.get('email') or '',
            notes=data.get('notes') or '',
            payment_method=payment_method,
            payment_screenshot=screenshot,
            free_tester=primary_tester,
            free_tester_name=tester_names,
            status=(
                Order.STATUS_PENDING_COD
                if payment_method == Order.PAYMENT_COD
                else Order.STATUS_PENDING_VERIFICATION
            ),
            subtotal=subtotal,
            shipping=shipping,
            total_amount=total,
        )
        order.save()

        for product, qty, size in line_items:
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                size_ml=size,
                quantity=qty,
                price_at_purchase=product.price,
            )
            product.stock = max(0, product.stock - qty)
            product.save(update_fields=['stock'])

        # Group identical testers into one line when possible
        from collections import Counter
        counts = Counter(t.id for t in free_testers)
        by_id = {t.id: t for t in free_testers}
        for tid, qty in counts.items():
            tester = by_id[tid]
            OrderItem.objects.create(
                order=order,
                product=tester,
                product_name=f'{tester.name} (Free Tester)',
                size_ml=tester_size,
                quantity=qty,
                price_at_purchase=Decimal('0.00'),
            )

    send_order_notification(order)

    # Auto-book Flaship for COD (bank transfer books after payment verified / admin)
    booking = None
    auto_book = getattr(settings, 'FLASHIP_AUTO_BOOK', True)
    if auto_book and payment_method == Order.PAYMENT_COD:
        from .flaship import book_order_shipment

        booking = book_order_shipment(order)
        order.refresh_from_db()

    return Response({
        'order_number': order.order_number,
        'total_amount': str(order.total_amount),
        'shipping': str(order.shipping),
        'subtotal': str(order.subtotal),
        'status': order.status,
        'payment_method': order.payment_method,
        'free_tester_name': order.free_tester_name or None,
        'tracking_number': order.flaship_tracking_number or None,
        'courier_code': order.flaship_courier_code or None,
        'flaship_booking': booking,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def order_detail(request, order_number):
    order = get_object_or_404(Order, order_number=order_number)

    live = None
    if order.flaship_tracking_number and request.query_params.get('live') in (
        '1',
        'true',
        'True',
    ):
        from .flaship import sync_order_from_tracking

        live = sync_order_from_tracking(order)
        order.refresh_from_db()

    items = [
        {
            'product_name': item.product_name,
            'size_ml': item.size_ml,
            'quantity': item.quantity,
            'price_at_purchase': str(item.price_at_purchase),
            'line_total': str(item.line_total),
        }
        for item in order.items.all()
    ]
    return Response({
        'order_number': order.order_number,
        'full_name': order.full_name,
        'phone': order.phone,
        'city': order.city,
        'address': order.address,
        'payment_method': order.payment_method,
        'payment_method_display': order.get_payment_method_display(),
        'status': order.status,
        'status_display': order.get_status_display(),
        'subtotal': str(order.subtotal),
        'shipping': str(order.shipping),
        'total_amount': str(order.total_amount),
        'created_at': order.created_at.isoformat(),
        'free_tester_name': order.free_tester_name or None,
        'tracking_number': order.flaship_tracking_number or None,
        'courier_code': order.flaship_courier_code or None,
        'courier_status': order.flaship_booking_status or None,
        'courier_label_url': order.flaship_label_url or None,
        'live_tracking': live,
        'items': items,
    })


@api_view(['GET'])
def order_tracking(request, order_number):
    """Live Flaship tracking for a store order number."""
    order = get_object_or_404(Order, order_number=order_number)
    if not order.flaship_tracking_number:
        return Response(
            {
                'success': False,
                'order_number': order.order_number,
                'message': 'No courier tracking number yet.',
                'tracking': [],
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    from .flaship import sync_order_from_tracking

    data = sync_order_from_tracking(order)
    order.refresh_from_db()
    return Response(
        {
            **data,
            'order_number': order.order_number,
            'courier_code': order.flaship_courier_code or None,
            'order_status': order.status,
        }
    )


@api_view(['GET'])
def tracking_by_cn(request, tracking_number):
    """Live Flaship tracking by consignment / CN number."""
    from .flaship import track_shipment

    data = track_shipment(tracking_number)
    http = status.HTTP_200_OK if data.get('success') else status.HTTP_404_NOT_FOUND
    return Response(data, status=http)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def return_request(request):
    form = ReturnRequestForm(request.data, request.FILES)
    if not form.is_valid():
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

    data = form.cleaned_data
    send_return_request_notification({
        'full_name': data['full_name'],
        'phone': data['phone'],
        'email': data.get('email'),
        'order_number': data['order_number'],
        'product_name': data['product_name'],
        'reason': data['reason'],
        'reason_choices': ReturnRequestForm.REASON_CHOICES,
        'details': data['details'],
    }, photo=data.get('photo'))

    return Response({
        'success': True,
        'message': 'Your return request has been received. Our team will contact you within 1–2 business days.',
    })


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def product_review_create(request, slug):
    product = get_object_or_404(Product, slug=slug)
    form = ProductReviewForm(request.data, request.FILES)
    if not form.is_valid():
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

    review = form.save(commit=False)
    review.product = product
    review.save()

    return Response({
        'success': True,
        'message': 'Thank you! Your review has been submitted.',
        'id': review.id,
        'average_rating': product.average_rating,
        'review_count': product.review_count,
    }, status=status.HTTP_201_CREATED)
