from decimal import Decimal

from django.conf import settings

from .models import Product

CART_SESSION_KEY = 'store_cart'


class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get(CART_SESSION_KEY)
        if not cart:
            cart = self.session[CART_SESSION_KEY] = {}
        self.cart = cart

    def add(self, product, quantity=1, size=None):
        product_id = str(product.id)
        size = size or product.size_ml
        key = f'{product_id}:{size}'

        if key in self.cart:
            self.cart[key]['quantity'] += quantity
        else:
            self.cart[key] = {
                'product_id': product.id,
                'quantity': quantity,
                'size': size,
            }
        self.save()

    def update(self, key, quantity):
        if key in self.cart:
            if quantity <= 0:
                del self.cart[key]
            else:
                self.cart[key]['quantity'] = quantity
            self.save()

    def remove(self, key):
        if key in self.cart:
            del self.cart[key]
            self.save()

    def clear(self):
        del self.session[CART_SESSION_KEY]
        self.save()

    def save(self):
        self.session.modified = True

    def __iter__(self):
        product_ids = {item['product_id'] for item in self.cart.values()}
        products = Product.objects.in_bulk(product_ids)

        for key, item in self.cart.items():
            product = products.get(item['product_id'])
            if not product:
                continue
            price = product.price
            quantity = item['quantity']
            yield {
                'key': key,
                'product': product,
                'size': item['size'],
                'quantity': quantity,
                'price': price,
                'line_total': price * quantity,
            }

    def __len__(self):
        return sum(item['quantity'] for item in self.cart.values())

    def get_subtotal(self):
        return sum(item['line_total'] for item in self)

    def get_shipping(self):
        subtotal = self.get_subtotal()
        flat_rate = getattr(settings, 'SHIPPING_FLAT_RATE', Decimal('200.00'))
        free_threshold = getattr(settings, 'FREE_SHIPPING_THRESHOLD', Decimal('5000.00'))
        if subtotal >= free_threshold:
            return Decimal('0.00')
        return flat_rate

    def get_total(self):
        return self.get_subtotal() + self.get_shipping()

    def is_empty(self):
        return len(self.cart) == 0
