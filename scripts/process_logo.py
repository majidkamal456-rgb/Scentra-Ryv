"""Knock out the black background from the Scentra Ryv logo."""
from pathlib import Path

from PIL import Image

SRC = Path(
    r"C:\Users\majid\.cursor\projects\d-startup\assets"
    r"\c__Users_majid_AppData_Roaming_Cursor_User_workspaceStorage"
    r"_9ea4e5e2ad771dd40935e915800a832e_images"
    r"_image-8bbe257c-9ea5-48b2-82d0-78144096d8be.png"
)
OUT_DIR = Path(__file__).resolve().parent.parent / "static" / "images"

# Tight crops of the original 1024 artboard (icon vs full lockup).
ICON_BOX = (250, 220, 780, 628)
FULL_BOX = (250, 220, 780, 820)


def luma(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b


def knockout(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    pixels = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, _a = pixels[x, y]
            sat = max(r, g, b) - min(r, g, b)
            yv = luma(r, g, b)
            gold = sat >= 22 and r > b + 6 and r >= 36
            if gold:
                alpha = 255
            elif yv < 24 or sat < 18:
                alpha = 0
            else:
                alpha = int(max(0, min(220, (yv - 20) * 6)))
            pixels[x, y] = (r, g, b, alpha)
    return im


def gold_bbox(im: Image.Image, pad=6):
    px = im.load()
    w, h = im.size
    minx, miny, maxx, maxy = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 48 and r > b + 6:
                found = True
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    if not found:
        return (0, 0, w, h)
    return (
        max(0, minx - pad),
        max(0, miny - pad),
        min(w, maxx + 1 + pad),
        min(h, maxy + 1 + pad),
    )


def export(box, name):
    src = Image.open(SRC).crop(box)
    out = knockout(src)
    out = out.crop(gold_bbox(out))
    dest = OUT_DIR / name
    out.save(dest, "PNG")
    print("saved", dest, out.size)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    export(ICON_BOX, "logo-mark.png")
    export(FULL_BOX, "logo.png")


if __name__ == "__main__":
    main()
