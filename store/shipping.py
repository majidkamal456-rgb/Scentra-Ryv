from decimal import Decimal

from django.conf import settings

# Sindh, Balochistan, Khyber Pakhtunkhwa — Rs. 350.
# All other cities (Punjab & rest) — Rs. 280.
REMOTE_CITIES = {
    # Sindh
    'karachi',
    'hyderabad',
    'sukkur',
    'larkana',
    'larkhana',
    'mirpur khas',
    'mirpurkhas',
    'nawabshah',
    'shaheed benazirabad',
    'thatta',
    'badin',
    'jacobabad',
    'shikarpur',
    'khairpur',
    'dadu',
    'sehwan',
    'jamshoro',
    'tando allahyar',
    'tando adam',
    'umar kot',
    'umarkot',
    'ghotki',
    'kashmore',
    # Balochistan
    'quetta',
    'gwadar',
    'turbat',
    'khuzdar',
    'hub',
    'chaman',
    'sibi',
    'zhob',
    'pasni',
    'ormara',
    'panjgur',
    'lasbela',
    'loralai',
    # Khyber Pakhtunkhwa
    'peshawar',
    'mardan',
    'abbottabad',
    'swat',
    'mingora',
    'kohat',
    'bannu',
    'dera ismail khan',
    'dikhan',
    'd i khan',
    'charsadda',
    'nowshera',
    'swabi',
    'mansehra',
    'haripur',
    'timergara',
    'dir',
    'chitral',
}

REMOTE_CITY_LABELS = (
    'Karachi',
    'Hyderabad',
    'Sukkur',
    'Quetta',
    'Peshawar',
    'Mardan',
    'Abbottabad',
    'Swat',
)

# Kept for older imports / templates that still reference the old name.
NEARBY_CITIES = set()  # unused — Punjab is the default rate
NEARBY_CITY_LABELS = (
    'Lahore',
    'Faisalabad',
    'Rawalpindi',
    'Multan',
    'Gujranwala',
    'Sialkot',
    'Islamabad',
)


def _normalize_city(city):
    if not city:
        return ''
    cleaned = ''.join(ch.lower() if ch.isalnum() or ch.isspace() else ' ' for ch in str(city))
    return ' '.join(cleaned.split())


def is_remote_city(city):
    """True for Sindh / Balochistan / KPK cities (Rs. 350)."""
    name = _normalize_city(city)
    if not name:
        return False
    if name in REMOTE_CITIES:
        return True
    first = name.split()[0]
    if first in REMOTE_CITIES:
        return True
    for remote in REMOTE_CITIES:
        if ' ' in remote and remote in name:
            return True
    return False


def is_nearby_city(city):
    """Legacy helper: Punjab / default zone (not remote)."""
    if not _normalize_city(city):
        return False
    return not is_remote_city(city)


def calculate_shipping(quantity, city=None):
    """
    Punjab & other non-remote cities: Rs. 280.
    Sindh / Balochistan / KPK: Rs. 350.
    No per-extra-item fee.
    """
    quantity = int(quantity or 0)
    if quantity <= 0:
        return Decimal('0.00')

    punjab_rate = getattr(settings, 'SHIPPING_NEARBY_RATE', Decimal('280.00'))
    remote_rate = getattr(settings, 'SHIPPING_OTHER_RATE', Decimal('350.00'))

    base = remote_rate if is_remote_city(city) else punjab_rate
    return Decimal(base)


def shipping_range(quantity):
    """Return (punjab_rate, remote_rate) for the given cart quantity."""
    quantity = int(quantity or 0)
    punjab = calculate_shipping(quantity, city='Lahore')
    remote = calculate_shipping(quantity, city='Karachi')
    return punjab, remote
