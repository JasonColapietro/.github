# CLAUDE.md

## Social posting

Every social post for this brand goes out **to both Facebook and Instagram, and
with Stories** — not one network, not the feed alone. Unless the user says
otherwise for a specific post:

- one feed post with `providers: [{"network":"instagram"}, {"network":"facebook"}]`
- plus Story posts, also to both, as separate scheduled posts (Stories carry no
  caption; send them with no text)

Metricool brand: **Suede Labs AI**, `blogId` 6957050, timezone `America/New_York`.
Instagram `@suedeai`, Facebook page `879955165201911`.

Feed images are 1080x1350 (4:5). **Stories need their own 1080x1920 art** — a 4:5
slide dropped into a Story crops badly. `social/ig-carousel/src/story-*.html` are
the story frames.

Metricool `media` takes public URLs. The repo is public, so push first and use
`https://raw.githubusercontent.com/JasonColapietro/.github/<commit-sha>/<path>`
— pin the commit SHA, not the branch name.

## Copy style

**No em dashes.** Not in captions, not on slides, not in thread copy. Use a
comma, a full stop, or a colon. The one exception is text quoted from a
publication: the MSN article's dateline reads "WEST PALM BEACH, Fla. —" and
the cover reproduces it as printed, because changing punctuation inside a
quote misquotes the source.

## Published posts

**Never edit, reschedule or reopen a post that has gone out**, and do not
re-post to "fix" one. If something is wrong with a live post, say so and let
the user decide. Checking status read-only is fine.

## Coverage

The cohort has been covered by **Business Insider** (20 Sept 2026) and **MSN**
(21 Sept 2026). Cite both.

- Business Insider: https://markets.businessinsider.com/news/currencies/award-winning-developer-jason-colapietro-opens-suede-labs-ai-s-long-awaited-seo-cohort-1036549662
- MSN: https://www.msn.com/en-xl/news/other/suede-ai-opens-seo-cohort-with-optional-ai-integration-and-live-agent-workflows/ar-AA2cBTep

Both outlets run the headline as "Suede Labs AI". We still say Suede AI.

## Brand name

The company is **Suede AI**. Not "Suede Labs AI" — that name appears in some
press (MSN runs "Suede AI, also known as Suede Labs AI") but is not what goes on
anything we publish.
