from decimal import Decimal

from django.conf import settings

# Nearby zone — Rs. 250
NEARBY_PROVINCE_KEYWORDS = {
    'punjab',
    'panjab',
}

# Remote zone — Rs. 280
REMOTE_PROVINCE_KEYWORDS = {
    'sindh',
    'balochistan',
    'baluchistan',
    'kpk',
    'kp',
    'khyber',
    'pakhtunkhwa',
    'khyber pakhtunkhwa',
    # Kashmir / northern areas
    'kashmir',
    'azad kashmir',
    'ajk',
    'muzaffarabad',
    'gilgit',
    'baltistan',
    'gilgit baltistan',
    'gb',
}

# Punjab + ICT cities/districts — Rs. 250
NEARBY_CITIES = {
    'lahore',
    'faisalabad',
    'rawalpindi',
    'islamabad',
    'isb',
    'multan',
    'gujranwala',
    'sialkot',
    'bahawalpur',
    'sargodha',
    'sahiwal',
    'sheikhupura',
    'rahim yar khan',
    'rahimyarkhan',
    'gujrat',
    'jhelum',
    'kasur',
    'okara',
    'vehari',
    'khanewal',
    'muzaffargarh',
    'dera ghazi khan',
    'dg khan',
    'd g khan',
    'bahawalnagar',
    'chinjot',
    'chiniot',
    'jhang',
    'toba tek singh',
    'tt singh',
    'hafizabad',
    'nankana sahib',
    'nankana',
    'narowal',
    'mandi bahauddin',
    'mandi bahaudin',
    'mianwali',
    'bhakkar',
    'khushab',
    'chakwal',
    'attock',
    'taxila',
    'wah',
    'wah cantt',
    'kamoke',
    'wazirabad',
    'muridke',
    'pakpattan',
    'lodhran',
    'layyah',
    'rajanpur',
    'kot addu',
    'gojra',
    'samundri',
    'burewala',
    'hasilpur',
    'ahmadpur east',
    'arifwala',
    'chichawatni',
    'daska',
    'pasrur',
    'sambrial',
    'gujar khan',
    'murree',
    'pind dadan khan',
    'talagang',
    'pindi gheb',
    'jand',
    'kallar kahar',
    'choa saidan shah',
    'fort abbas',
    'yazman',
    'jalalpur',
    'kamalia',
    'pir mahal',
    'shorkot',
    'kabirwala',
    'mailsi',
    'jahania',
    'duniyapur',
    'karor',
    'taunsa',
    'jampur',
    'kot chutta',
}

# Sindh, Balochistan, KPK, Kashmir cities / districts — Rs. 280
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
    'tando muhammad khan',
    'tando soomro',
    'umar kot',
    'umarkot',
    'umerkot',
    'ghotki',
    'kashmore',
    'tharparkar',
    'mithi',
    'sanghar',
    'matiari',
    'sujawal',
    'naushahro feroze',
    'naushero feroze',
    'qambar',
    'shahdadkot',
    'qambar shahdadkot',
    'hala',
    'kotri',
    'mirpur bathoro',
    'kandhkot',
    'rohri',
    'mehar',
    'moro',
    'sakrand',
    # Balochistan (districts + towns)
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
    'dera bugti',
    'nushki',
    'kalat',
    'mastung',
    'pishin',
    'killa abdullah',
    'qilla abdullah',
    'killa saifullah',
    'qilla saifullah',
    'zhob',
    'sherani',
    'musakhel',
    'barkhan',
    'kohlu',
    'sibi',
    'ziarat',
    'harnai',
    'kachhi',
    'bolan',
    'jhal magsi',
    'jafarabad',
    'jaffarabad',
    'sohbatpur',
    'nasirabad',
    'kachhi',
    'kharan',
    'washuk',
    'awab',
    'awaran',
    'ketch',
    'kech',
    'gwadar',
    'lasbela',
    'hub chowki',
    'uthal',
    'bella',
    'winder',
    'dalbandin',
    'taftan',
    'muslim bagh',
    'qila saifullah',
    'dukki',
    'sana',
    'surab',
    'khudabadan',
    'dhadar',
    'mach',
    'bhag',
    'dera murad jamali',
    'd m jamali',
    'ustao muhammad',
    'usta muhammad',
    'gandawa',
    'jhat pat',
    'dera allah yar',
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
    'battagram',
    'lakki marwat',
    'hangu',
    'karak',
    'tank',
    'buner',
    'shangla',
    'torghar',
    'kolai palas',
    'upper dir',
    'lower dir',
    'malakand',
    'bajour',
    'bajaur',
    'mohmand',
    'khyber',
    'kurram',
    'orakzai',
    'north waziristan',
    'south waziristan',
    'waziristan',
    'parachinar',
    'landi kotal',
    'jamrud',
    'batkhela',
    'chakdara',
    'alpuri',
    'besham',
    'dassu',
    'kohistan',
    'upper kohistan',
    'lower kohistan',
    'hungu',
    # Azad Kashmir (AJK)
    'muzaffarabad',
    'mirpur',
    'kotli',
    'rawalakot',
    'bagh',
    'bhimber',
    'pallandri',
    'pallandari',
    'haveli',
    'neelum',
    'athmuqam',
    'hatian',
    'hattian',
    'sudhanoti',
    'sudhnoti',
    'forward kahuta',
    'kahuta ajk',
    'sehnsa',
    'dadyal',
    'chakswari',
    'islamgarh',
    'new mirpur',
    'mangla',
    'ajk',
    'azad kashmir',
    'azad jammu',
    'azad jammu kashmir',
    # Gilgit-Baltistan
    'gilgit',
    'skardu',
    'hunza',
    'nagar',
    'ghizer',
    'ghanche',
    'kharmang',
    'shigar',
    'astore',
    'diamir',
    'chilas',
    'gulmit',
    'karimabad',
    'aliabad',
    'passu',
    'khaplu',
    'gamba',
    'rondue',
    'baltistan',
    'gilgit baltistan',
}

