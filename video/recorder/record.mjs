// Records the Suede AI Agent Studio walkthrough against the LOCAL demo server (localhost:3210),
// signed in with the repo's built-in dev sign-in. Frames come from a CDP screencast so the
// output is crisp; build.mjs turns frames/ into an MP4.
import { createRequire } from "node:module";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node22/lib/node_modules/playwright");

const BASE = "http://localhost:3210";
const OUT = "frames";
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1.2,
  storageState: "state.json",
  reducedMotion: "no-preference",
});
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
page.setDefaultTimeout(6000);

// ── Recorder ───────────────────────────────────────────────────────────────
const frames = []; // { file, ts, seg }
const segments = []; // { start, end }
let frameNo = 0;
let recording = false;
cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
  try { await cdp.send("Page.screencastFrameAck", { sessionId }); } catch { /* closed */ }
  if (!recording) return;
  const file = `f${String(++frameNo).padStart(6, "0")}.jpg`;
  fs.writeFileSync(`${OUT}/${file}`, Buffer.from(data, "base64"));
  frames.push({ file, ts: metadata.timestamp ?? Date.now() / 1000, seg: segments.length - 1 });
});
async function rec() {
  if (recording) return;
  segments.push({ start: Date.now() / 1000, end: null });
  recording = true;
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 90, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  await nudge();
}
async function cut() {
  if (!recording) return;
  await page.waitForTimeout(120);
  recording = false;
  segments[segments.length - 1].end = Date.now() / 1000;
  await cdp.send("Page.stopScreencast");
}
// Force a fresh frame (the screencast only emits on change).
async function nudge() {
  await page.evaluate(() => {
    const n = document.getElementById("demo-nudge");
    if (n) n.style.opacity = n.style.opacity === "0.01" ? "0.02" : "0.01";
  }).catch(() => {});
}
const wait = (ms) => page.waitForTimeout(ms);
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// ── On-page chrome: caption, cursor, cards ────────────────────────────────
let cursor = { x: 800, y: 470 };
async function decorate() {
  await page.evaluate(({ x, y }) => {
    document.documentElement.style.scrollBehavior = "auto";
    if (document.getElementById("demo-style")) return;
    const style = document.createElement("style");
    style.id = "demo-style";
    style.textContent = `
      nextjs-portal{display:none!important}
      #demo-nudge{position:fixed;right:0;bottom:0;width:2px;height:2px;background:#fff;opacity:.01;z-index:2147483647;pointer-events:none}
      #demo-cursor{position:fixed;left:0;top:0;width:28px;height:28px;z-index:2147483647;pointer-events:none;transition:transform 750ms cubic-bezier(.25,.8,.25,1);will-change:transform}
      #demo-cursor svg{filter:drop-shadow(0 2px 3px rgba(17,24,39,.35))}
      #demo-cursor .ring{position:absolute;left:-14px;top:-14px;width:30px;height:30px;border-radius:50%;border:3px solid #4f46e5;opacity:0;transform:scale(.4)}
      #demo-cursor.click .ring{animation:demoRing 520ms ease-out}
      @keyframes demoRing{0%{opacity:.9;transform:scale(.4)}100%{opacity:0;transform:scale(1.6)}}
      #demo-cap{position:fixed;left:28px;bottom:28px;max-width:640px;z-index:2147483646;background:rgba(255,255,255,.97);border:1px solid #e5e7eb;border-left:4px solid #4f46e5;border-radius:14px;box-shadow:0 22px 50px -14px rgba(17,24,39,.32),0 2px 6px rgba(17,24,39,.06);padding:14px 20px 16px;font-family:geistSans,system-ui,sans-serif;opacity:0;transform:translateY(14px);transition:opacity 420ms ease,transform 420ms ease;pointer-events:none}
      #demo-cap.show{opacity:1;transform:none}
      #demo-cap .k{font-family:geistMono,ui-monospace,monospace;font-size:12.5px;letter-spacing:.09em;text-transform:uppercase;color:#4f46e5;margin-bottom:6px;font-weight:600}
      #demo-cap .t{font-size:19.5px;line-height:1.42;color:#111827;font-weight:500;letter-spacing:-.005em}
      #demo-card{position:fixed;inset:0;z-index:2147483645;background:#fafbfd;display:flex;align-items:center;justify-content:center;opacity:1;transition:opacity 600ms ease;font-family:geistSans,system-ui,sans-serif;background-image:radial-gradient(rgba(79,70,229,.13) 1px,transparent 1px);background-size:22px 22px}
      #demo-card.hide{opacity:0}
      #demo-card .bar{position:absolute;left:0;right:0;top:0;height:6px;background:linear-gradient(90deg,#4f46e5,#06b6d4,#10b981)}
      #demo-card .inner{max-width:1180px;padding:0 64px;text-align:left;width:100%}
      #demo-card .eyebrow{font-family:geistMono,monospace;font-size:16px;letter-spacing:.14em;text-transform:uppercase;color:#4f46e5;font-weight:600;display:flex;gap:12px;align-items:center}
      #demo-card .eyebrow b{display:inline-block;width:10px;height:10px;border-radius:50%;background:#10b981;box-shadow:0 0 0 5px rgba(16,185,129,.18)}
      #demo-card h1{font-size:88px;line-height:1.02;margin:22px 0 0;color:#111827;font-weight:600;letter-spacing:-.035em}
      #demo-card h1 em{display:block;font-family:instrumentSerif,Georgia,serif;font-style:italic;font-weight:400;color:#4f46e5;letter-spacing:-.01em}
      #demo-card p{font-size:25px;line-height:1.5;color:#4b5563;margin:26px 0 0;max-width:900px}
      #demo-card .fine{font-family:geistMono,monospace;font-size:14px;color:#6b7280;margin-top:34px;letter-spacing:.02em}
      #demo-card .chips{display:flex;gap:10px;flex-wrap:wrap;margin-top:28px}
      #demo-card .chips span{font-size:16px;padding:8px 14px;border-radius:999px;background:#eef2ff;color:#4338ca;border:1px solid #e0e7ff;font-weight:500}
      #demo-console{position:fixed;inset:0;z-index:2147483644;background:rgba(17,24,39,.45);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 450ms ease;font-family:geistSans,system-ui,sans-serif}
      #demo-console.show{opacity:1}
      #demo-console .win{width:1240px;background:#fff;border-radius:18px;box-shadow:0 40px 90px -20px rgba(0,0,0,.5);overflow:hidden;border:1px solid #e5e7eb}
      #demo-console .hd{display:flex;align-items:center;gap:14px;padding:16px 22px;border-bottom:1px solid #e5e7eb;background:#f5f5fa}
      #demo-console .hd .dot{width:11px;height:11px;border-radius:50%;background:#e5e7eb}
      #demo-console .hd .ttl{font-weight:600;color:#111827;font-size:17px}
      #demo-console .hd .tag{margin-left:auto;font-family:geistMono,monospace;font-size:12.5px;color:#4338ca;background:#eef2ff;border-radius:999px;padding:5px 11px}
      #demo-console .bd{display:grid;grid-template-columns:1fr 1fr;gap:0}
      #demo-console .col{padding:18px 22px 22px}
      #demo-console .col+.col{border-left:1px solid #e5e7eb;background:#fcfcfe}
      #demo-console .lbl{font-family:geistMono,monospace;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#6b7280;margin-bottom:10px;font-weight:600}
      #demo-console .lbl i{font-style:normal;color:#4f46e5}
      #demo-console pre{margin:0 0 16px;font-family:geistMono,monospace;font-size:13.2px;line-height:1.55;color:#111827;white-space:pre-wrap;word-break:break-word;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px}
      #demo-console pre .m{color:#4f46e5;font-weight:600}
      #demo-console pre .g{color:#047857;font-weight:600}
      #demo-console pre .c{color:#6b7280}
      #demo-console .step{opacity:0;transform:translateY(8px);transition:opacity 420ms ease,transform 420ms ease}
      #demo-console .step.on{opacity:1;transform:none}
    `;
    document.head.appendChild(style);
    const nudge = document.createElement("div");
    nudge.id = "demo-nudge";
    document.body.appendChild(nudge);
    const c = document.createElement("div");
    c.id = "demo-cursor";
    c.innerHTML = '<div class="ring"></div><svg width="28" height="28" viewBox="0 0 28 28"><path d="M5 3 L22 14.2 L14.3 15.9 L10.4 23.4 Z" fill="#111827" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    c.style.transition = "none";
    c.style.transform = `translate(${x - 5}px, ${y - 3}px)`;
    document.body.appendChild(c);
    requestAnimationFrame(() => { c.style.transition = ""; });
    const cap = document.createElement("div");
    cap.id = "demo-cap";
    cap.innerHTML = '<div class="k"></div><div class="t"></div>';
    document.body.appendChild(cap);
  }, cursor);
}

