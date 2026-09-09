# Suede surface decks

Premium slide decks, one per major Suede Labs AI surface. Built September 2026 from the surfaces' own product docs, audits and live copy.

| Deck | Surface | Slides |
|---|---|---|
| `suede-seo.pptx` | seo.suedeai.ai: full-stack GEO, managed AI agents, forward deployed engineering | 10 |
| `suede-agent-studio.pptx` | agents.suedeai.ai: visual agent builder with the x402 launch path | 10 |
| `suede-ip-registry.pptx` | ip.suedeai.ai: public provenance registry on Base and Avalanche | 10 |
| `suede-labs-flagship.pptx` | suedeai.ai and app.suedeai.ai: creator ownership infrastructure | 11 |
| `strumly.pptx` | strumly.suedeai.ai: AI guitar coach, The Signal Chain, music API | 9 |
| `suede-distro.pptx` | distro.suedeai.ai: independent music distribution at $7.99/mo | 7 |
| `suede-muse.pptx` | muse.suedeai.ai: The House Deck, one constraint a night | 7 |

PDF exports live in `pdf/`.

## Design system

Every deck shares one system in `source/lib.js` so the estate reads as one company:

- 16:9 wide canvas, Cambria display serif, Calibri body, Courier New for identifiers and ledger values.
- The recurring motif is the **ledger**: a dark evidence panel of label and value rows, echoing the registry and the "every claim opens a receipt" standard.
- Numbered index circles carry process flows and card grids.
- Each surface keeps its own palette: cobalt and white for SEO, indigo and white for Agent Studio, deep ink with registry cyan for the IP Registry, ink with rights red for the flagship, copper and amber for Strumly, deep green for Distro, violet for Muse.
- Backgrounds are generated gradient PNGs in `source/bg/`.

## Rebuilding

```bash
cd decks/source
npm init -y && npm install pptxgenjs
node deck-seo.js ../suede-seo.pptx      # and so on for each deck-*.js
```

`render.sh` converts a deck to PDF and a review grid; it needs LibreOffice Impress, poppler-utils and Pillow.
