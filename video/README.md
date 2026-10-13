# Suede AI Agent Studio walkthrough

[`suede-agent-studio-walkthrough.mp4`](suede-agent-studio-walkthrough.mp4): 5 min 39 s, 1920×1080, H.264, no audio.

The video tours the real Agent Studio pages from first visit to finish. It follows one lead, Maya Chen of Northwind Freight, who is fictional. The lead's details are demo data, and everything runs dry: no email is sent and no payment is made.

| Chapter | Pages | What happens |
|---|---|---|
| 1 · Start | `/`, `/start`, `/templates/sales-call-scorecard` | Home page, Guided mode, picking a sales template |
| 2 · Build | `/build/…` | Canvas, the voice steps (Transcribe Audio, Speak), a test run on Maya's call transcript, save version, launch |
| 3 · Company | `/company`, `/company?id=…`, `/company/briefing` | Inbound Lead Desk after 7 days on autopilot: org chart, guardrails, morning briefing and its email preview |
| 4 · Voice | `/phone` | The AI voice agent: answering, approved context, example conversations, handoff summary |
| 5 · Email | `/company/support`, `/company/growth` | Maya's email lands as a sales lead with a drafted reply, a second lead's reply is approved, follow-ups on day 3 and day 7, outreach email with address and unsubscribe link |
| 6 · Agents | `/docs/mcp`, `/a/<agent>`, `/runs`, `/runs/<id>`, `/ap2/authorize` | Maya's AI assistant reads the agent card and calls the launched agent on her behalf. This is a live request, shown with its real response. The run is logged with trigger `agent`. AP2 shows how a person approves an agent's payment |
| 7 · Finish | `/flows`, `/pricing` | Workspace with the agents live, then pricing |

## How it was made

The sandbox it was recorded in could not reach agents.suedeai.ai. The app was therefore run locally from `JasonColapietro/suede-agent-studio` at `main` (`e8c1476`), with no source changes, under these settings:

- `DB_DRIVER=sqlite`
- `X402_SKIP_SETTLEMENT=true`
- no provider keys

The repo's own local dev sign-in supplied the session for the signed-in pages.

1. **Company.** `scripts/demo-company-autopilot.ts` founded "Inbound Lead Desk" from `sales-pipeline-shop` and ran it for 7 simulated days. The local copy started the clock on 2026-10-06 instead of 2031 so the dates read naturally.
2. **Seed.** [`recorder/local-demo-seed.ts`](recorder/local-demo-seed.ts) handed the company to the demo login. It added Maya's and Raj's inbound messages and the growth email drafts through the app's own service functions.
3. **Recording.** [`recorder/record.mjs`](recorder/record.mjs) drove Chromium with Playwright at 1600×900 @1.2×. It captured frames through a CDP screencast and added the captions, cursor and chapter cards on top of each page.
4. **Encoding.** [`recorder/build.mjs`](recorder/build.mjs) encoded the frames to MP4.

Two pages were left out because they are restricted to verified, allowlisted operator emails, which the local dev login cannot be:

- the populated phone inbox
- the operator voice-sales console

The voice chapter uses the AI voice agent page inside `/phone` instead.

To re-record, run the app this way and then run these from a scratch folder:

- `auth.mjs`, which needs a `devsecret` file holding `AGX_DEV_SIGN_IN` and writes `state.json`
- `record.mjs`
- `build.mjs`