async function go(path, { settle = 900 } = {}) {
  await cut();
  log("go", path);
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 180000 }).catch((e) => log("goto warn", e.message.split("\n")[0]));
  await wait(settle);
  await decorate();
}

async function say(kicker, text, holdMs = 0) {
  await page.evaluate(async ({ kicker, text }) => {
    const cap = document.getElementById("demo-cap");
    if (!cap) return;
    if (cap.classList.contains("show")) {
      cap.classList.remove("show");
      await new Promise((r) => setTimeout(r, 380));
    }
    cap.querySelector(".k").textContent = kicker;
    cap.querySelector(".t").textContent = text;
    cap.classList.add("show");
  }, { kicker, text });
  if (holdMs) await wait(holdMs);
}
async function hideCaption() {
  await page.evaluate(() => document.getElementById("demo-cap")?.classList.remove("show"));
}

async function moveTo(x, y, ms = 750) {
  cursor = { x, y };
  await page.evaluate(({ x, y, ms }) => {
    const c = document.getElementById("demo-cursor");
    if (!c) return;
    c.style.transitionDuration = `${ms}ms`;
    c.style.transform = `translate(${x - 5}px, ${y - 3}px)`;
  }, { x, y, ms });
  await wait(ms + 80);
}
async function pointAt(locator, { ms = 750, dx = 0, dy = 0 } = {}) {
  const box = await locator.boundingBox();
  if (!box) return false;
  await moveTo(Math.round(box.x + box.width / 2 + dx), Math.round(box.y + box.height / 2 + dy), ms);
  return true;
}
async function clickFx() {
  await page.evaluate(() => {
    const c = document.getElementById("demo-cursor");
    if (!c) return;
    c.classList.remove("click");
    void c.offsetWidth;
    c.classList.add("click");
  });
}
async function click(locator, opts = {}) {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await pointAt(locator, opts);
  await clickFx();
  await wait(160);
  await locator.click({ timeout: 15000 });
}


