"""Import Amition X product with cropped fixed-size images."""
from pathlib import Path

from PIL import Image

ASSETS = Path(r'C:\Users\majid\.cursor\projects\d-startup\assets')
MEDIA = Path(r'd:\startup\media')
MAIN_DIR = MEDIA / 'products'
GALLERY_DIR = MEDIA / 'products' / 'gallery'
MAIN_DIR.mkdir(parents=True, exist_ok=True)
GALLERY_DIR.mkdir(parents=True, exist_ok=True)

# Prefer larger product shots first
SUFFIXES = {'.png', '.jpg', '.jpeg', '.webp'}


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
    candidates = sorted(
        [p for p in ASSETS.iterdir() if p.suffix.lower() in SUFFIXES],
        key=lambda p: p.stat().st_size,
        reverse=True,
    )[:7]

    main_rel = None
    gallery_rels = []

    for i, src in enumerate(candidates):
        with Image.open(src) as im:
            if i == 0:
                main_path = MAIN_DIR / 'amition-x-main.jpg'
                center_crop(im, 900, 1200).save(main_path, 'JPEG', quality=90, optimize=True)
                main_rel = f'products/{main_path.name}'
                print(f'main: {main_path} <- {src.name}')

            gal_path = GALLERY_DIR / f'amition-x-{i + 1:02d}.jpg'
            center_crop(im, 1000, 1000).save(gal_path, 'JPEG', quality=90, optimize=True)
            gallery_rels.append(f'products/gallery/{gal_path.name}')
            print(f'gallery: {gal_path.name} <- {src.name}')

    return main_rel, gallery_rels


def create_product(main_rel, gallery_rels):
    import django
    import os
    import sys

    sys.path.insert(0, r'd:\startup')
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'startup.settings')
    django.setup()

    from django.core.files import File
    from store.models import Product, ProductImage

    description = (
        'Amition X is a bold amber-woody fragrance inspired by the iconic Dunhill Desire. '
        'It opens with a crisp burst of apple, sparkling lemon, bergamot, and orange blossom — '
        'fresh, vibrant, and instantly captivating. At the heart, soft rose blends with rich teak wood '
        'and earthy patchouli for a confident, masculine depth. The dry-down settles into warm vanilla '
        'and sensual musk, leaving a smooth, lingering trail that feels ambitious, refined, and unforgettable.\n\n'
        'Crafted for the modern gentleman who leads with presence — day to night, boardroom to evening.'
    )

    product, created = Product.objects.update_or_create(
        name='Amition X',
        defaults={
            'short_description': 'Inspired by Dunhill Desire — apple, teak wood & warm vanilla musk.',
            'description': description,
            'top_notes': 'Apple, Lemon, Bergamot, Orange Blossom',
            'heart_notes': 'Rose, Teak Wood, Patchouli',
            'base_notes': 'Vanilla, Musk',
            'price': '7990.00',
            'size_ml': '50ml',
            'stock': 50,
            'gender': 'men',
            'is_featured': True,
        },
    )

    # Replace main image
    main_abs = MEDIA / main_rel.replace('/', '\\') if '\\' not in main_rel else MEDIA / main_rel
    main_abs = MEDIA / Path(main_rel)
    with open(main_abs, 'rb') as f:
        product.image_main.save('amition-x-main.jpg', File(f), save=True)

    # Refresh gallery
    product.images.all().delete()
    for order, rel in enumerate(gallery_rels):
        abs_path = MEDIA / Path(rel)
        with open(abs_path, 'rb') as f:
            img = ProductImage(product=product, alt_text=f'Amition X view {order + 1}', order=order)
            img.image.save(Path(rel).name, File(f), save=True)

    print(f'{"Created" if created else "Updated"} product: {product.name} (slug={product.slug})')
    print(f'Main: {product.image_main.url}')
    print(f'Gallery images: {product.images.count()}')


if __name__ == '__main__':
    main_rel, gallery_rels = prepare_images()
    create_product(main_rel, gallery_rels)
