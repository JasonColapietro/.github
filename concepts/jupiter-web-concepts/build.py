#!/usr/bin/env python3
"""Assemble the four boards into (a) local HTML for rendering and (b) Design-canvas artboards."""
import json, os, re, sys, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
LOCAL = os.path.join(ROOT, 'local')
CANVAS = os.path.join(ROOT, 'canvas', 'project')
os.makedirs(LOCAL, exist_ok=True); os.makedirs(CANVAS, exist_ok=True)

SVG = lambda body, w=12, h=12, sw=2.4: (
    f'<svg width="{w}" height="{h}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{body}</svg>')
ICONS = {
    'ARROW': SVG('<path d="M5 12h14"></path><path d="M13 6l6 6-6 6"></path>', 11, 11),
    'LOCK': SVG('<rect x="4" y="10" width="16" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path>', 8, 9, 2.6),
    'CHECK': SVG('<path d="M5 12l5 5L20 7"></path>', 10, 10, 3),
    'PHONE': SVG('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"></path>', 11, 11, 2.2),
    'BAG': SVG('<path d="M6 8h12l1 13H5z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path>', 11, 11, 2.2),
    'BEAN': SVG('<path d="M7 5c-4 4-3 11 1 14s10 1 12-4c-4 1-6-1-7-4s-3-6-6-6z"></path><path d="M9 8c2 3 4 6 4 10"></path>', 14, 14, 2),
    'BOARD': SVG('<path d="M12 2c5 4 6 10 4 16-1 3-3 4-4 4s-3-1-4-4C6 12 7 6 12 2z"></path><path d="M12 8v8"></path>', 14, 14, 2),
    'SHIELD': SVG('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"></path><path d="M9 12l2 2 4-4"></path>', 14, 14, 2),
    'TRUCK': SVG('<path d="M3 7h11v9H3z"></path><path d="M14 10h4l3 3v3h-7z"></path><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle>', 14, 14, 2),
    'DROP': SVG('<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"></path>', 14, 14, 2),
    'LEAF': SVG('<path d="M4 20c0-9 6-15 16-16-1 10-7 16-16 16z"></path><path d="M4 20c4-5 8-8 12-10"></path>', 14, 14, 2),
}

GOOGLE_FONTS = ("https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700"
    "&family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Sora:wght@400..800"
    "&family=Nunito:wght@400..900&family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800"
    "&family=Barlow+Condensed:wght@500;600;700&family=Archivo:ital,wdth,wght@0,62..125,400..900;1,62..125,400..900"
    "&family=Anton&family=Plus+Jakarta+Sans:wght@400..800&family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700"
    "&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Manrope:wght@400..800&family=Outfit:wght@400..800&display=swap")

BOARDS = [
    ('board1.html', 'Board-01-Food-Coffee.dc.html', 'Board 01 · Food & Coffee', '01 · Food & Coffee'),
    ('board2.html', 'Board-02-Coastal-Auto.dc.html', 'Board 02 · Coastal Adventure & Auto', '02 · Coastal Adventure & Auto'),
    ('board3.html', 'Board-03-Fitness-Care-Beauty.dc.html', 'Board 03 · Fitness, Care & Beauty', '03 · Fitness, Care & Beauty'),
    ('board4.html', 'Board-04-Flowers-Pools-Food.dc.html', 'Board 04 · Flowers, Pools & Fresh Food', '04 · Flowers, Pools & Fresh Food'),
]

shared = open(os.path.join(SRC, 'shared.css')).read()
blob_map = {}
bm_path = os.path.join(ROOT, 'blob_map.json')
if os.path.exists(bm_path):
    blob_map = json.load(open(bm_path))

def split(frag):
    m = re.match(r'\s*<style>(.*?)</style>\s*(.*)$', frag, re.S)
    return m.group(1), m.group(2)

def icons(html):
    for k, v in ICONS.items():
        html = html.replace(f'[[{k}]]', v)
    assert '[[' not in html, 'unreplaced icon token'
    return html

for src_name, dc_name, title, _ in BOARDS:
    css, markup = split(open(os.path.join(SRC, src_name)).read())
    markup = icons(markup)
    # local
    local_markup = markup.replace('src="assets/', 'src="../assets/')
    local = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{title}</title>
<link rel="stylesheet" href="../fonts/fonts.css">
<style>body{{margin:0;background:#E4E4E1}}
{shared}
{css}</style></head><body>
{local_markup}
</body></html>"""
    open(os.path.join(LOCAL, src_name), 'w').write(local)
    # web copy (self-contained, Google Fonts, relative assets) for the repository
    WEB = os.path.join(ROOT, 'web')
    os.makedirs(WEB, exist_ok=True)
    web_markup = markup.replace('src="assets/', 'src="../assets/')
    web = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{title}</title>
<meta name="viewport" content="width=1080">
<link rel="stylesheet" href="{GOOGLE_FONTS}">
<style>body{{margin:0;background:#E4E4E1;display:flex;justify-content:center;padding:24px 0}}
{shared}
{css}</style></head><body>
{web_markup}
</body></html>"""
    open(os.path.join(WEB, src_name.replace('board', 'board-0')), 'w').write(web)
    # canvas artboard
    def blob(m):
        name = m.group(1)
        if name not in blob_map:
            print(f'WARN no blob for {name}', file=sys.stderr); return m.group(0)
        return f'src="{blob_map[name]}"'
    dc_markup = re.sub(r'src="assets/([a-z]+)\.jpg"', blob, markup)
    dc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="{GOOGLE_FONTS}">
<style>
body{{margin:0;background:#E4E4E1;font-family:'Instrument Sans',sans-serif;color:#121212}}
a{{color:inherit}}a:hover{{color:inherit}}
{shared}
{css}</style>
</helmet>
{dc_markup}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":1080,"height":1350}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
"""
    open(os.path.join(CANVAS, dc_name), 'w').write(dc)

now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')
boards = {}
order = []
for i, (_, dc_name, title, short) in enumerate(BOARDS):
    boards[dc_name] = {"x": i * (1080 + 80), "y": 0, "w": 1080, "h": 1350, "title": short}
    order.append(dc_name)
index = {
    "v": 3,
    "createdOnFiles": {"v": 1, "at": now},
    "title": "Jupiter Web Concepts",
    "launch": {"view": "canvas"},
    "pages": [],
    "boards": boards,
    "order": order,
    "notes": {
        "title": {"x": 0, "y": -300, "text": "Jupiter / Web Concepts — 12 premium local-business homepages, 4 boards at 1080 × 1350", "kind": "title1", "maxW": 4560}
    },
    "designSystems": []
}
open(os.path.join(CANVAS, 'canvas.json'), 'w').write(json.dumps(index, indent=2))
print('built', [b[1] for b in BOARDS])