// Click something that navigates: show the click, cut while the next page loads, resume.
async function clickNav(locator, { resume = true } = {}) {
  await click(locator);
  await cut();
  await page.waitForLoadState("networkidle", { timeout: 120000 }).catch(() => {});
  await wait(1100);
  await decorate();
  if (resume) await rec();
}
// Smoothly scroll the window so `locator` sits `offset` px from the top.
async function scrollTo(locator, { offset = 120, ms = 1600 } = {}) {
  const y = await locator.evaluate((el, offset) => el.getBoundingClientRect().top + window.scrollY - offset, offset).catch(() => null);
  if (y === null) return false;
  await scrollY(y, ms);
  return true;
}
async function scrollY(y, ms = 1600) {
  await page.evaluate(({ y, ms }) => new Promise((res) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const target = Math.max(0, Math.min(max, y));
    const s = window.scrollY, d = target - s, t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      window.scrollTo(0, s + d * ease(p));
      if (p < 1) requestAnimationFrame(step); else res();
    };
    requestAnimationFrame(step);
  }), { y, ms });
}

async function card({ eyebrow, title, em, body, chips = [], fine = "" }, { holdMs = 3200, fadeOut = true } = {}) {
  await page.evaluate(({ eyebrow, title, em, body, chips, fine }) => {
    document.getElementById("demo-card")?.remove();
    const el = document.createElement("div");
    el.id = "demo-card";
    el.innerHTML = `<div class="bar"></div><div class="inner">
      <div class="eyebrow"><b></b><span></span></div>
      <h1><span class="a"></span>${em ? '<em></em>' : ""}</h1>
      ${body ? "<p></p>" : ""}
      ${chips.length ? '<div class="chips"></div>' : ""}
      ${fine ? '<div class="fine"></div>' : ""}</div>`;
    el.querySelector(".eyebrow span").textContent = eyebrow;
    el.querySelector("h1 .a").textContent = title;
    if (em) el.querySelector("h1 em").textContent = em;
    if (body) el.querySelector("p").textContent = body;
    if (chips.length) el.querySelector(".chips").innerHTML = chips.map((c) => `<span>${c.replace(/</g, "&lt;")}</span>`).join("");
    if (fine) el.querySelector(".fine").textContent = fine;
    document.body.appendChild(el);
    document.getElementById("demo-cap")?.classList.remove("show");
  }, { eyebrow, title, em, body, chips, fine });
  await rec();
  await nudge();
  await wait(holdMs);
  if (fadeOut) {
    await page.evaluate(() => document.getElementById("demo-card")?.classList.add("hide"));
    await wait(650);
    await page.evaluate(() => document.getElementById("demo-card")?.remove());
  }
}

