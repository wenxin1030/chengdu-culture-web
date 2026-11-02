import sys
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]; cols = int(sys.argv[2]); names = sys.argv[3:]
tw, th, pad, lab = 320, 240, 10, 26
rows = (len(names) + cols - 1) // cols
W = cols * (tw + pad) + pad
H = rows * (th + lab + pad) + pad
sheet = Image.new("RGB", (W, H), (24, 34, 32))
d = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 15)
except Exception:
    font = ImageFont.load_default()
for i, nm in enumerate(names):
    r, c = divmod(i, cols)
    x = pad + c * (tw + pad); y = pad + r * (th + lab + pad)
    im = Image.open(".preview/" + nm + ".png").convert("RGB")
    im.thumbnail((tw, th))
    sheet.paste(im, (x, y))
    d.rectangle([x, y, x + tw - 1, y + th - 1], outline=(70, 90, 84))
    d.text((x + 2, y + th + 4), nm, font=font, fill=(230, 226, 210))
sheet.save(out)
print(out, sheet.size)
