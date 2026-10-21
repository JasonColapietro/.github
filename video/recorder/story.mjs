// The agency walkthrough: one fictional prospect, Brightside Family Dental, from
// first audit to active client, recorded against the LOCAL demo server. Seed
// phases (seed.sh) run between segments while the recording is cut.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { startStudio } from "./lib.mjs";

const S = await startStudio();
const { page, wait, log, rec, cut, go, say, pointAt, click, clickNav, type, scrollY, scrollTo, card, safe, finish } = S;
const seed = (phase) => log("seed", phase, execFileSync("./seed.sh", [phase], { encoding: "utf8" }).trim().split("\n").pop());
const CH = 6;
const WORDS = ["zero", "one", "two", "three", "four", "five", "six"];
const chap = (n, title, dim, mark, body) => card({ eyebrow: `Chapter ${n} of ${CH}`, title, dim, mark, body, voice: `Chapter ${WORDS[n]}. ${title} ${dim} ${mark}` }, { holdMs: 2700 });

// ═══ Opening ═══════════════════════════════════════════════════════════════
await go("/");
await card({
  eyebrow: "Suede AI Agent Studio · walkthrough",
  title: "Turn audits into clients.",
  dim: "Keep them",
  mark: "on autopilot.",
  body: "Follow one prospect from first audit to active client. Brightside Family Dental is a fictional practice, and Northlight Growth is a sample agency.",
  fine: "Real product pages · sample data · dry run: nothing is crawled, sent, called or charged",
  voice: "Turn audits into clients. Keep them on autopilot. Here's one prospect, from first audit to active client, in Suede AI Agent Studio. Brightside Family Dental is a fictional practice, and everything you'll see is sample data.",
}, { holdMs: 5600 });

// ═══ 1 · Find ══════════════════════════════════════════════════════════════
await say("01 · Find", "Suede AI Agent Studio is where an agency finds, wins and keeps clients: open with an audit, keep the account with workflows.", 5200);
await safe("home outcomes", async () => {
  await scrollTo(page.getByText("Find, win and keep clients.").first(), { offset: 110, ms: 2600 });
  await say("01 · Find", "Prospect research, audit fixes you approve, an AI receptionist and monthly AI-search checks, each one in plain view.", 5200);
});

await go("/clients");
await chap(1, "Find the prospect.", "Start with", "one website.", "Every client starts as a prospect with its own record.");
await say("01 · Find", "Your agency's identity goes on every packet and client view. Now add the business you want to win.", 3800);
let clientId = null;
await safe("new client", async () => {
  await clickNav(page.getByRole("link", { name: "New client" }).first());
  await say("01 · Find", "Add the website and the person you'll talk to. It's saved as a prospect.", 1200);
  await type(page.getByLabel("Client name"), "Brightside Family Dental");
  await type(page.getByPlaceholder("acmedental.com"), "brightsidefamilydental.com");
  await click(page.getByRole("button", { name: "Add contact" }));
  await wait(400);
  await type(page.getByLabel("Name", { exact: true }), "Dr. Elena Park", { delay: 35 });
  await type(page.getByLabel("Role"), "Owner", { delay: 35 });
  await type(page.getByLabel("Email"), "elena@brightsidefamilydental.com", { delay: 25 });
  await pointAt(page.locator("form select").first());
  await wait(900);
  await click(page.getByRole("button", { name: "Create client" }));
  await page.waitForURL(/\/clients\/[0-9a-f-]{36}/, { timeout: 30000 });
  await cut();
  await page.waitForLoadState("networkidle", { timeout: 120000 }).catch(() => {});
  await wait(1000);
  await S.decorate();
  await rec();
  clientId = page.url().match(/\/clients\/([0-9a-f-]{36})/)?.[1] ?? null;
  log("client", clientId);
  await say("01 · Find", "Brightside is a prospect with its own record, and the next action is already set: run the first audit.", 5000);
  await pointAt(page.getByText("Next action").first(), { dx: 120 });
  await wait(1200);
});
if (!clientId) throw new Error("client was not created");
fs.writeFileSync("client-id.txt", clientId);
const C = `/clients/${clientId}`;

// Audit v1 is attached while the camera is off (this sandbox cannot crawl).
await cut();
seed("audit");

