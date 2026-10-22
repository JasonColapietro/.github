# Suede AI Agent Studio walkthrough: find, win and keep a client

[`suede-agency-walkthrough.mp4`](suede-agency-walkthrough.mp4) is 5 min 46 s, 1920×1080, H.264, with a 48 kHz AAC voiceover read by Kokoro v1.0 (the British `bf_emma` voice), matching on-screen captions, and an original background track that ducks under the voice.

The video follows an agency, Northlight Growth, as it takes one prospect from first audit to active client in the Studio's Clients workspace. The prospect is Brightside Family Dental. Both businesses are fictional and everything shown is sample data. The whole run is dry: nothing is crawled, sent, called or charged.

| Chapter | Pages | What happens |
|---|---|---|
| 1 · Find | `/`, `/clients`, `/clients/new`, `/clients/[id]` | The homepage ("Turn audits into clients. Keep them on autopilot."). The practice is added on camera as a prospect, and its next action reads "Run the first audit" |
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

The sandbox it was recorded in cannot reach agents.suedeai.ai. The app was therefore run locally from `JasonColapietro/suede-agent-studio` at `main` (`3c03e93`), with no source changes, in the site's default light theme:

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

The narration is the on-screen captions read aloud by Kokoro v1.0, using the British `bf_emma` voice. The script is written to be heard: full sentences with verbs, no parentheses, and no lists strung together with colons.

- **Model:** Kokoro-82M v1.0 at full precision, in the official k2-fsa export (`kokoro-multi-lang-v1_0` from the `tts-models` release of `k2-fsa/sherpa-onnx` on GitHub). Hugging Face was blocked in the recording sandbox, and that release is the official copy that was reachable. Its `bf_emma` voice matches the one in the official `kokoro-js` npm package byte for byte.
- **Pronunciation:** [`recorder/kokoro_v1.py`](recorder/kokoro_v1.py) turns each line into phonemes with misaki in British mode, the phonemizer Kokoro v1.0 was trained with. misaki uses spaCy's `en_core_web_sm` for word types and espeak-ng for words it doesn't know. The script then runs the model with onnxruntime and picks the voice's style vector by phoneme count, as Kokoro's own pipeline does. misaki already reads "AI", "KPIs", "SEO", "MCP" and "5pm" correctly. `spoken()` in `lib.mjs` spells out only "7:12pm", "10am", "Nov 19" and "v1".
- **Pacing:** the recorder waits for each line to finish before it moves to the next caption or cuts to the next page. Each scene therefore lasts as long as its line.
- **Caching:** the first take voices every line with the camera paused and caches it in `vo/`, keyed by model, voice, speed and text. A second take from a clean database then plays at natural pace.
- **Placement:** `mix.mjs` maps each line's logged start time onto the cut-down video, places the clips with `adelay`, normalizes the mix to −16 LUFS, and resamples it to 48 kHz.

Setting up the voice:
1. Create a Python 3.12 environment.
2. Install `misaki==0.9.4 num2words spacy phonemizer-fork espeakng-loader onnxruntime numpy` in it, plus `en_core_web_sm` 3.8.0 from spaCy's GitHub release.
3. Set `KOKORO_PY` to that environment's Python and `KOKORO_DIR` to the unpacked `kokoro-multi-lang-v1_0` folder. `lib.mjs` starts one synthesis worker per take, so the model loads once.

To use a different voice, set `VO_VOICE` (the default is `bf_emma`). [`recorder/pregen.cjs`](recorder/pregen.cjs) voices every cached line for the new voice ahead of time, so one more take is enough. British voices are `bf_alice`, `bf_emma`, `bf_isabella`, `bf_lily`, `bm_daniel`, `bm_fable`, `bm_george` and `bm_lewis`. American ones include `af_heart`, `af_bella`, `am_michael` and `am_fenrir`.

The first versions of this video and the social cuts used Kokoro v0.19 in its compressed int8 sherpa-onnx export, with American pronunciation rules applied to the British voice.

## Music

[`recorder/music.py`](recorder/music.py) composes the background track from scratch, with no samples or licensed music, so Suede owns it outright. It uses numpy to synthesize a 96 BPM bed in D major. The bed follows the D - Bm - G - A progression of the Studio's *Live Canvas* motion film.

- **Instruments:** a soft pad, an FM electric piano, a round bass, a marimba-like arpeggio, and light kick, rim and hats.
- **Structure:** a two-bar intro, then a 16-bar cycle of 10 full bars followed by 6 lighter bars without drums, then a held D add9 chord to finish.

[`recorder/add-music.sh`](recorder/add-music.sh) mixes it under the voice:
- It removes the lowest bass and dips the 250 Hz and 2.5 kHz ranges, so the voice stays clear.
- It sets the music to about -29 LUFS (normalized to -24 LUFS, then lowered 5 dB) and ducks it further under the voice with sidechain compression.
- The voice sits at about -15.5 LUFS. Between lines, the music plays on its own at about -29 LUFS, a background layer you can hear. The whole mix measures -15.8 LUFS, because the meter now counts those music-only stretches too.

## 60-second social cut

`social/` holds the same story cut to 59.5 s for social media, in two formats:

- [`suede-social-60s-vertical.mp4`](social/suede-social-60s-vertical.mp4): 1080×1920, for Reels, TikTok and Shorts. The headline is above the footage, the caption below, and a lime progress bar runs along the bottom.
- [`suede-social-60s-16x9.mp4`](social/suede-social-60s-16x9.mp4): 1920×1080, for LinkedIn, X and YouTube. A headline chip sits top left and a caption bar along the bottom.

Both cuts have nine beats: the hook, add the prospect, the audit, the two-brand packet, email, reply and won, the AI receptionist, KPIs and the monthly loop, the client view, and the end card. Emma reads a shorter social script with the same Kokoro v1.0 setup as the long video, captions are burned in for muted viewing, and a fresh 60-second take of the music track runs underneath. The voice sits at about -14.7 LUFS and the music at about -25 LUFS between lines; the whole mix measures -15.8 LUFS at 48 kHz.

The footage is a caption-free take of the same `3c03e93` light-theme run, and the end card carries the current homepage line, "Turn audits into clients. Keep them on autopilot." [`social/POSTING.md`](social/POSTING.md) has paste-ready captions for each platform, regenerated by [`recorder/captions.py`](recorder/captions.py).

How it is made:

1. Record a caption-free take: run `story.mjs` with `HIDE_CAPTIONS=1`. The pacing still follows the cached narration.
2. Run [`recorder/beats-map.mjs`](recorder/beats-map.mjs). It lists where each original line falls in that footage, which is how each beat's source moments were chosen.
3. Run [`recorder/social-vo.cjs`](recorder/social-vo.cjs) to voice the lines in [`recorder/social-beats.json`](recorder/social-beats.json).
4. Run [`recorder/render-overlays.mjs`](recorder/render-overlays.mjs) to draw the headlines, captions, frame and end cards with the site's Geist and Instrument Serif fonts.
5. Run [`recorder/compose.py`](recorder/compose.py). For each beat it cuts, speeds up and zooms into the app column (a 1440×810 crop), then layers the overlays, joins the beats, and mixes the narration over the ducked music.
