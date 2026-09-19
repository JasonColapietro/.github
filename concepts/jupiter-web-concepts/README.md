# Jupiter / Web Concepts

Twelve homepage concepts for local businesses in Jupiter, FL, presented on four
1080 × 1350 (4:5) boards. Unofficial redesign concepts, not affiliated with the
businesses shown. Concept imagery only.

| Board | Concepts |
|---|---|
| 01 · Food & Coffee | Guanabanas, Crux Coffee Roasters, Jupiter Donuts |
| 02 · Coastal Adventure & Auto | Blueline Surf & Paddle Co., Jupiter Dive Center, Dany's Detailing |
| 03 · Fitness, Care & Beauty | FitTown Jupiter, Jupiter Dentistry, Tipsy Salon & Spa |
| 04 · Flowers, Pools & Fresh Food | Anna Flowers of Jupiter, Pristine Pool Service & Supply, Golden Juicery |

## Layout

- `boards/` — the four boards as standalone HTML pages (Google Fonts, relative assets). Open any of them in a browser.
- `exports/` — the boards rendered at 2× (2160 × 2700 PNG), ready to post.
- `assets/` — the photo crops used by the boards.
- `src/` — the board sources: `shared.css` (board shell, browser chrome, hero grid) and one fragment per board.
- `build.py` — assembles `src/` into `web/` (the pages in `boards/`), `local/` (same pages with self-hosted fonts, used for rendering) and `canvas/` (Design-canvas artboards).
- `shoot.js` — renders `local/` to PNG with Playwright (`node shoot.js`, needs `playwright-core` and a Chromium binary).

## Rebuilding

```
python3 build.py        # emits web/, local/, canvas/
node shoot.js           # renders out/jupiter-web-concepts-0N.png at 2×
```

`local/` expects `fonts/fonts.css` with self-hosted copies of the Google Fonts
used by the boards; `web/` loads the same families from Google Fonts directly.
