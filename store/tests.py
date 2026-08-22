from decimal import Decimal

from django.test import SimpleTestCase, override_settings

from store.shipping import (
    calculate_shipping,
    is_nearby_city,
    is_remote_city,
    shipping_range,
)


@override_settings(
    SHIPPING_NEARBY_RATE=Decimal('280.00'),
    SHIPPING_OTHER_RATE=Decimal('350.00'),
)
class ShippingTests(SimpleTestCase):
    def test_remote_vs_punjab(self):
        self.assertTrue(is_remote_city('Karachi'))
        self.assertTrue(is_remote_city('Quetta'))
        self.assertTrue(is_remote_city('Peshawar Cantt'))
        self.assertTrue(is_remote_city('Hyderabad'))
        self.assertFalse(is_remote_city('Lahore'))
        self.assertFalse(is_remote_city('Islamabad'))
        self.assertFalse(is_remote_city(''))
        self.assertTrue(is_nearby_city('Lahore'))
        self.assertFalse(is_nearby_city('Karachi'))

    def test_fixed_rates_no_extra(self):
        self.assertEqual(calculate_shipping(1, 'Lahore'), Decimal('280.00'))
        self.assertEqual(calculate_shipping(2, 'Lahore'), Decimal('280.00'))
        self.assertEqual(calculate_shipping(3, 'Lahore'), Decimal('280.00'))
        self.assertEqual(calculate_shipping(1, 'Karachi'), Decimal('350.00'))
        self.assertEqual(calculate_shipping(3, 'Quetta'), Decimal('350.00'))

    def test_empty_cart(self):
        self.assertEqual(calculate_shipping(0, 'Lahore'), Decimal('0.00'))

    def test_range(self):
        punjab, remote = shipping_range(1)
        self.assertEqual(punjab, Decimal('280.00'))
        self.assertEqual(remote, Decimal('350.00'))
