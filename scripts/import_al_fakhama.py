"""Import AL-FAKHAMA product with cropped fixed-size images."""
from pathlib import Path

from PIL import Image

ASSETS = Path(r'C:\Users\majid\.cursor\projects\d-startup\assets')
MEDIA = Path(r'd:\startup\media')
MAIN_DIR = MEDIA / 'products'
GALLERY_DIR = MEDIA / 'products' / 'gallery'
MAIN_DIR.mkdir(parents=True, exist_ok=True)
GALLERY_DIR.mkdir(parents=True, exist_ok=True)

FRAGMENTS = [
    '1cd94c54',
    '5740cf96',
    '64f8c532',
    '777ea4ec',
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
        raise SystemExit('No AL-FAKHAMA images found in assets.')

    gallery_rels = []
    for i, src in enumerate(sources):
        with Image.open(src) as im:
            gal_path = GALLERY_DIR / f'al-fakhama-{i + 1:02d}.jpg'
            center_crop(im, 1000, 1000).save(gal_path, 'JPEG', quality=90, optimize=True)
            gallery_rels.append(f'products/gallery/{gal_path.name}')
            print(f'gallery: {gal_path.name} <- {src.name[-40:]}')

    # Prefer clean pedestal shot (3rd image) as main when available
    main_src = sources[2] if len(sources) > 2 else sources[0]
    with Image.open(main_src) as im:
        main_path = MAIN_DIR / 'al-fakhama-main.jpg'
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
        'AL-FAKHAMA is a luxurious fruity-oud fragrance inspired by the iconic Oud Maracujá. '
        'It opens with a juicy burst of passionfruit and bright fruity accords, laced with saffron '
        'and Turkish rose — exotic, luminous, and instantly addictive. At the heart, rich agarwood (oud) '
        'meets creamy benzoin and Indonesian patchouli for a warm, tropical depth. The dry-down settles '
        'into leather, amber, vanilla, and labdanum, enriched with akigalawood for a long, magnetic trail.\n\n'
        'A fragrance of magnificence — bold, exotic, and unforgettable. For those who wear presence like a crown.'
    )

    product, created = Product.objects.update_or_create(
        name='AL-FAKHAMA',
        defaults={
            'short_description': 'Inspired by Oud Maracujá — passionfruit, saffron rose & smoky oud.',
            'description': description,
            'top_notes': 'Passionfruit, Fruity Accords, Saffron, Turkish Rose',
            'heart_notes': 'Agarwood (Oud), Benzoin, Indonesian Patchouli',
            'base_notes': 'Leather, Amber, Vanilla, Labdanum, Akigalawood',
            'price': '2600.00',
            'size_ml': '50ml',
            'stock': 50,
            'gender': 'unisex',
            'is_featured': True,
        },
    )

    main_abs = MEDIA / Path(main_rel)
    with open(main_abs, 'rb') as f:
        product.image_main.save('al-fakhama-main.jpg', File(f), save=True)

    product.images.all().delete()
    for order, rel in enumerate(gallery_rels):
        abs_path = MEDIA / Path(rel)
        with open(abs_path, 'rb') as f:
            img = ProductImage(
                product=product,
                alt_text=f'AL-FAKHAMA view {order + 1}',
                order=order,
            )
            img.image.save(Path(rel).name, File(f), save=True)

    print(f'{"Created" if created else "Updated"}: {product.name} ({product.slug})')
    print(f'Main: {product.image_main.url} | Gallery: {product.images.count()}')
    print(f'URL: {product.get_absolute_url()}')


if __name__ == '__main__':
    main_rel, gallery_rels = prepare_images()
    create_product(main_rel, gallery_rels)
