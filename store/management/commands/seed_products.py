from django.core.management.base import BaseCommand

from store.models import Product


PRODUCTS = [
    {
        'name': 'Amition X',
        'short_description': 'Inspired by Dunhill Desire — apple, teak wood & warm vanilla musk.',
        'description': (
            'Amition X is a bold amber-woody fragrance inspired by the iconic Dunhill Desire. '
            'It opens with a crisp burst of apple, sparkling lemon, bergamot, and orange blossom — '
            'fresh, vibrant, and instantly captivating. At the heart, soft rose blends with rich teak wood '
            'and earthy patchouli for a confident, masculine depth. The dry-down settles into warm vanilla '
            'and sensual musk, leaving a smooth, lingering trail that feels ambitious, refined, and unforgettable.\n\n'
            'Crafted for the modern gentleman who leads with presence — day to night, boardroom to evening.'
        ),
        'top_notes': 'Apple, Lemon, Bergamot, Orange Blossom',
        'heart_notes': 'Rose, Teak Wood, Patchouli',
        'base_notes': 'Vanilla, Musk',
        'price': '2000.00',
        'size_ml': '50ml',
        'gender': 'men',
    },
    {
        'name': 'Prime Ryv',
        'short_description': 'Inspired by Azzaro Wanted — lemon, ginger, cardamom & tonka vetiver.',
        'description': (
            'Prime Ryv is a woody-spicy fragrance inspired by the charismatic Azzaro Wanted. '
            'It opens with a sparkling rush of lemon, fiery ginger, aromatic lavender, and cool mint — '
            'fresh, energetic, and impossible to ignore. The heart unfolds with crisp apple, Guatemalan '
            'cardamom, juniper, and geranium for a bold yet playful character. On the dry-down, creamy '
            'tonka bean blends with amberwood and Haitian vetiver, leaving a warm, confident trail that '
            'feels modern, magnetic, and unmistakably masculine.\n\n'
            'Made for the man who wants to be noticed — day, night, and every moment in between.'
        ),
        'top_notes': 'Lemon, Ginger, Lavender, Mint',
        'heart_notes': 'Apple, Cardamom, Juniper, Geranium',
        'base_notes': 'Tonka Bean, Amberwood, Haitian Vetiver',
        'price': '2000.00',
        'size_ml': '50ml',
        'gender': 'men',
    },
    {
        'name': 'AL-FAKHAMA',
        'short_description': 'Inspired by Oud Maracujá — passionfruit, saffron rose & smoky oud.',
        'description': (
            'AL-FAKHAMA is a luxurious fruity-oud fragrance inspired by the iconic Oud Maracujá. '
            'It opens with a juicy burst of passionfruit and bright fruity accords, laced with saffron '
            'and Turkish rose — exotic, luminous, and instantly addictive. At the heart, rich agarwood (oud) '
            'meets creamy benzoin and Indonesian patchouli for a warm, tropical depth. The dry-down settles '
            'into leather, amber, vanilla, and labdanum, enriched with akigalawood for a long, magnetic trail.\n\n'
            'A fragrance of magnificence — bold, exotic, and unforgettable. For those who wear presence like a crown.'
        ),
        'top_notes': 'Passionfruit, Fruity Accords, Saffron, Turkish Rose',
        'heart_notes': 'Agarwood (Oud), Benzoin, Indonesian Patchouli',
        'base_notes': 'Leather, Amber, Vanilla, Labdanum, Akigalawood',
        'price': '2500.00',
        'size_ml': '50ml',
        'gender': 'unisex',
    },
    {
        'name': 'Crush On You',
        'short_description': 'Inspired by VS Bombshell — passionfruit, peony & vanilla orchid.',
        'description': (
            'Crush On You is a bright fruity-floral fragrance inspired by Victoria\'s Secret Bombshell. '
            'It opens with the sparkling sweetness of Brazilian purple passionfruit, kissed with citrus '
            'and juicy tropical fruit — fresh, flirty, and impossible to ignore. The heart blooms with '
            'soft Shangri-La peony, creamy vanilla orchid, and delicate florals for a feminine, radiant '
            'glow. The dry-down settles into warm musk with a subtle Italian sunstruck pine twist, leaving '
            'a soft, addictive trail that feels confident, playful, and unforgettable.\n\n'
            'For the woman who owns every room she walks into — bold, beautiful, and always irresistible.'
        ),
        'top_notes': 'Passionfruit, Citrus, Grapefruit, Pineapple',
        'heart_notes': 'Shangri-La Peony, Vanilla Orchid, Red Berries, Jasmine',
        'base_notes': 'Musk, Italian Sunstruck Pine, Soft Woods',
        'price': '2000.00',
        'size_ml': '50ml',
        'gender': 'women',
    },
    {
        'name': 'Tazkiah',
        'short_description': 'Inspired by Marj — oud, honey, saffron & amber leather.',
        'description': (
            'Tazkiah is a rich oriental-woody fragrance inspired by Marj by Ahmed Al Maghribi. '
            'It opens with a vibrant blend of bergamot, pink pepper, and tangerine, warmed by elemi, '
            'nutmeg, honey, and a touch of oud smoke — bold, spicy, and instantly captivating. '
            'The heart unfolds with cashmere wood, saffron, cinnamon, and patchouli, softened by rose, '
            'jasmine, orange blossom, and vetiver for a luxurious floral-spiced depth. '
            'The dry-down settles into agarwood, leather, amber, raspberry, sandalwood, musk, and oakmoss, '
            'leaving a warm, magnetic trail that feels powerful, refined, and unforgettable.\n\n'
            'A fragrance of purification and presence — for those who leave a lasting impression.'
        ),
        'top_notes': 'Bergamot, Pink Pepper, Tangerine, Elemi, Nutmeg, Honey, Oud',
        'heart_notes': 'Cashmere Wood, Saffron, Cinnamon, Patchouli, Rose, Jasmine, Orange Blossom, Vetiver',
        'base_notes': 'Agarwood, Leather, Amber, Raspberry, Sandalwood, Musk, Oakmoss, Violet',
        'price': '2500.00',
        'size_ml': '50ml',
        'gender': 'men',
    },
    {
        'name': 'Eloura',
        'short_description': 'Inspired by Gucci Flora — pear blossom, gardenia & brown sugar.',
        'description': (
            'Eloura is a luminous floral fragrance inspired by Gucci Flora Gorgeous Gardenia. '
            'It opens with a cheerful burst of pear blossom, juicy red berries, and sparkling Italian '
            'mandarin — fresh, joyful, and radiant. At the heart, creamy white gardenia blooms with '
            'solar jasmine absolute and soft frangipani, wrapping the skin in a modern floral embrace. '
            'The dry-down settles into delicate brown sugar and earthy patchouli, leaving a sweet, '
            'elegant trail that feels feminine, playful, and unforgettable.\n\n'
            'A fragrance for moments that bloom — light, confident, and endlessly charming.'
        ),
        'top_notes': 'Pear Blossom, Red Berries, Italian Mandarin',
        'heart_notes': 'White Gardenia, Jasmine Absolute, Frangipani',
        'base_notes': 'Brown Sugar, Patchouli',
        'price': '2000.00',
        'size_ml': '50ml',
        'gender': 'women',
    },
]


class Command(BaseCommand):
    help = 'Seed Scentra Ryv catalog products (prices/text only; images stay attached)'

    def handle(self, *args, **options):
        keep_names = {p['name'] for p in PRODUCTS}
        removed, _ = Product.objects.exclude(name__in=keep_names).delete()
        created_count = 0
        for data in PRODUCTS:
            _, created = Product.objects.update_or_create(
                name=data['name'],
                defaults={**data, 'stock': 50, 'is_featured': True},
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Seed complete: {created_count} created, '
                f'{len(PRODUCTS) - created_count} updated, {removed} extras removed.'
            )
        )
