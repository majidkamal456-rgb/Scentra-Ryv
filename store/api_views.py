from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .api_serializers import (
    CheckoutSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)
from .emails import send_order_notification, send_return_request_notification
from .forms import ReturnRequestForm
from .models import Order, OrderItem, Product
from .shipping import calculate_shipping


def _absolute_media(request, path):
    if not path:
        return None
    return request.build_absolute_uri(path) if request else path


@api_view(['GET'])
def product_list(request):
    qs = Product.objects.all()
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
    product = get_object_or_404(Product, slug=slug)
    serializer = ProductDetailSerializer(product, context={'request': request})
    data = serializer.data
    related = Product.objects.exclude(pk=product.pk)[:6]
    data['related'] = ProductListSerializer(
        related, many=True, context={'request': request}
    ).data
    return Response(data)


@api_view(['GET'])
def site_config(request):
    return Response({
        'whatsapp_number': getattr(settings, 'WHATSAPP_NUMBER', '923177478167'),
        'contact_email': getattr(settings, 'CONTACT_EMAIL', 'scentraryv@gmail.com'),
        'shipping_nearby_rate': str(settings.SHIPPING_NEARBY_RATE),
        'shipping_other_rate': str(settings.SHIPPING_OTHER_RATE),
        'bank_details': getattr(settings, 'BANK_DETAILS', {}),
    })


@api_view(['POST'])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def checkout_create(request):
    payload = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
    # FormData from Next.js may send items as a JSON string
    items = payload.get('items')
    if isinstance(items, str):
        import json
        try:
            payload['items'] = json.loads(items)
        except json.JSONDecodeError:
            return Response({'items': 'Invalid items payload.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = CheckoutSerializer(data=payload)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    payment_method = data['payment_method']
    city = data['city']
    items_data = data['items']

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

    shipping = calculate_shipping(total_qty, city)
    total = subtotal + shipping

    screenshot = request.FILES.get('payment_screenshot')
    if payment_method == Order.PAYMENT_BANK and not screenshot:
        return Response(
            {'payment_screenshot': 'Payment screenshot is required for bank transfer.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

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

    send_order_notification(order)

    return Response({
        'order_number': order.order_number,
        'total_amount': str(order.total_amount),
        'shipping': str(order.shipping),
        'subtotal': str(order.subtotal),
        'status': order.status,
        'payment_method': order.payment_method,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def order_detail(request, order_number):
    order = get_object_or_404(Order, order_number=order_number)
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
        'status': order.status,
        'subtotal': str(order.subtotal),
        'shipping': str(order.shipping),
        'total_amount': str(order.total_amount),
        'created_at': order.created_at.isoformat(),
        'items': items,
    })


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