// ═══ 2 · Audit ═════════════════════════════════════════════════════════════
await go(`${C}/audit`);
await chap(2, "Audit before the call.", "Evidence,", "not guesses.", "Every finding carries its source and a prepared fix.");
await say("02 · Audit", "Run audit crawls the site and checks AI visibility. This sandbox is offline, so audit v1 holds sample findings for the demo.", 5600);
await safe("audit read", async () => {
  await scrollTo(page.getByText("Audit version", { exact: true }).first(), { offset: 110, ms: 1800 });
  await say("02 · Audit", "Score 74 out of 100. AI visibility wasn't run, so it's marked as not run instead of guessed.", 5000);
  await scrollTo(page.getByText("Enquiries are being missed", { exact: true }).first(), { offset: 200, ms: 1800 });
  await say("02 · Audit", "Your own observation, labeled as such: 2 of 3 test calls after 5pm went to voicemail. Nothing here is inferred from the website.", 5800);
  await scrollTo(page.getByText("Duplicate title", { exact: true }).first(), { offset: 200, ms: 1800 });
  await say("02 · Audit", "Duplicate titles on three pages, with the pages as evidence and a recommended workflow to fix them.", 4800);
  await say("02 · Audit", "Choose what the prospect sees: include both findings and their prepared fixes.", 400);
  for (const t of ["Duplicate title", "Enquiries are being missed"]) {
    await click(page.getByLabel(`Include issue: ${t}`), { ms: 600 });
    await wait(500);
    await click(page.getByLabel(`Include fix: ${t}`), { ms: 500 });
    await wait(600);
  }
  await scrollTo(page.getByText(/issues? and \d of \d fixes included/).first(), { offset: 300, ms: 1400 });
  await wait(2200);
});

// ═══ 3 · Offer ═════════════════════════════════════════════════════════════
await go(`${C}/packet`);
await chap(3, "Make the offer.", "One packet,", "two brands.", "Built from one audit version and your selection.");
await safe("packet build", async () => {
  await say("03 · Offer", "Build the packet from audit v1 and your selection.", 800);
  await click(page.getByRole("button", { name: /Build packet/ }).first());
  await page.getByText("Packet v1", { exact: true }).first().waitFor({ timeout: 20000 });
  await wait(800);
  await scrollTo(page.getByText("Packet v1", { exact: true }).first(), { offset: 260, ms: 1400 });
  await say("03 · Offer", "Packet v1 is ready. With model drafting off, its summary comes straight from the audit facts.", 4400);
  const frame = page.locator("iframe").first();
  await scrollTo(frame, { offset: 90, ms: 1800 });
  await wait(1500);
  await say("03 · Offer", "Your agency as provider, Brightside as recipient: the findings, two free fixes, suggested workflows and next steps.", 3600);
  await page.mouse.move(800, 600);
  for (let i = 0; i < 3; i += 1) { await page.mouse.wheel(0, 420); await wait(900); }
  await wait(1200);
  await scrollTo(page.getByText("Packet v1", { exact: true }).first(), { offset: 260, ms: 1400 });
  await click(page.getByRole("button", { name: "Publish" }).first());
  await say("03 · Offer", "Publish it, and it's ready to send and to show in the client view.", 3800);
});

// ═══ 4 · Win ═══════════════════════════════════════════════════════════════
await go(`${C}/brand`);
await chap(4, "Reach out.", "Then", "win the account.", "A short first touch with its evidence, then the reply and the scope in the same record.");
await safe("outreach", async () => {
  await scrollTo(page.getByRole("heading", { name: "Review queue" }), { offset: 90, ms: 2000 });
  await say("04 · Win", "A first-touch email for Dr. Park: it names the three pages and offers the title fix free.", 5600);
  await click(page.getByRole("button", { name: "Approve", exact: true }).first());
  await say("04 · Win", "Approved means ready, not sent. It goes out from your own mailbox when you send it.", 4600);
});