REMOTE_CITY_LABELS = (
    'Karachi',
    'Hyderabad',
    'Sukkur',
    'Quetta',
    'Gwadar',
    'Peshawar',
    'Muzaffarabad',
    'Mirpur',
    'Gilgit',
    'Skardu',
)

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


def _combined_location_text(city, address=None):
    parts = [_normalize_city(city)]
    if address:
        parts.append(_normalize_city(address))
    return ' '.join(p for p in parts if p).strip()


def _keyword_match(name, keywords):
    tokens = name.split()
    for keyword in keywords:
        if ' ' in keyword:
            if keyword in name:
                return True
        elif keyword in tokens:
            return True
    return False


def _place_match(name, places):
    if name in places:
        return True
    tokens = name.split()
    if any(token in places for token in tokens):
        return True
    compact_name = name.replace(' ', '')
    for place in places:
        if ' ' in place and place in name:
            return True
        compact = place.replace(' ', '')
        if len(compact) >= 5 and compact in compact_name:
            return True
    return False


def is_nearby_city(city, address=None):
    """
    True only for Leopard Couriers service cities in Punjab / ICT.

    Writing "Punjab" alone (or a non-listed Punjab village) is NOT free —
    the city/area must match the allowlist.
    """
    # Prefer the city field; address only fills gaps for compound names.
    city_name = _normalize_city(city)
    if city_name and _place_match(city_name, NEARBY_CITIES):
        return True
    # Fallback: city typed into address line (e.g. "Street 4, Lahore")
    full = _combined_location_text(city, address)
    if full and _place_match(full, NEARBY_CITIES):
        return True
    return False


def is_remote_city(city, address=None):
    """
    True when NOT in Leopard Punjab/ICT free zone.

    Outside Punjab, and Punjab towns without Leopard service → paid rate.
    """
    if not _combined_location_text(city, address):
        return True
    return not is_nearby_city(city, address)


def calculate_shipping(quantity, city=None, address=None):
    """
    Free (no DC): Punjab/ICT cities, or Leopard DC incl. fuel+ST <= ~181.
    Paid: all other cities — SHIPPING_OTHER_RATE (Rs. 200).
    """
    quantity = int(quantity or 0)
    if quantity <= 0:
        return Decimal('0.00')

    free_rate = getattr(settings, 'SHIPPING_NEARBY_RATE', Decimal('0.00'))
    paid_rate = getattr(settings, 'SHIPPING_OTHER_RATE', Decimal('200.00'))

    try:
        from .flaship import fetch_leopard_cities, is_free_shipping_city

        if fetch_leopard_cities():
            if is_free_shipping_city(city or '', address):
                return Decimal(free_rate)
            return Decimal(paid_rate)
    except Exception:
        pass

    # Offline fallback — static Punjab allowlist
    if is_nearby_city(city, address):
        return Decimal(free_rate)
    return Decimal(paid_rate)


def shipping_range(quantity):
    """Return (punjab_rate, remote_rate) for the given cart quantity."""
    quantity = int(quantity or 0)
    punjab = calculate_shipping(quantity, city='Lahore')
    remote = calculate_shipping(quantity, city='Karachi')
    return punjab, remote
