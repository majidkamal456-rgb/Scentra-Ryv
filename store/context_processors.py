from django.conf import settings

from .cart import Cart


def cart_context(request):
    cart = Cart(request)
    return {
        'cart_count': len(cart),
        'cart_subtotal': cart.get_subtotal(),
        'whatsapp_number': getattr(settings, 'WHATSAPP_NUMBER', '923001234567'),
        'bank_details': getattr(settings, 'BANK_DETAILS', {}),
    }
