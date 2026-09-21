# Suede AI brand palette (Agent Studio)

The social kit uses the palette of Suede AI Agent Studio (agents.suedeai.ai): a bright white
product surface with an indigo accent, charcoal display type, and fine neutral lines. This is
the "locked bright white + indigo aesthetic" recorded when the Studio iOS shell shipped, and
the indigo executive node in the current org-chart hero.

| Token | Hex | Use |
|---|---|---|
| `--surface` | `#ffffff` | Page and card background |
| `--surface-muted` | `#f5f5fa` | Secondary panels |
| `--ink` | `#111827` | Charcoal display type |
| `--ink-muted` | `#4b5563` | Body copy on white |
| `--line` | `#e5e7eb` | Reporting lines, card borders |
| `--indigo` | `#4f46e5` | Primary accent, gradient start |
| `--indigo-deep` | `#4338ca` | Selected state, gradient end, on-indigo surfaces |
| `--indigo-soft` | `#eef2ff` | Tinted chips and category labels |
| `--on-indigo` | `#ffffff` | Text on indigo |

Type: Geist for display and UI. The renderer falls back to Inter, then the system sans.

Two treatments, one system:

- **Light** (founder surfaces): white field, charcoal type, indigo accents.
- **Indigo** (brand surfaces): `#4f46e5` to `#4338ca` gradient field, white type.

Sources: `images-src/*.html`. Render with `node render.mjs`.

Mark: the rounded-square "S" in these renders is a typographic stand-in built from the palette.
Swap in the approved Suede S-mark (checksum-verified copy in `suede-socials`) before uploading
if the estate mark is wanted; the layouts leave the same square for it.
