from django.core.management.base import BaseCommand

from store.models import Product


PRODUCTS = [
    {
        'name': 'Noir Elixir',
        'short_description': 'Dark oud wrapped in velvet rose and amber.',
        'description': (
            'A commanding evening fragrance that opens with saffron and bergamot, '
            'deepening into a heart of velvet rose and smoky oud, resting on a base '
            'of warm amber and sandalwood. Bold, mysterious, unforgettable.'
        ),
        'top_notes': 'Saffron, Bergamot, Pink Pepper',
        'heart_notes': 'Velvet Rose, Oud, Jasmine',
        'base_notes': 'Amber, Sandalwood, Musk',
        'price': '8990.00',
        'size_ml': '100ml',
        'gender': 'unisex',
    },
    {
        'name': 'Golden Dusk',
        'short_description': 'Sun-warmed vanilla with golden amber and iris.',
        'description': (
            'Inspired by the last light of day over ancient courtyards. Golden Dusk '
            'blends luminous iris with creamy vanilla and resinous amber for a '
            'soft yet opulent signature.'
        ),
        'top_notes': 'Mandarin, Cardamom, Iris',
        'heart_notes': 'Orange Blossom, Heliotrope',
        'base_notes': 'Vanilla, Amber, Benzoin',
        'price': '7490.00',
        'size_ml': '100ml',
        'gender': 'women',
    },
    {
        'name': 'Sultan\'s Veil',
        'short_description': 'Incense, leather, and royal spices.',
        'description': (
            'An homage to regal heritage — rich incense smoke mingles with supple '
            'leather and precious spices. A statement scent for those who command presence.'
        ),
        'top_notes': 'Black Pepper, Cinnamon, Incense',
        'heart_notes': 'Leather, Labdanum, Geranium',
        'base_notes': 'Patchouli, Cedarwood, Tonka Bean',
        'price': '9490.00',
        'size_ml': '100ml',
        'gender': 'men',
    },
    {
        'name': 'Mirage Bloom',
        'short_description': 'Desert florals kissed by citrus and white musk.',
        'description': (
            'Light yet lingering — Mirage Bloom captures the fleeting beauty of desert '
            'blossoms after rain. Fresh citrus gives way to white florals and a clean musk dry-down.'
        ),
        'top_notes': 'Yuzu, Neroli, Green Tea',
        'heart_notes': 'White Peony, Tuberose, Freesia',
        'base_notes': 'White Musk, Cashmere Wood, Vetiver',
        'price': '6990.00',
        'size_ml': '50ml',
        'gender': 'women',
    },
    {
        'name': 'Obsidian Crown',
        'short_description': 'Smoky vetiver with dark plum and oud.',
        'description': (
            'Powerful and refined. Obsidian Crown layers dark plum and black currant '
            'over Haitian vetiver and Cambodian oud — a modern masculine classic.'
        ),
        'top_notes': 'Black Currant, Plum, Elemi',
        'heart_notes': 'Vetiver, Clary Sage, Cedar',
        'base_notes': 'Oud, Leather, Dark Amber',
        'price': '8490.00',
        'size_ml': '100ml',
        'gender': 'men',
    },
    {
        'name': 'Celestial Oud',
        'short_description': 'Rare oud with honeyed florals and soft spice.',
        'description': (
            'Our signature elixir — Celestial Oud balances the depth of rare oud with '
            'honeyed osmanthus and a whisper of saffron. The essence of Scentra Ryv.'
        ),
        'top_notes': 'Saffron, Honey, Bergamot',
        'heart_notes': 'Osmanthus, Rose, Oud',
        'base_notes': 'Ambergris Accord, Sandalwood, Vanilla',
        'price': '10990.00',
        'size_ml': '100ml',
        'gender': 'unisex',
    },
]


class Command(BaseCommand):
    help = 'Seed the store with 6 luxury perfume products'

    def handle(self, *args, **options):
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
                f'{len(PRODUCTS) - created_count} updated.'
            )
        )
