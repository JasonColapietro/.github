# Suede AI Agent Studio walkthrough: find, win and keep a client

[`suede-agency-walkthrough.mp4`](suede-agency-walkthrough.mp4) is 5 min 24 s, 1920×1080, H.264, with an AAC voiceover read by Kokoro (the British `bf_emma` voice), matching on-screen captions, and an original background track that ducks under the voice.

The video follows an agency, Northlight Growth, as it takes one prospect from first audit to active client in the Studio's Clients workspace. The prospect is Brightside Family Dental. Both businesses are fictional and everything shown is sample data. The whole run is dry: nothing is crawled, sent, called or charged.

| Chapter | Pages | What happens |
|---|---|---|
| 1 · Find | `/`, `/clients`, `/clients/new`, `/clients/[id]` | The homepage ("Reports win clients. Workflows keep them."). The practice is added on camera as a prospect, and its next action reads "Run the first audit" |
| 2 · Audit | `/clients/[id]/audit` | Audit v1, scoring 74/100, and the three items below. Both findings and their prepared fixes are switched on for the prospect |
| 3 · Offer | `/clients/[id]/packet` | The two-brand packet is built from the audit and the selection, previewed, and published |
| 4 · Win | `/clients/[id]/brand`, `/clients/[id]/inboxes`, `/clients/[id]` | The first-touch email is approved; approving it does not send it. Dr. Park's illustrative reply and the prepared scope follow, then the practice is marked Active |
| 5 · Keep | `/clients/[id]/voice`, `leads`, `kpis`, `loop`, `share`, `/cv/[token]` | The four steps below, ending on the read-only client view with both brands on it |
| 6 · Agents | `/docs/seo-skills`, `/clients` | MCP and the twelve SEO skills an AI assistant can run for each client |

Audit v1 contains:
- duplicate titles on three pages, with the pages as evidence
- the operator's own observation that 2 of 3 after-hours test calls reached voicemail; nothing is inferred from the website
- AI visibility marked as not run, rather than guessed

The Keep chapter shows:
- a sample after-hours call that the AI receptionist handled
- the caller becoming a client lead, moved to Booked on camera
- KPIs that start from a baseline and show where each number came from
- the monthly loop, with the next client review on record

## How it was made

The sandbox it was recorded in cannot reach agents.suedeai.ai. The app was therefore run locally from `JasonColapietro/suede-agent-studio` at `main` (`bd4be64`), with no source changes:

- `next dev` with `DB_DRIVER=sqlite`
- no provider keys
- no credit, no spend exemption, and live sending off

The repo's local dev sign-in supplied the session.

[`recorder/local-brightside-seed.ts`](recorder/local-brightside-seed.ts) fills in what the camera can't do in this environment. It runs in three phases between recording segments, and it uses the app's own repo functions:

1. **`prep`:** the sample agency identity.
2. **`audit`:** runs after the client is created on camera.
   - Audit v1 goes through the real `runClientAudit` pipeline, with stubbed crawl runners because the sandbox can't fetch the site.
   - It also adds the outreach draft and the illustrative reply.
3. **`client`:** runs after the client is marked Active on camera. It adds:
   - the sample call
   - the client leads
   - the KPI baselines
   - this month's loop steps
   - a client-view link

These steps were done on camera through the UI:
- creating the client
- the include toggles
- building and publishing the packet
- approving the outreach
- the status change
- the lead stage change

To record:
1. Put the seed script in the Studio repo's `scripts/` folder and run the app as above.
2. In a scratch folder, put a `devsecret` file holding `AGX_DEV_SIGN_IN`, then run [`recorder/auth.mjs`](recorder/auth.mjs). It writes `state.json`.
3. Run `seed.sh prep`. [`recorder/seed.sh`](recorder/seed.sh) reads `STUDIO` (the Studio repo path) and `SCRATCH` (the scratch folder).
4. Run [`recorder/story.mjs`](recorder/story.mjs), which uses [`recorder/lib.mjs`](recorder/lib.mjs) for the screencast, captions, cards and narration.
5. Run [`recorder/build.mjs`](recorder/build.mjs) to encode the silent video, then [`recorder/mix.mjs`](recorder/mix.mjs) to add the voice track.
6. Run [`recorder/add-music.sh`](recorder/add-music.sh) to add the background music.

## Voiceover

The narration is the on-screen captions read aloud by Kokoro, using the British `bf_emma` voice. A few words are spelled out first so they're read correctly; for example "AI" becomes "A.I." and "5pm" becomes "5 p.m.".

- **Model and runtime:** Kokoro v0.19 in its sherpa-onnx export (`kokoro-int8-en-v0_19`), run through the official `sherpa-onnx-node` package. Hugging Face was blocked in the recording sandbox, so the model files were copied from the npm package `n8n-nodes-ttsbro`, which bundles them. Only the model files were used; none of that package's code was run.
- **Pacing:** the recorder waits for each line to finish before it moves to the next caption or cuts to the next page. Each scene therefore lasts as long as its line.
- **Caching:** the first take synthesizes every line with the camera paused and caches it in `vo/`. A second take from a clean database then plays at natural pace.
- **Placement:** `mix.mjs` maps each line's logged start time onto the cut-down video, places the clips with `adelay`, and normalizes the mix to −16 LUFS.

To use a different voice, set `VO_SID` (the default is 7, `bf_emma`). [`recorder/pregen.cjs`](recorder/pregen.cjs) re-voices every cached line for a new speaker, so one take is enough. The available voices are 0 `af`, 1 `af_bella`, 2 `af_nicole`, 3 `af_sarah`, 4 `af_sky`, 5 `am_adam`, 6 `am_michael`, 7 `bf_emma`, 8 `bf_isabella`, 9 `bm_george` and 10 `bm_lewis`.

## Music

[`recorder/music.py`](recorder/music.py) composes the background track from scratch, with no samples or licensed music, so Suede owns it outright. It uses numpy to synthesize a 96 BPM bed in D major. The bed follows the D - Bm - G - A progression of the Studio's *Live Canvas* motion film.

- **Instruments:** a soft pad, an FM electric piano, a round bass, a marimba-like arpeggio, and light kick, rim and hats.
- **Structure:** a two-bar intro, then a 16-bar cycle of 10 full bars followed by 6 lighter bars without drums, then a held D add9 chord to finish.

[`recorder/add-music.sh`](recorder/add-music.sh) mixes it under the voice:
- It removes the lowest bass and dips the 250 Hz and 2.5 kHz ranges, so the voice stays clear.
- It sets the music to -24 LUFS and ducks it under the voice with sidechain compression.
- The final mix measures about -16.8 LUFS overall. Between lines, the music plays on its own at about -24 LUFS.
