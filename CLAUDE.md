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

## Brand name

The company is **Suede AI**. Not "Suede Labs AI" — that name appears in some
press (MSN runs "Suede AI, also known as Suede Labs AI") but is not what goes on
anything we publish.
