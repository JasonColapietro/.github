# Instagram carousel — Suede AI × MSN SEO cohort

Seven slides covering the MSN story ["Suede AI Opens SEO Cohort With Optional AI Integration
and Live Agent Workflows"][msn], in a dark and a light treatment. MSN is credited on slide 1
(the "AS REPORTED ON MSN" badge) and again on slide 7, which links the article.

[msn]: https://www.msn.com/en-xl/news/other/suede-ai-opens-seo-cohort-with-optional-ai-integration-and-live-agent-workflows/ar-AA2cBTep

## Layout

    src/          14 HTML sources, <theme>-<nn>-<slug>.html
    images/dark/   7 PNG
    images/light/  7 PNG
    render.mjs     src/ -> images/

## Rendering

    PLAYWRIGHT_PKG=/path/to/playwright node render.mjs

Same shape as `../render.mjs`: each source declares `<meta name="size" content="1080x1350">`
and the theme comes from the filename prefix. Two differences. Output is **2x by default**
(2160x2700) — Instagram resizes to 1080 wide either way, and downsampling holds the type
better than uploading at native size; pass `SCALE=1` for pixel-exact 1080x1350. And the
renderer waits on `document.fonts.ready` and then warns if the brand faces did not arrive,
because a screenshot taken too early falls back to system fonts silently and the miss is easy
to overlook at thumbnail size.

Slides are numbered 01-07 in swipe order. 1080x1350 is the 4:5 portrait frame, the tallest
Instagram allows in a carousel.

## Palette

Built from the suedeai.org system (Instrument Serif / Geist / Geist Mono on deep ink), with
the accent moved to violet.

| Token | Dark | Light |
|---|---|---|
| ground | `#08061a` | `#f7f6fb` |
| panel | `#0c0a20` | `#ffffff` |
| raised | `#131029` | `#f1eefb` |
| text | `#eef2f7` | `#14121f` |
| secondary | `#c3ccd9` | `#3f3a52` |
| muted | `#8a97a8` | `#5b5670` |
| accent | `#a78bfa` | `#6d28d9` |
| accent 2 | `#c4b5fd` | `#7c3aed` |
| verified | `#34d399` | `#047857` |
| alert | `#f07179` | `#b91c1c` |
| rule | `#9f101a` | `#9f101a` |

The light theme is a remap, not an inversion: `#a78bfa` only reaches 2.3:1 on paper, so every
accent darkens to stay legible as text, and the radial glows are damped to 45% because a dark
violet wash on a light ground reads far heavier than a bright one on ink. Every text pairing
clears WCAG AA in both themes; the lowest is 5.48:1.

**This is a different system from `../brand/palette.md`**, which is the Agent Studio kit —
indigo `#4f46e5` on bright white. That one dresses the profile and cover surfaces; this one
follows the suedeai.org site the coverage is about. Worth reconciling if the two ever have to
sit next to each other in a feed.

## Cohort status

Slides 1, 2 and 7 state **3 of 5 seats open**. That is a live number, not a
design element: slide 2 marks seats 01-02 `FILLED` and 03-05 `OPEN`, and the
cover and the closing slide both carry it. Re-render after any change —
`src/dark-02-five-businesses.html` and its light twin hold the per-seat
markup, the cover chip is in `*-01-cover.html`, and the closing line is in
`*-07-read-on-msn.html`.

## Content notes

Sourced from the syndicated coverage of the release (Business Insider, TechBullion) and the
press record in `content/accomplishments.json` on suedeai-org, because msn.com is not
reachable from the sandbox these were built in. Worth a read against the live article before
posting.

The free website audit in the coverage closed at 11:59 p.m. ET on 20 September 2026, so it is
deliberately not the call to action — slide 7 points at the article and the handles instead.
