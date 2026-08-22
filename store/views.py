from django.contrib import messages
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_POST

from .cart import Cart
from .forms import CheckoutForm
from .models import Order, OrderItem, Product


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
    return render(request, 'store/cart.html', {'cart': cart})


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


def checkout(request):
    cart = Cart(request)
    if cart.is_empty():
        messages.warning(request, 'Your cart is empty.')
        return redirect('store:shop')

    if request.method == 'POST':
        form = CheckoutForm(request.POST, request.FILES)
        if form.is_valid():
            order = form.save(commit=False)
            payment_method = form.cleaned_data['payment_method']

            if payment_method == Order.PAYMENT_COD:
                order.status = Order.STATUS_PENDING_COD
            else:
                order.status = Order.STATUS_PENDING_VERIFICATION

            order.subtotal = cart.get_subtotal()
            order.shipping = cart.get_shipping()
            order.total_amount = cart.get_total()
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

            cart.clear()
            messages.success(request, 'Your order has been placed successfully!')
            return redirect('store:order_confirmation', order_number=order.order_number)
    else:
        form = CheckoutForm()

    return render(request, 'store/checkout.html', {
        'form': form,
        'cart': cart,
    })


def order_confirmation(request, order_number):
    order = get_object_or_404(Order, order_number=order_number)
    return render(request, 'store/order_confirmation.html', {'order': order})


def quick_view(request, slug):
    product = get_object_or_404(Product, slug=slug)
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render(request, 'store/partials/quick_view.html', {'product': product})
    return redirect(product.get_absolute_url())