async function minimizeGuide() {
  const m = page.getByRole("button", { name: "Minimize level guide" });
  if (await m.count().catch(() => 0)) await m.first().click({ timeout: 3000 }).catch(() => {});
}

const CHAPTERS = 7;
const chap = (n, title, em, body) => card({ eyebrow: `Chapter ${n} of ${CHAPTERS}`, title, em, body }, { holdMs: 2600 });

const TRANSCRIPT = "AGENT: Thanks for calling Inbound Lead Desk, what can I help with? MAYA: I run sales at Northwind Freight. We get about 200 inbound leads a month and the good ones slip while my six reps are on calls. AGENT: How soon do you need it? MAYA: This month, before our Q4 push. Budget is around five hundred a month. AGENT: Can someone follow up by email? MAYA: Yes, email me today.";

const safe = async (label, fn) => {
  try { await fn(); } catch (e) { log(`SKIP ${label}:`, e.message.split("\n")[0]); }
};

// ═══ Opening ═══════════════════════════════════════════════════════════════
await go("/");
await card({
  eyebrow: "Suede AI Agent Studio · product walkthrough",
  title: "The workforce that",
  em: "works while you sleep.",
  body: "From first visit to a launched agent, following one lead, Maya Chen of Northwind Freight, through voice, email and an AI agent working on her behalf.",
  fine: "Real product pages · demo workspace · fictional lead · dry-run mode: no emails sent, no payments made",
}, { holdMs: 5200 });

// ═══ 1 · Start ════════════════════════════════════════════════════════════
await chap(1, "Start with a job,", "not a blank page.", "Pick the work that repeats. The studio drafts the agent.");
await say("01 · Start", "You land on Suede AI Agent Studio: agents for the work that repeats, like qualifying leads, following up and preparing reports.", 4600);
await safe("home scroll", async () => {
  await scrollTo(page.getByText("Lead Qualifier").first(), { offset: 200, ms: 2200 });
  await say("01 · Start", "Every workflow is visible step by step. This is the Lead Qualifier template: when details come in, Claude scores the lead and sends it to your CRM.", 5200);
  await scrollTo(page.getByText("Your company.").first(), { offset: 90, ms: 2400 });
  await say("01 · Start", "Agents can also be organized into a company: departments, a CEO, and a wired workflow behind every seat.", 5200);
});

