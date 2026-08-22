from django.conf import settings
from django.contrib import messages
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_POST

from .cart import Cart
from .emails import send_order_notification
from .forms import CheckoutForm
from .models import Order, OrderItem, Product
from .shipping import REMOTE_CITIES, REMOTE_CITY_LABELS, NEARBY_CITY_LABELS


def home(request):
    featured = Product.objects.filter(is_featured=True)[:6]
    if featured.count() < 6:
        featured = Product.objects.all()[:6]
    return render(request, 'store/home.html', {'products': featured})


def shop(request):
    products = Product.objects.all()
    sort = request.GET.get('sort', 'name')
    gender = request.GET.get('gender', '')

    if gender in ('men', 'women', 'unisex'):
        products = products.filter(gender=gender)

    if sort == 'price_asc':
        products = products.order_by('price')
    elif sort == 'price_desc':
        products = products.order_by('-price')
    else:
        products = products.order_by('name')

    return render(request, 'store/shop.html', {
        'products': products,
        'current_sort': sort,
        'current_gender': gender,
    })


def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug)
    related = Product.objects.exclude(pk=product.pk)[:6]
    return render(request, 'store/product_detail.html', {
        'product': product,
        'related_products': related,
    })


def about(request):
    return render(request, 'store/about.html')


def contact(request):
    return render(request, 'store/contact.html')


def cart_view(request):
    cart = Cart(request)
    nearby_shipping, other_shipping = cart.get_shipping_range()
    subtotal = cart.get_subtotal()
    return render(request, 'store/cart.html', {
        'cart': cart,
        'nearby_shipping': nearby_shipping,
        'other_shipping': other_shipping,
        'nearby_city_labels': NEARBY_CITY_LABELS,
        'remote_city_labels': REMOTE_CITY_LABELS,
        'total_from': subtotal + nearby_shipping,
        'total_to': subtotal + other_shipping,
    })


@require_POST
def cart_add(request):
    product_id = request.POST.get('product_id')
    quantity = int(request.POST.get('quantity', 1))
    size = request.POST.get('size', '')
    product = get_object_or_404(Product, pk=product_id)

    if quantity < 1:
        quantity = 1
    if quantity > product.stock:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': False, 'message': 'Not enough stock.'}, status=400)
        messages.error(request, 'Not enough stock available.')
        return redirect(product.get_absolute_url())

    cart = Cart(request)
    cart.add(product, quantity=quantity, size=size or product.size_ml)

    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'message': f'{product.name} added to cart.',
            'cart_count': len(cart),
        })

    messages.success(request, f'{product.name} added to cart.')
    next_url = request.POST.get('next', reverse('store:cart'))
    return redirect(next_url)


@require_POST
def cart_update(request):
    key = request.POST.get('key')
    quantity = int(request.POST.get('quantity', 1))
    cart = Cart(request)
    cart.update(key, quantity)
    messages.success(request, 'Cart updated.')
    return redirect('store:cart')


@require_POST
def cart_remove(request):
    key = request.POST.get('key')
    cart = Cart(request)
    cart.remove(key)
    messages.success(request, 'Item removed from cart.')
    return redirect('store:cart')


CHECKOUT_DRAFT_KEY = 'checkout_draft'
CHECKOUT_DRAFT_FIELDS = (
    'full_name', 'phone', 'address', 'city', 'email', 'notes', 'payment_method',
)


def _save_checkout_draft(request):
    draft = {field: request.POST.get(field, '').strip() for field in CHECKOUT_DRAFT_FIELDS}
    request.session[CHECKOUT_DRAFT_KEY] = draft
    request.session.modified = True


def _clear_checkout_draft(request):
    if CHECKOUT_DRAFT_KEY in request.session:
        del request.session[CHECKOUT_DRAFT_KEY]
        request.session.modified = True


def checkout(request):
    cart = Cart(request)
    if cart.is_empty():
        messages.warning(request, 'Your cart is empty.')
        return redirect('store:shop')

    if request.method == 'POST':
        form = CheckoutForm(request.POST, request.FILES)
        # Keep whatever the customer typed so far (even if validation fails)
        _save_checkout_draft(request)

        if form.is_valid():
            order = form.save(commit=False)
            payment_method = form.cleaned_data['payment_method']
            city = form.cleaned_data['city']

            if payment_method == Order.PAYMENT_COD:
                order.status = Order.STATUS_PENDING_COD
            else:
                order.status = Order.STATUS_PENDING_VERIFICATION

            order.subtotal = cart.get_subtotal()
            order.shipping = cart.get_shipping(city)
            order.total_amount = cart.get_total(city)

            with transaction.atomic():
                order.save()

                for item in cart:
                    OrderItem.objects.create(
                        order=order,
                        product=item['product'],
                        product_name=item['product'].name,
                        size_ml=item['size'],
                        quantity=item['quantity'],
                        price_at_purchase=item['price'],
                    )
                    product = item['product']
                    product.stock = max(0, product.stock - item['quantity'])
                    product.save(update_fields=['stock'])

            send_order_notification(order)
            cart.clear()
            _clear_checkout_draft(request)
            messages.success(request, 'Your order has been placed successfully!')
            return redirect('store:order_confirmation', order_number=order.order_number)
    else:
        draft = request.session.get(CHECKOUT_DRAFT_KEY) or {}
        form = CheckoutForm(initial=draft)

    nearby_shipping, other_shipping = cart.get_shipping_range()
    return render(request, 'store/checkout.html', {
        'form': form,
        'cart': cart,
        'nearby_city_labels': NEARBY_CITY_LABELS,
        'remote_city_labels': REMOTE_CITY_LABELS,
        'nearby_shipping': nearby_shipping,
        'other_shipping': other_shipping,
        'checkout_draft': request.session.get(CHECKOUT_DRAFT_KEY) or {},
        'prefer_local_draft': request.method != 'POST',
        'shipping_config': {
            'remoteCities': sorted(REMOTE_CITIES),
            'punjabRate': float(settings.SHIPPING_NEARBY_RATE),
            'remoteRate': float(settings.SHIPPING_OTHER_RATE),
            'itemCount': len(cart),
            'subtotal': float(cart.get_subtotal()),
        },
    })


def order_confirmation(request, order_number):
    order = get_object_or_404(Order, order_number=order_number)
    return render(request, 'store/order_confirmation.html', {'order': order})


def quick_view(request, slug):
    product = get_object_or_404(Product, slug=slug)
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render(request, 'store/partials/quick_view.html', {'product': product})
    return redirect(product.get_absolute_url())
