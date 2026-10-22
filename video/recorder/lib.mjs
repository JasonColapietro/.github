// Recording helpers for the local Suede AI Agent Studio walkthrough: CDP screencast
// capture, and an on-page caption, cursor and title-card layer styled after the
// site's Makro theme (white cards on cool paper, near-black ink, lime #d9ff5c accent).
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const HERE = path.dirname(new URL(import.meta.url).pathname);

// ── Kokoro narration (Kokoro-82M v1.0, official k2-fsa ONNX export) ─────────
// kokoro_v1.py phonemizes with misaki's British G2P, the phonemizer Kokoro v1.0
// was trained with, and runs in one long-lived worker so the model loads once.
const VOICE = process.env.VO_VOICE ?? "bf_emma";
const VO_SPEED = Number(process.env.VO_SPEED ?? 1.0);
const VO_DIR = path.join(HERE, "vo");
// KOKORO_DIR: the unpacked kokoro-multi-lang-v1_0 release; KOKORO_PY: a Python with
// misaki, spaCy's en_core_web_sm and onnxruntime installed.
const KOKORO_DIR = process.env.KOKORO_DIR ?? path.join(HERE, "kokoro-multi-lang-v1_0");
const KOKORO_PY = process.env.KOKORO_PY ?? "python3";
fs.mkdirSync(VO_DIR, { recursive: true });
let worker = null;
function tts() {
  if (worker) return worker;
  const proc = spawn(KOKORO_PY, ["-I", path.join(HERE, "kokoro_v1.py"), KOKORO_DIR, "-"], { stdio: ["pipe", "pipe", "inherit"] });
  const waiting = [];
  let buf = "";
  proc.stdout.on("data", (chunk) => {
    buf += chunk;
    let nl;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      waiting.shift()?.(JSON.parse(line));
    }
  });
  proc.on("exit", (code) => { if (code) throw new Error(`kokoro worker exited ${code}`); });
  worker = {
    generate: (job) => new Promise((resolve) => { waiting.push(resolve); proc.stdin.write(JSON.stringify(job) + "\n"); }),
    close: () => proc.stdin.end(),
  };
  return worker;
}
// misaki reads AI, KPIs, SEO, MCP, Dr. and "5pm" correctly; spell out the rest.
export function spoken(text) {
  return text
    .replace(/\bDr\./g, "Doctor")
    .replace(/\b7:12pm\b/g, "seven twelve p.m.")
    .replace(/\b(\d{1,2})am\b\.?/g, "$1 a.m.")
    .replace(/\bNov 19\b/g, "November nineteenth")
    .replace(/\bv1\b/g, "version one")
    .replace(/\s*·\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}
function clipFor(text) {
  const say = spoken(text);
  const key = crypto.createHash("sha1").update(`kokoro-v1.0|${VOICE}|${VO_SPEED}|${say}`).digest("hex").slice(0, 16);
  const file = path.join(VO_DIR, `${key}.wav`);
  const meta = `${file}.json`;
  if (fs.existsSync(meta)) return { file, ...JSON.parse(fs.readFileSync(meta, "utf8")), cached: true };
  return { file, say, cached: false };
}
async function synth(clip) {
  const { dur, phonemes } = await tts().generate({ text: clip.say, out: clip.file, voice: VOICE, speed: VO_SPEED });
  fs.writeFileSync(`${clip.file}.json`, JSON.stringify({ dur, say: clip.say, voice: `kokoro-v1.0 ${VOICE}`, phonemes }));
  return { ...clip, dur, cached: false };
}
export function closeVoice() {
  worker?.close();
  worker = null;
}

export const BASE = "http://localhost:3210";

export async function startStudio({ out = "frames" } = {}) {
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 900 },
    deviceScaleFactor: 1.2,
    storageState: "state.json",
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(6000);
  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  const segments = [];
  let frameNo = 0;
  let recording = false;
  let cursor = { x: 800, y: 470 };
  const narration = [];
  let narrationEnd = 0;

  cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
    try { await cdp.send("Page.screencastFrameAck", { sessionId }); } catch { /* closed */ }
    if (!recording) return;
    const file = `f${String(++frameNo).padStart(6, "0")}.jpg`;
    fs.writeFileSync(`${out}/${file}`, Buffer.from(data, "base64"));
    frames.push({ file, ts: metadata.timestamp ?? Date.now() / 1000, seg: segments.length - 1 });
  });

  const wait = (ms) => page.waitForTimeout(ms);
  const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

  async function nudge() {
    await page.evaluate(() => {
      const n = document.getElementById("demo-nudge");
      if (n) n.style.opacity = n.style.opacity === "0.01" ? "0.02" : "0.01";
    }).catch(() => {});
  }
  async function rec() {
    if (recording) return;
    segments.push({ start: Date.now() / 1000, end: null });
    recording = true;
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 90, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
    await nudge();
  }
  async function untilQuiet(gap = 0.35) {
    const left = narrationEnd + gap - Date.now() / 1000;
    if (left > 0) await page.waitForTimeout(Math.ceil(left * 1000));
  }
  async function cut() {
    if (!recording) return;
    await untilQuiet(0.45);
    await page.waitForTimeout(120);
    recording = false;
    segments[segments.length - 1].end = Date.now() / 1000;
    await cdp.send("Page.stopScreencast");
  }

  async function decorate() {
    await page.evaluate(({ x, y, hideCaptions }) => {
      document.documentElement.style.scrollBehavior = "auto";
      if (hideCaptions && !document.getElementById("demo-hide-cap")) {
        const h = document.createElement("style");
        h.id = "demo-hide-cap";
        h.textContent = "#demo-cap{display:none!important}";
        document.head.appendChild(h);
      }
      if (document.getElementById("demo-style")) return;
      const style = document.createElement("style");
      style.id = "demo-style";
      style.textContent = `
        nextjs-portal{display:none!important}
        #demo-nudge{position:fixed;right:0;bottom:0;width:2px;height:2px;background:#ebeff5;opacity:.01;z-index:2147483647;pointer-events:none}
        #demo-cursor{position:fixed;left:0;top:0;width:28px;height:28px;z-index:2147483647;pointer-events:none;transition:transform 750ms cubic-bezier(.25,.8,.25,1);will-change:transform}
        #demo-cursor svg{filter:drop-shadow(0 2px 4px rgba(36,36,38,.45))}
        #demo-cursor .ring{position:absolute;left:-14px;top:-14px;width:30px;height:30px;border-radius:50%;border:3px solid #35363b;opacity:0;transform:scale(.4)}
        #demo-cursor.click .ring{animation:demoRing 520ms ease-out}
        @keyframes demoRing{0%{opacity:.95;transform:scale(.4)}100%{opacity:0;transform:scale(1.7)}}
        #demo-cap{position:fixed;left:28px;bottom:28px;max-width:660px;z-index:2147483646;background:rgba(255,255,255,.98);border:1px solid rgba(36,36,38,.12);border-radius:16px;box-shadow:0 24px 60px -18px rgba(36,36,38,.38);padding:14px 20px 16px;font-family:geistSans,system-ui,sans-serif;opacity:0;transform:translateY(14px);transition:opacity 420ms ease,transform 420ms ease;pointer-events:none}
        #demo-cap.show{opacity:1;transform:none}
        #demo-cap .k{display:inline-block;font-family:geistMono,ui-monospace,monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#1b1b1d;background:#d9ff5c;border-radius:999px;padding:3px 10px;margin-bottom:9px;font-weight:600}
        #demo-cap .t{font-size:19.5px;line-height:1.42;color:#242426;font-weight:450;letter-spacing:-.005em}
        #demo-card{position:fixed;inset:0;z-index:2147483645;background:#1b1b1d;display:flex;align-items:center;justify-content:center;opacity:1;transition:opacity 600ms ease;font-family:geistSans,system-ui,sans-serif}
        #demo-card.hide{opacity:0}
        #demo-card .inner{max-width:1240px;padding:0 72px;text-align:left;width:100%}
        #demo-card .eyebrow{display:inline-flex;gap:10px;align-items:center;font-size:17px;color:#f4f4f5;background:#242426;border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:8px 16px}
        #demo-card .eyebrow b{display:inline-block;width:9px;height:9px;border-radius:50%;background:#d9ff5c}
        #demo-card h1{font-size:92px;line-height:1.02;margin:26px 0 0;color:#f4f4f5;font-weight:450;letter-spacing:-.04em}
        #demo-card h1 .b{display:block;color:#7c7c82}
        #demo-card h1 mark{background:#d9ff5c;color:#1b1b1d;padding:0 .12em;border-radius:.08em}
        #demo-card p{font-size:25px;line-height:1.5;color:#b9babf;margin:28px 0 0;max-width:920px}
        #demo-card .fine{font-family:geistMono,monospace;font-size:14px;color:#8b8b90;margin-top:36px;letter-spacing:.02em}
        #demo-card .chips{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}
        #demo-card .chips span{font-size:17px;padding:10px 18px;border-radius:12px;background:#242426;color:#f4f4f5;border:1px solid rgba(255,255,255,.12);font-weight:500}
        #demo-card .chips span:first-child{background:#d9ff5c;color:#1b1b1d;border-color:#d9ff5c}
        #demo-console{position:fixed;inset:0;z-index:2147483644;background:rgba(10,10,12,.6);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 450ms ease;font-family:geistSans,system-ui,sans-serif}
        #demo-console.show{opacity:1}
        #demo-console .win{width:1240px;background:#202022;border-radius:18px;box-shadow:0 40px 90px -20px rgba(0,0,0,.8);overflow:hidden;border:1px solid rgba(255,255,255,.12)}
        #demo-console .hd{display:flex;align-items:center;gap:14px;padding:16px 22px;border-bottom:1px solid rgba(255,255,255,.1);background:#242426}
        #demo-console .hd .dot{width:11px;height:11px;border-radius:50%;background:rgba(255,255,255,.18)}
        #demo-console .hd .ttl{font-weight:600;color:#f4f4f5;font-size:17px}
        #demo-console .hd .tag{margin-left:auto;font-family:geistMono,monospace;font-size:12.5px;color:#1b1b1d;background:#d9ff5c;border-radius:999px;padding:5px 11px;font-weight:600}
        #demo-console .bd{display:grid;grid-template-columns:1fr 1fr}
        #demo-console .col{padding:18px 22px 22px}
        #demo-console .col+.col{border-left:1px solid rgba(255,255,255,.1)}
        #demo-console .lbl{font-family:geistMono,monospace;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#8b8b90;margin-bottom:10px;font-weight:600}
        #demo-console .lbl i{font-style:normal;color:#d9ff5c}
        #demo-console pre{margin:0 0 16px;font-family:geistMono,monospace;font-size:13.2px;line-height:1.55;color:#f4f4f5;white-space:pre-wrap;word-break:break-word;background:#1b1b1d;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:12px 14px}
        #demo-console pre .m{color:#d9ff5c;font-weight:600}
        #demo-console pre .g{color:#86efac;font-weight:600}
        #demo-console pre .c{color:#8b8b90}
        #demo-console .step{opacity:0;transform:translateY(8px);transition:opacity 420ms ease,transform 420ms ease}
        #demo-console .step.on{opacity:1;transform:none}
      `;
      document.head.appendChild(style);
      const n = document.createElement("div");
      n.id = "demo-nudge";
      document.body.appendChild(n);
      const c = document.createElement("div");
      c.id = "demo-cursor";
      c.innerHTML = '<div class="ring"></div><svg width="28" height="28" viewBox="0 0 28 28"><path d="M5 3 L22 14.2 L14.3 15.9 L10.4 23.4 Z" fill="#242426" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/></svg>';
      c.style.transition = "none";
      c.style.transform = `translate(${x - 5}px, ${y - 3}px)`;
      document.body.appendChild(c);
      requestAnimationFrame(() => { c.style.transition = ""; });
      const cap = document.createElement("div");
      cap.id = "demo-cap";
      cap.innerHTML = '<div class="k"></div><div class="t"></div>';
      document.body.appendChild(cap);
    }, { ...cursor, hideCaptions: process.env.HIDE_CAPTIONS === "1" });
  }

  async function go(path, { settle = 900 } = {}) {
    await cut();
    log("go", path);
    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 180000 }).catch((e) => log("goto warn", e.message.split("\n")[0]));
    await wait(settle);
    await decorate();
  }

  // Speak `text` now. Synthesis (first take only) happens with the camera off.
  async function speak(text) {
    let clip = clipFor(text);
    if (!clip.cached) {
      const wasRecording = recording;
      if (wasRecording) await cut();
      clip = await synth(clip);
      log("voiced", clip.dur.toFixed(1) + "s", clip.say.slice(0, 60));
      if (wasRecording) await rec();
    }
    await untilQuiet(0.25);
    const t = Date.now() / 1000;
    narration.push({ t, file: clip.file, dur: clip.dur });
    narrationEnd = t + clip.dur;
    return clip.dur;
  }

  async function say(kicker, text, holdMs = 0) {
    await untilQuiet(0.3);
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
    if (recording) await speak(text);
    if (holdMs) await wait(holdMs);
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
  async function clickNav(locator, { resume = true } = {}) {
    await click(locator);
    await cut();
    await page.waitForLoadState("networkidle", { timeout: 120000 }).catch(() => {});
    await wait(1100);
    await decorate();
    if (resume) await rec();
  }
  // Type into a field one character at a time so viewers see it filled in.
  async function type(locator, text, { delay = 45 } = {}) {
    await click(locator);
    await locator.fill("");
    await locator.pressSequentially(text, { delay });
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
  async function scrollTo(locator, { offset = 120, ms = 1600 } = {}) {
    const y = await locator.evaluate((el, offset) => el.getBoundingClientRect().top + window.scrollY - offset, offset).catch(() => null);
    if (y === null) return false;
    await scrollY(y, ms);
    return true;
  }

  // Full-screen title card. `title` is the first line, `dim` the grey second
  // line, and `mark` an optional lime-marked phrase appended to the second line.
  async function card({ eyebrow, title, dim = "", mark = "", body = "", chips = [], fine = "", voice = null }, { holdMs = 3200, fadeOut = true } = {}) {
    await page.evaluate(({ eyebrow, title, dim, mark, body, chips, fine }) => {
      document.getElementById("demo-card")?.remove();
      const el = document.createElement("div");
      el.id = "demo-card";
      el.innerHTML = `<div class="inner">
        <div class="eyebrow"><b></b><span></span></div>
        <h1><span class="a"></span><span class="b"><span class="d"></span>${mark ? " <mark></mark>" : ""}</span></h1>
        ${body ? "<p></p>" : ""}
        ${chips.length ? '<div class="chips"></div>' : ""}
        ${fine ? '<div class="fine"></div>' : ""}</div>`;
      el.querySelector(".eyebrow span").textContent = eyebrow;
      el.querySelector("h1 .a").textContent = title;
      el.querySelector("h1 .d").textContent = dim;
      if (mark) el.querySelector("h1 mark").textContent = mark;
      if (body) el.querySelector("p").textContent = body;
      if (chips.length) el.querySelector(".chips").innerHTML = chips.map((c) => `<span>${c.replace(/</g, "&lt;")}</span>`).join("");
      if (fine) el.querySelector(".fine").textContent = fine;
      document.body.appendChild(el);
      document.getElementById("demo-cap")?.classList.remove("show");
    }, { eyebrow, title, dim, mark, body, chips, fine });
    await rec();
    await nudge();
    const dur = voice ? await speak(voice) : 0;
    await wait(Math.max(holdMs, dur * 1000 + 700));
    if (fadeOut) {
      await page.evaluate(() => document.getElementById("demo-card")?.classList.add("hide"));
      await wait(650);
      await page.evaluate(() => document.getElementById("demo-card")?.remove());
    }
  }

  const safe = async (label, fn) => {
    try { await fn(); } catch (e) { log(`SKIP ${label}:`, e.message.split("\n")[0]); }
  };

  async function finish() {
    await cut();
    fs.writeFileSync("timeline.json", JSON.stringify({ frames, segments, narration }));
    log("frames", frames.length, "segments", segments.length);
    await browser.close();
    closeVoice();
  }

  return { page, ctx, cdp, wait, log, rec, cut, nudge, decorate, go, say, moveTo, pointAt, clickFx, click, clickNav, type, scrollY, scrollTo, card, safe, finish };
}
