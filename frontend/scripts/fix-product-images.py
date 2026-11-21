from pathlib import Path
import re

p = Path(r"D:\startup\frontend\src\data\products.ts")
t = p.read_text(encoding="utf-8")


def repl(m: re.Match[str]) -> str:
    path = m.group(1)
    base = path.replace(".png", "")
    return f'image: "{base}.jpg",\n    imageCutout: "{path}",'


t2 = re.sub(r'image: "(/products/[^"]+\.png)",', repl, t)
p.write_text(t2, encoding="utf-8")
print("updated")
for line in t2.splitlines():
    if "image" in line and "products" in line:
        print(line.strip())
