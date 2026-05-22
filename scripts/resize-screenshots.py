"""
Downscale Shopify App Store screenshots from 3200x1800 to 1600x900.
DevTools captured at DPR=2 — Shopify wants exactly 1600x900.

Usage: python scripts/resize-screenshots.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent.parent
SCREENSHOTS = ROOT / "screenshots"
TARGET = (1600, 900)

for png in sorted(SCREENSHOTS.glob("*.png")):
    img = Image.open(png)
    if img.size == TARGET:
        print(f"[skip] {png.name} already {TARGET}")
        continue
    if img.size[0] / img.size[1] != TARGET[0] / TARGET[1]:
        print(f"[WARN] {png.name} is {img.size}, not 16:9 — skipping")
        continue
    resized = img.resize(TARGET, Image.LANCZOS)
    resized.save(png, "PNG", optimize=True)
    print(f"[done] {png.name}: {img.size} -> {TARGET}")

print("\nDone. All screenshots in screenshots/ are now 1600x900.")
print("Also use any of them as the video thumbnail.")