await go(`${C}/inboxes`);
await rec();
await safe("reply", async () => {
  await scrollTo(page.getByText("Re: Three Brightside pages share one title in Google").first(), { offset: 140, ms: 1600 });
  await say("04 · Win", "Dr. Park replies (an illustrative reply for this demo): evenings are the real problem.", 5000);
  await scrollTo(page.getByText("Prepared reply", { exact: true }).first(), { offset: 160, ms: 1400 });
  await say("04 · Win", "The scope is prepared in the same thread: the free title fix, page descriptions, and an AI receptionist after 5pm.", 2800);
  const ta = page.locator("textarea").first();
  await pointAt(ta);
  await ta.evaluate((el) => { el.scrollTop = 0; const end = el.scrollHeight; const t0 = performance.now(); const step = (now) => { const p = Math.min(1, (now - t0) / 2600); el.scrollTop = end * p; if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
  await wait(3600);
});

await go(C);
await rec();
await safe("mark won", async () => {
  await say("04 · Win", "She says yes. Mark Brightside active: the findings, scope and conversation stay with the account.", 1000);
  await scrollTo(page.getByText("Edit client details").first(), { offset: 420, ms: 1600 });
  await click(page.getByText("Edit client details").first());
  await wait(600);
  const status = page.locator("details.cl-edit select").first();
  await scrollTo(status, { offset: 380, ms: 900 });
  await pointAt(status);
  await status.selectOption("active");
  await wait(900);
  await click(page.getByRole("button", { name: "Save client" }));
  await page.getByText("Saved.").first().waitFor({ timeout: 15000 }).catch(() => {});
  await wait(1200);
  await cut();
  await page.reload({ waitUntil: "networkidle" });
  await wait(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(300);
  await S.decorate();
  await rec();
  await say("04 · Win", "Brightside is now an active client, with its audit, packet and conversation already attached.", 600);
  await pointAt(page.getByText("Active", { exact: true }).first());
  await wait(3600);
});

// Client-side activity starts after the win (camera off).
await cut();
seed("client");
const cv = fs.readFileSync("cv.txt", "utf8").trim();

// ═══ 5 · Keep ══════════════════════════════════════════════════════════════
await go(`${C}/voice`);
await chap(5, "Deliver, and", "keep the", "client.", "Voice, inboxes, leads, KPIs and a monthly loop, all on one account.");
await safe("voice", async () => {
  await scrollTo(page.getByText("Marisol Vega", { exact: true }).first(), { offset: 150, ms: 1800 });
  await say("05 · Keep", "The AI receptionist now answers Brightside's line after 5pm. In this sample call at 7:12pm, a new family of four wants Saturday visits.", 6000);
  await scrollTo(page.getByText("Note for the client").first(), { offset: 260, ms: 1400 });
  await say("05 · Keep", "You decide what the client sees: call notes stay private, and one plain note goes to the client view.", 5000);
});

await go(`${C}/leads`);
await rec();
await safe("leads", async () => {
  await say("05 · Keep", "Calls and emails become Brightside's own client leads, from new to won.", 3600);
  const stage = page.getByLabel("Stage for Marisol Vega (family of four)");
  await pointAt(stage);
  await stage.selectOption("booked");
  await say("05 · Keep", "The front desk called back: Marisol's family is booked for Saturday.", 4400);
});

await go(`${C}/kpis`);
await rec();
await safe("kpis", async () => {
  await scrollTo(page.getByText("After-hours calls answered").first(), { offset: 150, ms: 1600 });
  await say("05 · Keep", "KPIs start from a baseline and say where each number came from: test calls, the audit score, and figures entered by hand.", 6000);
  await scrollTo(page.getByText("Booked appointments").first(), { offset: 220, ms: 1600 });
  await wait(1800);
});

await go(`${C}/loop`);
await rec();
await safe("loop", async () => {
  await say("05 · Keep", "Every month: re-audit, prioritize, deliver, measure, all against the same baseline.", 3600);
  await scrollTo(page.getByText(/Next client review/).first(), { offset: 260, ms: 1600 });
  await pointAt(page.getByText(/Next client review/).first(), { dx: 220 });
  await say("05 · Keep", "The next client review is already on record: Thursday, Nov 19, at 10am.", 4400);
  await scrollTo(page.getByText("Measure", { exact: true }).first(), { offset: 260, ms: 1600 });
  await wait(1800);
});

await go(`${C}/share`);
await rec();
await say("05 · Keep", "Then send Dr. Park a read-only client view. You choose what it includes, and you can revoke it any time.", 4800);

await go(cv);
await rec();
await safe("client view", async () => {
  await say("05 · Keep", "This is what she sees: both brands, the published plan, results against the baseline, and only the activity you marked visible.", 5600);
  await scrollTo(page.getByText("Results", { exact: true }).first(), { offset: 120, ms: 2600 });
  await wait(2600);
  await scrollTo(page.getByText("Activity", { exact: true }).first(), { offset: 200, ms: 1600 });
  await wait(2400);
});

// ═══ 6 · Agents ════════════════════════════════════════════════════════════
await go("/docs/seo-skills");
await chap(6, "Hand the SEO work", "to your", "AI agent.", "Agents can run the same tools for each client, on your behalf.");
await say("06 · Agents", "Connect your AI assistant to the Suede MCP endpoint, and twelve installable skills run audits, keyword plans, AI visibility checks and client reports.", 6200);
await safe("skills scroll", async () => {
  await scrollTo(page.getByText("The twelve skills", { exact: false }).nth(1), { offset: 120, ms: 2200 });
  await say("06 · Agents", "Every price is stated before it's spent, and reports are saved to the client's workspace.", 4600);
});

await go("/clients");
await rec();
await say("Done", "Back on Clients: Brightside is active, with its score and next action. Find, win and keep the next one.", 5200);

await card({
  eyebrow: "agents.suedeai.ai",
  title: "Turn audits into clients.",
  dim: "Keep them",
  mark: "on autopilot.",
  body: "Audit a prospect, send the packet, win the account, and keep it with voice, inbox and SEO workflows in Suede AI Agent Studio.",
  chips: ["Start building free", "Book a 30-minute call"],
  fine: "Suede AI Agent Studio · The workforce that works while you sleep.",
  voice: "Turn audits into clients. Keep them on autopilot. Suede AI Agent Studio: the workforce that works while you sleep.",
}, { holdMs: 5600, fadeOut: false });

await finish();
