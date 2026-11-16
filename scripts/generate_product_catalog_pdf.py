"""Generate a single PDF catalog of all Scentra Ryv products (image, description, price)."""
from __future__ import annotations

import os
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "media" / "products"
OUT = ROOT / "Scentra_Ryv_Products_Catalog.pdf"

PRODUCTS = [
    {
        "name": "Amition X",
        "image": "amition-x-main.jpg",
        "short_description": "Inspired by Dunhill Desire — apple, teak wood & warm vanilla musk.",
        "description": (
            "Amition X is a bold amber-woody fragrance inspired by the iconic Dunhill Desire. "
            "It opens with a crisp burst of apple, sparkling lemon, bergamot, and orange blossom — "
            "fresh, vibrant, and instantly captivating. At the heart, soft rose blends with rich teak wood "
            "and earthy patchouli for a confident, masculine depth. The dry-down settles into warm vanilla "
            "and sensual musk, leaving a smooth, lingering trail that feels ambitious, refined, and unforgettable. "
            "Crafted for the modern gentleman who leads with presence — day to night, boardroom to evening."
        ),
        "top_notes": "Apple, Lemon, Bergamot, Orange Blossom",
        "heart_notes": "Rose, Teak Wood, Patchouli",
        "base_notes": "Vanilla, Musk",
        "price": "2,000",
        "size_ml": "50ml",
        "gender": "Men",
    },
    {
        "name": "Prime Ryv",
        "image": "prime-ryv-main.jpg",
        "short_description": "Inspired by Azzaro Wanted — lemon, ginger, cardamom & tonka vetiver.",
        "description": (
            "Prime Ryv is a woody-spicy fragrance inspired by the charismatic Azzaro Wanted. "
            "It opens with a sparkling rush of lemon, fiery ginger, aromatic lavender, and cool mint — "
            "fresh, energetic, and impossible to ignore. The heart unfolds with crisp apple, Guatemalan "
            "cardamom, juniper, and geranium for a bold yet playful character. On the dry-down, creamy "
            "tonka bean blends with amberwood and Haitian vetiver, leaving a warm, confident trail that "
            "feels modern, magnetic, and unmistakably masculine. "
            "Made for the man who wants to be noticed — day, night, and every moment in between."
        ),
        "top_notes": "Lemon, Ginger, Lavender, Mint",
        "heart_notes": "Apple, Cardamom, Juniper, Geranium",
        "base_notes": "Tonka Bean, Amberwood, Haitian Vetiver",
        "price": "2,000",
        "size_ml": "50ml",
        "gender": "Men",
    },
    {
        "name": "AL-FAKHAMA",
        "image": "al-fakhama-main.jpg",
        "short_description": "Inspired by Oud Maracujá — passionfruit, saffron rose & smoky oud.",
        "description": (
            "AL-FAKHAMA is a luxurious fruity-oud fragrance inspired by the iconic Oud Maracujá. "
            "It opens with a juicy burst of passionfruit and bright fruity accords, laced with saffron "
            "and Turkish rose — exotic, luminous, and instantly addictive. At the heart, rich agarwood (oud) "
            "meets creamy benzoin and Indonesian patchouli for a warm, tropical depth. The dry-down settles "
            "into leather, amber, vanilla, and labdanum, enriched with akigalawood for a long, magnetic trail. "
            "A fragrance of magnificence — bold, exotic, and unforgettable. For those who wear presence like a crown."
        ),
        "top_notes": "Passionfruit, Fruity Accords, Saffron, Turkish Rose",
        "heart_notes": "Agarwood (Oud), Benzoin, Indonesian Patchouli",
        "base_notes": "Leather, Amber, Vanilla, Labdanum, Akigalawood",
        "price": "2,500",
        "size_ml": "50ml",
        "gender": "Unisex",
    },
    {
        "name": "Crush On You",
        "image": "crush-on-you-main.jpg",
        "short_description": "Inspired by VS Bombshell — passionfruit, peony & vanilla orchid.",
        "description": (
            "Crush On You is a bright fruity-floral fragrance inspired by Victoria's Secret Bombshell. "
            "It opens with the sparkling sweetness of Brazilian purple passionfruit, kissed with citrus "
            "and juicy tropical fruit — fresh, flirty, and impossible to ignore. The heart blooms with "
            "soft Shangri-La peony, creamy vanilla orchid, and delicate florals for a feminine, radiant "
            "glow. The dry-down settles into warm musk with a subtle Italian sunstruck pine twist, leaving "
            "a soft, addictive trail that feels confident, playful, and unforgettable. "
            "For the woman who owns every room she walks into — bold, beautiful, and always irresistible."
        ),
        "top_notes": "Passionfruit, Citrus, Grapefruit, Pineapple",
        "heart_notes": "Shangri-La Peony, Vanilla Orchid, Red Berries, Jasmine",
        "base_notes": "Musk, Italian Sunstruck Pine, Soft Woods",
        "price": "2,000",
        "size_ml": "50ml",
        "gender": "Women",
    },
    {
        "name": "Tazkiah",
        "image": "tazkiah-main.jpg",
        "short_description": "Inspired by Marj — oud, honey, saffron & amber leather.",
        "description": (
            "Tazkiah is a rich oriental-woody fragrance inspired by Marj by Ahmed Al Maghribi. "
            "It opens with a vibrant blend of bergamot, pink pepper, and tangerine, warmed by elemi, "
            "nutmeg, honey, and a touch of oud smoke — bold, spicy, and instantly captivating. "
            "The heart unfolds with cashmere wood, saffron, cinnamon, and patchouli, softened by rose, "
            "jasmine, orange blossom, and vetiver for a luxurious floral-spiced depth. "
            "The dry-down settles into agarwood, leather, amber, raspberry, sandalwood, musk, and oakmoss, "
            "leaving a warm, magnetic trail that feels powerful, refined, and unforgettable. "
            "A fragrance of purification and presence — for those who leave a lasting impression."
        ),
        "top_notes": "Bergamot, Pink Pepper, Tangerine, Elemi, Nutmeg, Honey, Oud",
        "heart_notes": "Cashmere Wood, Saffron, Cinnamon, Patchouli, Rose, Jasmine, Orange Blossom, Vetiver",
        "base_notes": "Agarwood, Leather, Amber, Raspberry, Sandalwood, Musk, Oakmoss, Violet",
        "price": "2,500",
        "size_ml": "50ml",
        "gender": "Men",
    },
    {
        "name": "Eloura",
        "image": "eloura-main.jpg",
        "short_description": "Inspired by Gucci Flora — pear blossom, gardenia & brown sugar.",
        "description": (
            "Eloura is a luminous floral fragrance inspired by Gucci Flora Gorgeous Gardenia. "
            "It opens with a cheerful burst of pear blossom, juicy red berries, and sparkling Italian "
            "mandarin — fresh, joyful, and radiant. At the heart, creamy white gardenia blooms with "
            "solar jasmine absolute and soft frangipani, wrapping the skin in a modern floral embrace. "
            "The dry-down settles into delicate brown sugar and earthy patchouli, leaving a sweet, "
            "elegant trail that feels feminine, playful, and unforgettable. "
            "A fragrance for moments that bloom — light, confident, and endlessly charming."
        ),
        "top_notes": "Pear Blossom, Red Berries, Italian Mandarin",
        "heart_notes": "White Gardenia, Jasmine Absolute, Frangipani",
        "base_notes": "Brown Sugar, Patchouli",
        "price": "2,000",
        "size_ml": "50ml",
        "gender": "Women",
    },
]

