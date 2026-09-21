# Instagram carousel — Suede AI × MSN SEO cohort

Seven slides covering the MSN story ["Suede AI Opens SEO Cohort With Optional AI Integration
and Live Agent Workflows"][msn]. MSN is credited on slide 1 and again on slide 7, which links
the article.

[msn]: https://www.msn.com/en-xl/news/other/suede-ai-opens-seo-cohort-with-optional-ai-integration-and-live-agent-workflows/ar-AA2cBTep

## Layout

    src/      8 HTML sources
    images/   8 PNG, 2160x2700
    render.mjs

Light scheme only. `01-cover.html` is the cover in use; `01-cover-with-capture.html` is the
same slide with a slot for a screenshot of the article (see below). Slides are numbered 01-07
in swipe order; 1080x1350 is the 4:5 portrait frame, the tallest Instagram allows in a
carousel.

## Rendering

    PLAYWRIGHT_PKG=/path/to/playwright node render.mjs

Same `<meta name="size">` contract as `../render.mjs`, with two departures. Output is **2x by
default** (2160x2700) — Instagram resizes to 1080 wide either way, and downsampling holds the
type better than uploading at native size; pass `SCALE=1` for pixel-exact 1080x1350. And it
waits on `document.fonts.ready` and warns if the brand faces did not arrive, because a
screenshot taken too early falls back to system fonts silently.

## The article capture

`01-cover-with-capture.html` carries a **920 x 400** placeholder where a screenshot of the MSN
article goes. It is a placeholder on purpose: nothing here fabricates a publisher's page. Drop
the real capture in by replacing the placeholder block with the `<img>` in the comment above
it, put the file next to the source, and re-render.

If the capture is used, prefer a shot that includes MSN's own masthead — the point of the slide
is that the coverage is real and checkable, and the typographic "AS REPORTED ON MSN" plate is
the fallback when no capture is available.

## Palette

Built from the suedeai.org system (Instrument Serif / Geist / Geist Mono), remapped to a paper
ground with a violet accent.

| Token | Hex |
|---|---|
| ground | `#f7f6fb` |
| panel | `#ffffff` |
| raised | `#f1eefb` |
| text | `#14121f` |
| secondary | `#3f3a52` |
| muted | `#5b5670` |
| accent | `#6d28d9` |
| accent 2 | `#7c3aed` |
| verified | `#047857` |
| alert | `#b91c1c` |
| rule | `#9f101a` |

Accents are darker than the ink-ground originals they derive from, because the bright violet
those slides used reaches only 2.3:1 on paper. Every text pairing clears WCAG AA; the lowest
is 5.48:1.

**This is a different system from `../brand/palette.md`**, which is the Agent Studio kit —
indigo `#4f46e5` on bright white. That one dresses the profile and cover surfaces; this one
follows the suedeai.org site the coverage is about. Worth reconciling if the two ever have to
sit next to each other in a feed.

## Cohort status

Slides 1, 2 and 7 state **3 of 5 seats open**, with two filled. That is a live number, not a
design element: slide 2 marks seats 01-02 `FILLED` and 03-05 `OPEN`, the cover carries it as a
chip (both cover variants), and slide 7 repeats it at the call to action. Re-render after any
change.

## Content notes

Sourced from the syndicated coverage of the release (Business Insider, TechBullion) and the
press record in `content/accomplishments.json` on suedeai-org, because msn.com is not reachable
from the sandbox these were built in. Worth a read against the live article before posting.

The free website audit in the coverage closed at 11:59 p.m. ET on 20 September 2026, so it is
deliberately not the call to action — slide 7 points at the article and the handles instead.
