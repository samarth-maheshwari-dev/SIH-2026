# Generate StackConnect emerald "S" logo PNG (128x128) + 512 variant
from PIL import Image, ImageDraw, ImageFont

def make_logo(size, path):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Emerald -> teal gradient rounded square background
    pad = size // 16
    radius = size // 5
    # draw rounded rect with vertical gradient
    for y in range(pad, size - pad):
        t = (y - pad) / (size - 2 * pad)
        r = int(16 + t * (20 - 16))
        g = int(185 + t * (184 - 185))
        b = int(129 + t * (166 - 129))
        d.rectangle([pad, y, size - pad, y + 1], fill=(r, g, b, 255))
    # clip rounded via mask-ish: draw corner circles (approx) — skip exact, keep minimal
    # "S" stroke — draw rounded bands
    c = (255, 255, 255, 255)
    w = size // 7
    # top bar
    d.rounded_rectangle([pad*1.6, size*0.22, size-pad*1.6, size*0.22+w], radius=w//2, fill=c)
    # upper curve right
    d.ellipse([size*0.62, size*0.18, size*0.62+w*2.4, size*0.56], fill=None, outline=c, width=w)
    # mid
    d.rounded_rectangle([pad*1.6, size*0.48, size-pad*1.6, size*0.48+w], radius=w//2, fill=c)
    # lower curve left
    d.ellipse([pad*1.6-w*0.7, size*0.46, pad*1.6+w*1.7, size*0.84], fill=None, outline=c, width=w)
    # bottom bar
    d.rounded_rectangle([pad*1.6, size*0.72, size-pad*1.6, size*0.72+w], radius=w//2, fill=c)
    img.save(path)
    print(f"saved {path} {size}x{size}")

make_logo(128, 'public/stackconnect.png')
make_logo(512, 'public/stackconnect_512.png')