INK = colors.HexColor("#1a1a1a")
MUTED = colors.HexColor("#555555")
ACCENT = colors.HexColor("#8B7355")
LINE = colors.HexColor("#D4C4B0")
BG = colors.HexColor("#FAF7F2")


def _styles():
    base = getSampleStyleSheet()
    return {
        "cover_brand": ParagraphStyle(
            "cover_brand",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=28,
            textColor=INK,
            alignment=TA_CENTER,
            spaceAfter=8,
            tracking=2,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=12,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=6,
        ),
        "name": ParagraphStyle(
            "prod_name",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=18,
            textColor=INK,
            spaceAfter=4,
        ),
        "short": ParagraphStyle(
            "prod_short",
            parent=base["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=10,
            textColor=MUTED,
            spaceAfter=8,
            leading=14,
        ),
        "body": ParagraphStyle(
            "prod_body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            textColor=INK,
            alignment=TA_JUSTIFY,
            leading=13,
            spaceAfter=8,
        ),
        "label": ParagraphStyle(
            "prod_label",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            textColor=ACCENT,
            spaceBefore=2,
            spaceAfter=1,
        ),
        "notes": ParagraphStyle(
            "prod_notes",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            textColor=INK,
            leading=12,
            spaceAfter=4,
        ),
        "meta": ParagraphStyle(
            "prod_meta",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=INK,
            alignment=TA_LEFT,
        ),
        "footer": ParagraphStyle(
            "footer",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8,
            textColor=MUTED,
            alignment=TA_CENTER,
        ),
    }


def _product_image(filename: str, max_w=70 * mm, max_h=90 * mm):
    path = MEDIA / filename
    if not path.exists():
        return Paragraph(f"<i>Image not found: {filename}</i>", _styles()["notes"])
    img = Image(str(path))
    iw, ih = img.imageWidth, img.imageHeight
    scale = min(max_w / iw, max_h / ih)
    img.drawWidth = iw * scale
    img.drawHeight = ih * scale
    return img


def _product_block(p: dict, styles: dict):
    img = _product_image(p["image"])
    right = [
        Paragraph(p["name"], styles["name"]),
        Paragraph(p["short_description"], styles["short"]),
        Paragraph(
            f"Price: Rs {p['price']} &nbsp;&nbsp;|&nbsp;&nbsp; Size: {p['size_ml']} "
            f"&nbsp;&nbsp;|&nbsp;&nbsp; For: {p['gender']}",
            styles["meta"],
        ),
        Spacer(1, 6),
        Paragraph("Description", styles["label"]),
        Paragraph(p["description"], styles["body"]),
        Paragraph("Top Notes", styles["label"]),
        Paragraph(p["top_notes"], styles["notes"]),
        Paragraph("Heart Notes", styles["label"]),
        Paragraph(p["heart_notes"], styles["notes"]),
        Paragraph("Base Notes", styles["label"]),
        Paragraph(p["base_notes"], styles["notes"]),
    ]
    table = Table([[img, right]], colWidths=[75 * mm, 105 * mm])
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (0, 0), 10),
                ("RIGHTPADDING", (1, 0), (1, 0), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ("BACKGROUND", (0, 0), (-1, -1), BG),
                ("BOX", (0, 0), (-1, -1), 0.5, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    return KeepTogether([table, Spacer(1, 12)])


def _footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.4)
    y = 12 * mm
    canvas.line(18 * mm, y + 5 * mm, A4[0] - 18 * mm, y + 5 * mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, y, "Scentra Ryv — Product Catalog")
    canvas.drawRightString(A4[0] - 18 * mm, y, f"Page {doc.page}")
    canvas.restoreState()


def build():
    styles = _styles()
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=16 * mm,
        bottomMargin=20 * mm,
        title="Scentra Ryv Product Catalog",
        author="Scentra Ryv",
    )
    story = []
    story.append(Spacer(1, 55 * mm))
    story.append(Paragraph("SCENTRA RYV", styles["cover_brand"]))
    story.append(Paragraph("Product Catalog", styles["cover_sub"]))
    story.append(Spacer(1, 8))
    story.append(
        Paragraph(
            f"{len(PRODUCTS)} fragrances &nbsp;·&nbsp; Images, descriptions &amp; prices",
            styles["cover_sub"],
        )
    )
    story.append(Spacer(1, 20 * mm))
    story.append(
        Paragraph(
            "All products listed with main image, full description, scent notes, size, and price (PKR).",
            styles["cover_sub"],
        )
    )
    story.append(PageBreak())

    for i, product in enumerate(PRODUCTS):
        story.append(_product_block(product, styles))
        if i < len(PRODUCTS) - 1 and (i + 1) % 2 == 0:
            story.append(PageBreak())

    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
    print(f"Created: {OUT}")
    return OUT


if __name__ == "__main__":
    build()
