"""Import Prime Ryv product with cropped fixed-size images."""
from pathlib import Path

from PIL import Image

ASSETS = Path(r'C:\Users\majid\.cursor\projects\d-startup\assets')
MEDIA = Path(r'd:\startup\media')
MAIN_DIR = MEDIA / 'products'
GALLERY_DIR = MEDIA / 'products' / 'gallery'
MAIN_DIR.mkdir(parents=True, exist_ok=True)
GALLERY_DIR.mkdir(parents=True, exist_ok=True)

# Unique image id fragments from this upload
FRAGMENTS = [
    '9e3073fc',
    '8a7bea47',
    '7b459f93',
    '844e7ec7',
    'ed3b49cb',
    '614b206b',
]


def center_crop(img: Image.Image, tw: int, th: int) -> Image.Image:
    img = img.convert('RGB')
    w, h = img.size
    target_ratio = tw / th
    ratio = w / h
    if ratio > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        img = img.crop((left, 0, left + new_w, h))
    else:
        new_h = int(w / target_ratio)
        top = max(0, (h - new_h) // 3)
        if top + new_h > h:
            top = h - new_h
        img = img.crop((0, top, w, top + new_h))
    return img.resize((tw, th), Image.Resampling.LANCZOS)


def prepare_images():
    sources = []
    for frag in FRAGMENTS:
        matches = list(ASSETS.glob(f'*{frag}*'))
        if matches:
            sources.append(matches[0])

    if not sources:
        raise SystemExit('No Prime Ryv images found in assets.')

    gallery_rels = []
    for i, src in enumerate(sources):
        with Image.open(src) as im:
            gal_path = GALLERY_DIR / f'prime-ryv-{i + 1:02d}.jpg'
            center_crop(im, 1000, 1000).save(gal_path, 'JPEG', quality=90, optimize=True)
            gallery_rels.append(f'products/gallery/{gal_path.name}')
            print(f'gallery: {gal_path.name} <- {src.name[-40:]}')

    # Prefer clean pedestal shot (4th image / 844e7ec7) as main
    main_src = sources[3] if len(sources) > 3 else sources[0]
    with Image.open(main_src) as im:
        main_path = MAIN_DIR / 'prime-ryv-main.jpg'
        center_crop(im, 900, 1200).save(main_path, 'JPEG', quality=90, optimize=True)
        main_rel = f'products/{main_path.name}'
        print(f'main: {main_path.name} <- {main_src.name[-40:]}')

    return main_rel, gallery_rels


def create_product(main_rel, gallery_rels):
    import os
    import sys

    import django

    sys.path.insert(0, r'd:\startup')
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'startup.settings')
    django.setup()

    from django.core.files import File
    from store.models import Product, ProductImage

    description = (
        'Prime Ryv is a woody-spicy fragrance inspired by the charismatic Azzaro Wanted. '
        'It opens with a sparkling rush of lemon, fiery ginger, aromatic lavender, and cool mint — '
        'fresh, energetic, and impossible to ignore. The heart unfolds with crisp apple, Guatemalan '
        'cardamom, juniper, and geranium for a bold yet playful character. On the dry-down, creamy '
        'tonka bean blends with amberwood and Haitian vetiver, leaving a warm, confident trail that '
        'feels modern, magnetic, and unmistakably masculine.\n\n'
        'Made for the man who wants to be noticed — day, night, and every moment in between.'
    )

    product, created = Product.objects.update_or_create(
        name='Prime Ryv',
        defaults={
            'short_description': 'Inspired by Azzaro Wanted — lemon, ginger, cardamom & tonka vetiver.',
            'description': description,
            'top_notes': 'Lemon, Ginger, Lavender, Mint',
            'heart_notes': 'Apple, Cardamom, Juniper, Geranium',
            'base_notes': 'Tonka Bean, Amberwood, Haitian Vetiver',
            'price': '7490.00',
            'size_ml': '50ml',
            'stock': 50,
            'gender': 'men',
            'is_featured': True,
        },
    )

    main_abs = MEDIA / Path(main_rel)
    with open(main_abs, 'rb') as f:
        product.image_main.save('prime-ryv-main.jpg', File(f), save=True)

    product.images.all().delete()
    for order, rel in enumerate(gallery_rels):
        abs_path = MEDIA / Path(rel)
        with open(abs_path, 'rb') as f:
            img = ProductImage(
                product=product,
                alt_text=f'Prime Ryv view {order + 1}',
                order=order,
            )
            img.image.save(Path(rel).name, File(f), save=True)

    print(f'{"Created" if created else "Updated"}: {product.name} ({product.slug})')
    print(f'Main: {product.image_main.url} | Gallery: {product.images.count()}')
    print(f'URL: {product.get_absolute_url()}')


if __name__ == '__main__':
    main_rel, gallery_rels = prepare_images()
    create_product(main_rel, gallery_rels)