await go("/start");
await rec();
await say("01 · Start", "Guided mode: describe the job in one sentence, start from a template, or open a blank canvas.", 3000);
await safe("start cards", async () => {
  await pointAt(page.getByText("Describe it", { exact: true }).first());
  await wait(900);
  await pointAt(page.getByText("Start from a template", { exact: true }).first());
  await wait(1300);
  await scrollY(330, 1800);
  await say("01 · Start", "Maya's team lives on sales calls, so you start from a sales template.", 3600);
});

await go("/templates/sales-call-scorecard");
await rec();
await say("01 · Start", "Sales Call Scorecard: paste a call transcript, get a rubric scorecard and a recap email written in the buyer's own words.", 5000);
await safe("open in builder", async () => {
  await clickNav(page.getByRole("link", { name: /Open it in the builder/ }).first(), { resume: false });
});

// ═══ 2 · Build ════════════════════════════════════════════════════════════
await cut();
await chap(2, "Wire it. Test it.", "Launch it.", "The Studio canvas shows every step, every result and every cent.");
await cut();
await page.waitForTimeout(1500);
await minimizeGuide();
await page.waitForTimeout(600);
await minimizeGuide();
await rec();
await say("02 · Build", "The Studio canvas. Three steps: the call transcript comes in, Claude scores it, and the result goes back out.", 4800);
await safe("node library", async () => {
  const t = page.locator('button[aria-label^="Transcribe Audio."]').first();
  await t.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "smooth" }));
  await wait(900);
  await pointAt(t);
  await say("02 · Build", "Voice is built in: Transcribe Audio turns a recorded call into text, and Speak reads a reply aloud, as steps in any flow.", 2600);
  await pointAt(page.locator('button[aria-label^="Speak (Text to Speech)."]').first());
  await wait(2600);
});
const primary = page.locator("header .studio-btn--primary");
let slug = null;
await safe("run test", async () => {
  await minimizeGuide();
  await click(primary);
  await wait(900);
  const ta = page.getByRole("textbox", { name: "Trigger input JSON" });
  await ta.scrollIntoViewIfNeeded();
  await pointAt(ta);
  await ta.fill(JSON.stringify({ transcript: TRANSCRIPT, rubric: "discovery, urgency, next step" }, null, 2));
  await say("02 · Build", "Test it with the transcript of Maya's call to your AI receptionist.", 3200);
  await click(page.getByRole("button", { name: "Run", exact: true }));
  await wait(1500);
  await say("02 · Build", "Every step streams its result. All steps pass, and the cost ledger reads 0.000 USDC: test runs are free dry runs.", 5400);
  await click(primary); // Save version
  await wait(1200);
  await say("02 · Build", "Save an immutable version. Draft, Test and Live stay separate, so a launch never ships half-finished edits.", 4200);
  await click(primary); // Launch
  await wait(2200);
  const link = page.locator("a", { hasText: /^\/a\// }).first();
  slug = ((await link.textContent()) || "").trim().replace(/^\/a\//, "").replace(/\s.*$/, "");
  log("slug", slug);
  await say("02 · Build", "Launched. Your agent now has a public page, an agent card, an x402 pay-per-call endpoint and an A2A endpoint.", 5600);
});
if (!slug) {
  slug = fs.existsSync("slug.txt") ? fs.readFileSync("slug.txt", "utf8").trim() : null;
}
if (slug) fs.writeFileSync("slug.txt", slug);

// ═══ 3 · Company ═══════════════════════════════════════════════════════════
await go("/company");
await chap(3, "Your agents,", "run as a company.", "Inbound Lead Desk has run itself for seven days, with you approving what matters.");
await say("03 · Company", "Agents can work together as a company. Inbound Lead Desk has been running on its own for a week.", 3600);
await safe("open company", async () => {
  await clickNav(page.locator('a[href^="/company?id="]').getByText(/Open/).first());
  await say("03 · Company", "Six seats, two departments, and the books, grounded in receipts.", 3800);
  await scrollTo(page.getByText("Org chart", { exact: true }).first(), { offset: 110, ms: 2000 });
  await say("03 · Company", "The org chart: a CEO delegating to a Lead Qualifier, a Pipeline Risk Read, a Campaign Writer, and a CTO the autopilot hired.", 5600);
  await scrollTo(page.getByText("Direct the CEO.").first(), { offset: 120, ms: 2000 });
  await say("03 · Company", "You set the goal, the budgets and the guardrails. Anything that leaves the building waits for your approval.", 5000);
});

await go("/company/briefing");
await rec();
await say("03 · Company", "Every morning, a briefing: what happened overnight and what's waiting on you, including the emails drafted for Maya.", 5200);
await safe("briefing preview", async () => {
  const b = page.getByRole("button", { name: /Preview email/i }).first();
  if (await b.count()) {
    await click(b);
    await wait(1600);
    await say("03 · Company", "The same briefing arrives as an email, so you can run the company from your inbox.", 4400);
  }
});

// ═══ 4 · Voice ═════════════════════════════════════════════════════════════
await go("/phone");
await chap(4, "Maya calls.", "Your voice agent answers.", "Speed to lead starts with hello.");
await say("04 · Voice", "7:40 am. Maya calls while your team is busy. The AI voice agent picks up, so the lead never hits voicemail.", 4200);
await safe("phone explainer", async () => {
  await click(page.getByText("How AI answering works", { exact: true }).first());
  await wait(700);
  await scrollTo(page.locator("#voice-agents").first(), { offset: 90, ms: 1800 });
  await say("04 · Voice", "The lead is ready now. The voice agent answers questions, learns what the caller needs and moves to a useful next step.", 5200);
  await scrollTo(page.locator(".vl-flow").first(), { offset: 140, ms: 1800 });
  await say("04 · Voice", "It works from your approved answers and handoff rules, then takes a confirmed message or tries a person.", 4800);
  await scrollTo(page.locator(".vl-demo").first(), { offset: 200, ms: 1800 });
  await say("04 · Voice", "One front door, different conversations: new enquiries, after-hours callers, human handoff. These are example conversations from the page.", 2600);
  for (const name of ["After hours", "Human handoff", "New enquiry"]) {
    await click(page.locator(".vl-scenarios button", { hasText: name }).first(), { ms: 600 });
    await wait(1700);
  }
  await scrollTo(page.locator(".vl-summary").first(), { offset: 160, ms: 1800 });
  await say("04 · Voice", "Your team starts informed: the caller's goal, timing, open question and the next step they agreed to.", 5000);
});

// ═══ 5 · Email ═════════════════════════════════════════════════════════════
await go("/company/support");
await chap(5, "Maya emails.", "The reply is already drafted.", "Support and sales, growth outreach and the briefing: every email waits for your OK.");
await say("05 · Email", "Maya follows up by email. It lands in Support and sales, tagged as a sales lead, with a reply already drafted.", 3400);
await safe("support maya", async () => {
  await scrollTo(page.getByText("Pricing for our 6-person sales team?").first(), { offset: 140, ms: 1800 });
  await wait(1800);
  await scrollTo(page.getByText("Reply draft").first(), { offset: 200, ms: 1800 });
  await say("05 · Email", "The draft answers her question with your listed offer. Nothing goes out until you approve it. This demo runs dry, so nothing is delivered.", 5600);
  await scrollTo(page.getByText("Demo for our RevOps team next week?").first(), { offset: 160, ms: 1600 });
  await say("05 · Email", "A second lead, Raj, asks for a demo. One click approves the reply.", 2000);
  const rajCard = page.locator("li, article, div").filter({ hasText: "Demo for our RevOps team next week?" }).filter({ has: page.getByRole("button", { name: "Approve", exact: true }) }).last();
  await click(rajCard.getByRole("button", { name: "Approve", exact: true }).first());
  await wait(2600);
  await scrollTo(page.getByText("Sales follow-ups").first(), { offset: 140, ms: 1600 });
  await say("05 · Email", "If a lead goes quiet, follow-ups are drafted on day 3 and day 7, each waiting for your approval.", 4800);
});

await go("/company/growth");
await rec();
await say("05 · Email", "Growth drafts personal outreach too. Every email carries your mailing address and an unsubscribe link.", 3600);
await safe("growth email", async () => {
  await scrollTo(page.getByText("Cold email", { exact: true }).first(), { offset: 100, ms: 2000 });
  const mayaCard = page.locator("li, article, div").filter({ hasText: "maya.chen@northwindfreight.co" }).filter({ has: page.getByText("Read the email") }).last();
  await click(mayaCard.getByText("Read the email").first());
  await wait(900);
  await scrollTo(mayaCard, { offset: 140, ms: 1400 });
  await say("05 · Email", "Here's the email drafted for Maya, ready to approve. Real sending is off in this demo, so approved emails run as dry runs.", 5800);
});

// ═══ 6 · Agents acting for people ══════════════════════════════════════════
await go("/docs/mcp");
await chap(6, "Maya's AI assistant", "does the rest.", "Other people's agents can find your agents, call them and pay for them, on their owner's behalf.");
await say("06 · Agents", "Maya doesn't have to click anything. Her AI assistant can discover and call your agents over MCP, A2A or x402.", 5200);
await safe("mcp scroll", async () => {
  await scrollTo(page.getByText("One endpoint", { exact: true }).first(), { offset: 140, ms: 1800 });
  await say("06 · Agents", "One MCP endpoint makes every listed agent a callable, priced tool for Claude or any MCP client.", 4600);
});

if (slug) {
  await go(`/a/${slug}`);
  await rec();
  await say("06 · Agents", "Your Sales Call Scorecard's public page: what it does, its price, and the endpoint machines call.", 4400);
  await safe("agent page scroll", async () => {
    await scrollTo(page.getByText("Price", { exact: true }).first(), { offset: 180, ms: 1800 });
    await wait(2600);
  });

  // The real call, made now, by "Maya's assistant".
  const curlJson = (args) => { try { return JSON.parse(execFileSync("curl", ["-s", "-H", "user-agent: NorthwindAssistant/1.0 (for Maya Chen)", ...args], { encoding: "utf8" })); } catch (e) { return { error: String(e) }; } };
  const cardRes = curlJson([`${BASE}/api/agents/${slug}/.well-known/agent-card`]);
  const runReq = { input: { transcript: "MAYA: Can you score yesterday's call with Inbound Lead Desk and draft my recap email? It covered our 200 inbound leads a month and a Q4 start." } };
  await page.evaluate(({ slug, card, req }) => {
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const el = document.createElement("div");
    el.id = "demo-console";
    const skill = card?.skills?.[0];
    el.innerHTML = `<div class="win"><div class="hd"><span class="dot"></span><span class="dot"></span><span class="dot"></span>
      <span class="ttl">Maya's AI assistant → Suede AI Agent Studio</span><span class="tag">live request · this demo server</span></div>
      <div class="bd"><div class="col">
        <div class="step s1"><div class="lbl"><i>1</i> · Discover the agent</div>
        <pre><span class="m">GET</span> /api/agents/${esc(slug)}/.well-known/agent-card</pre>
        <pre>{
  "name": <span class="g">"${esc(card?.name ?? "")}"</span>,
  "description": "${esc(card?.description ?? "")}",
  "skills": [{ "id": "${esc(skill?.id ?? "")}" }],
  "provider": { "organization": "${esc(card?.provider?.organization ?? "")}" }
}</pre></div>
        <div class="step s2"><div class="lbl"><i>2</i> · Call it on Maya's behalf</div>
        <pre><span class="m">POST</span> /api/agents/${esc(slug)}/run
<span class="c">User-Agent: NorthwindAssistant/1.0 (for Maya Chen)</span>
${esc(JSON.stringify(req, null, 2))}</pre></div>
      </div><div class="col">
        <div class="step s3"><div class="lbl"><i>3</i> · Response</div><pre class="resp">…</pre></div>
      </div></div></div>`;
    document.body.appendChild(el);
    document.getElementById("demo-cap")?.classList.remove("show");
  }, { slug, card: cardRes, req: runReq });
  await page.evaluate(() => document.getElementById("demo-console").classList.add("show"));
  await wait(700);
  await page.evaluate(() => document.querySelector("#demo-console .s1").classList.add("on"));
  await wait(2600);
  await page.evaluate(() => document.querySelector("#demo-console .s2").classList.add("on"));
  await wait(2200);
  const runRes = curlJson(["-X", "POST", `${BASE}/api/agents/${slug}/run`, "-H", "content-type: application/json", "-d", JSON.stringify(runReq)]);
  log("agent run", runRes.runId, runRes.status, runRes.mode);
  fs.writeFileSync("agent-run.json", JSON.stringify(runRes, null, 2));
  await page.evaluate((res) => {
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const pre = document.querySelector("#demo-console .resp");
    pre.innerHTML = `HTTP/1.1 <span class="g">200 OK</span>
{
  "runId": <span class="g">"${esc(res.runId ?? "")}"</span>,
  "status": <span class="g">"${esc(res.status ?? "")}"</span>,
  "mode": "${esc(res.mode ?? "")}",
  "settled": ${esc(res.settled)},
  "totalCostUsdc": ${esc(res.totalCostUsdc)},
  "outputs": { <span class="c">… 3 steps …</span> }
}

<span class="c">Payment isn't switched on for this agent yet, so the
call ran as a free preview. With settlement on, the
same call pays per run in USDC over x402, or from
the caller's workspace credit.</span>`;
    document.querySelector("#demo-console .s3").classList.add("on");
  }, runRes);
  await wait(6500);
  await page.evaluate(() => document.getElementById("demo-console")?.classList.remove("show"));
  await wait(500);
}

await go("/runs");
await rec();
await say("06 · Agents", "The call lands in your Run history, tagged agent: triggered by Maya's assistant, not by a person clicking.", 4200);
await safe("open agent run", async () => {
  const link = page.locator('a[href^="/runs/"]').filter({ hasText: /Sales Call Scorecard/ }).filter({ hasText: /\bagent\b/ }).first();
  await clickNav(link);
  await say("06 · Agents", "A node-by-node receipt for every run: who triggered it, how long it took and exactly what it cost.", 4200);
  await scrollTo(page.getByText("Cost ledger", { exact: true }).first(), { offset: 160, ms: 1600 });
  await wait(1800);
});

await go("/ap2/authorize");
await rec();
await say("06 · Agents", "When an agent needs to pay on someone's behalf, AP2 puts the person in charge: verify the merchant's checkout, then sign the exact intent.", 5600);
await safe("ap2 steps", async () => {
  await scrollTo(page.getByText("Verify checkout", { exact: false }).first(), { offset: 160, ms: 1800 });
  await say("06 · Agents", "Suede checks the signed checkout and shows the exact terms. Nothing moves from this screen without the person's approval.", 5200);
});

// ═══ 7 · Finish ════════════════════════════════════════════════════════════
await go("/flows");
await chap(7, "From first click", "to a working workforce.", "Built, tested, launched, and answering calls, emails and agents.");
await say("07 · Finish", "Back in the workspace: your agents are live, with their runs, schedules and earnings in one place.", 4600);
await safe("flows scroll", async () => {
  await scrollTo(page.getByText("Agents", { exact: true }).first(), { offset: 120, ms: 1800 });
  await wait(2400);
});

await go("/pricing");
await rec();
await say("07 · Finish", "Editing and dry-run previews are free. Set a price per call and every settled sale routes to your wallet.", 4800);

await card({
  eyebrow: "agents.suedeai.ai",
  title: "The workforce that",
  em: "works while you sleep.",
  body: "Build an agent in the Studio, put a voice agent on your line, and let every email wait for your OK.",
  chips: ["Start building free", "Book a 30-minute setup call"],
  fine: "Suede AI Agent Studio",
}, { holdMs: 5200, fadeOut: false });
await cut();

fs.writeFileSync("timeline.json", JSON.stringify({ frames, segments }, null, 0));
log("frames", frames.length, "segments", segments.length);
await browser.close();
