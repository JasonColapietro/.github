// Renders the social cut's transparent overlays (headlines, captions, frame,
// end cards) as PNGs in the site's Makro style, using the Geist and Instrument
// Serif files from the Studio's node_modules.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node22/lib/node_modules/playwright");

const HERE = path.dirname(new URL(import.meta.url).pathname);
const NM = "/home/user/suede-agent-studio/node_modules";
const OUT = path.join(HERE, "ov");
fs.mkdirSync(OUT, { recursive: true });
const beats = JSON.parse(fs.readFileSync(path.join(HERE, "social-beats.json"), "utf8"));

const css = `
@font-face{font-family:G;src:url(file://${NM}/geist/dist/fonts/geist-sans/Geist-Regular.woff2);font-weight:400}
@font-face{font-family:G;src:url(file://${NM}/geist/dist/fonts/geist-sans/Geist-Medium.woff2);font-weight:500}
@font-face{font-family:G;src:url(file://${NM}/geist/dist/fonts/geist-sans/Geist-SemiBold.woff2);font-weight:600}
@font-face{font-family:M;src:url(file://${NM}/geist/dist/fonts/geist-mono/GeistMono-Medium.woff2);font-weight:500}
@font-face{font-family:S;src:url(file://${NM}/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2)}
html,body{margin:0;background:transparent}
*{box-sizing:border-box}
.c{position:relative;font-family:G,system-ui,sans-serif;color:#f4f4f5;-webkit-font-smoothing:antialiased}
.brand{display:inline-flex;align-items:center;gap:12px;font-size:28px;font-weight:500;color:#f4f4f5;background:#242426;border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:12px 22px}
.brand b{width:12px;height:12px;border-radius:50%;background:#d9ff5c;display:inline-block}
.head{font-weight:500;letter-spacing:-.035em;line-height:1.02;color:#f4f4f5}
.sub{color:#8b8b90;letter-spacing:-.02em;line-height:1.12;font-weight:500}
mark{background:#d9ff5c;color:#1b1b1d;padding:0 .14em;border-radius:.1em}
.cap{font-weight:500;letter-spacing:-.01em;line-height:1.3;text-align:center}
.pill{display:inline-block;background:#d9ff5c;color:#1b1b1d;font-weight:600;border-radius:14px}
.tag{font-family:M,monospace;letter-spacing:.06em;text-transform:uppercase;color:#8b8b90}
`;

const browser = await chromium.launch();
const page = await browser.newPage();
const tmp = path.join(OUT, "_page.html");
fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body></body></html>`);
await page.goto(`file://${tmp}`);

async function shot(name, w, h, html, { bg = null } = {}) {
  await page.setViewportSize({ width: w, height: h });
  await page.evaluate(({ html, bg, w, h }) => {
    document.body.innerHTML = `<div class="c" style="width:${w}px;height:${h}px;${bg ? `background:${bg};` : ""}">${html}</div>`;
  }, { html, bg, w, h });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, name), omitBackground: !bg, clip: { x: 0, y: 0, width: w, height: h } });
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// ── Vertical 1080x1920 ────────────────────────────────────────────────────
await shot("v_base.png", 1080, 1920, `
  <div style="position:absolute;left:0;right:0;bottom:64px;text-align:center" class="tag"><span style="font-size:24px">agents.suedeai.ai · sample data · fictional practice</span></div>`, { bg: "#1b1b1d" });
// Rounded frame for the 1020x574 video window: corners filled with the ground colour.
await shot("v_frame.png", 1020, 574, `
  <svg width="1020" height="574" style="position:absolute;inset:0"><defs><mask id="m"><rect width="1020" height="574" fill="white"/><rect x="0" y="0" width="1020" height="574" rx="30" fill="black"/></mask></defs>
  <rect width="1020" height="574" fill="#1b1b1d" mask="url(#m)"/>
  <rect x="1" y="1" width="1018" height="572" rx="29" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="2"/></svg>`);
await shot("v_progress.png", 1080, 8, `<div style="width:1080px;height:8px;background:#d9ff5c"></div>`);
for (const b of beats.slice(0, 8)) {
  await shot(`v_top_${b.id}.png`, 1080, 640, `
    <div style="position:absolute;left:60px;top:96px"><span class="brand"><b></b>Suede AI Agent Studio</span></div>
    <div style="position:absolute;left:60px;right:60px;top:220px">
      <div class="head" style="font-size:84px">${esc(b.head)}</div>
      <div class="sub" style="font-size:46px;margin-top:22px">${esc(b.sub)}</div>
    </div>`);
  await shot(`v_cap_${b.id}.png`, 1080, 500, `
    <div style="position:absolute;left:70px;right:70px;top:30px" class="cap"><span style="font-size:50px">${esc(b.cap)}</span></div>`);
}
const endV = beats[8];
await shot("v_end.png", 1080, 1920, `
  <div style="position:absolute;left:80px;right:80px;top:560px">
    <span class="brand"><b></b>agents.suedeai.ai</span>
    <div class="head" style="font-size:118px;margin-top:44px">${esc(endV.head)}</div>
    <div class="head" style="font-size:118px;color:#7c7c82">Keep them</div>
    <div class="head" style="font-size:118px;margin-top:6px"><mark>on autopilot.</mark></div>
    <div class="sub" style="font-size:44px;margin-top:44px;color:#b9babf;font-weight:400">Find, win and keep clients in Suede AI Agent Studio.</div>
    <div style="margin-top:64px;display:flex;gap:18px;flex-wrap:wrap">
      <span class="pill" style="font-size:36px;padding:20px 30px">Start building free</span>
      <span style="font-size:36px;padding:20px 30px;border-radius:14px;border:1px solid rgba(255,255,255,.16);background:#242426">Book a 30-minute call</span>
    </div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:64px;text-align:center" class="tag"><span style="font-size:24px">sample data · fictional practice</span></div>`, { bg: "#1b1b1d" });

// ── Horizontal 1920x1080 ──────────────────────────────────────────────────
for (const b of beats.slice(0, 8)) {
  await shot(`h_chip_${b.id}.png`, 1920, 220, `
    <div style="position:absolute;left:56px;top:48px;display:flex;flex-direction:column;gap:14px;align-items:flex-start">
      <span class="pill" style="font-size:44px;padding:14px 26px;letter-spacing:-.02em">${esc(b.head)}</span>
    </div>`);
  await shot(`h_cap_${b.id}.png`, 1920, 300, `
    <div style="position:absolute;left:50%;bottom:44px;transform:translateX(-50%);max-width:1560px;width:max-content;background:rgba(27,27,29,.9);border:1px solid rgba(255,255,255,.14);border-radius:22px;padding:22px 36px" class="cap"><span style="font-size:42px">${esc(b.cap)}</span></div>`);
}
await shot("h_end.png", 1920, 1080, `
  <div style="position:absolute;left:150px;top:250px">
    <span class="brand"><b></b>agents.suedeai.ai</span>
    <div class="head" style="font-size:132px;margin-top:40px">${esc(endV.head)}</div>
    <div class="head" style="font-size:132px;color:#7c7c82">Keep them <mark>on autopilot.</mark></div>
    <div class="sub" style="font-size:40px;margin-top:40px;color:#b9babf;font-weight:400">Find, win and keep clients in Suede AI Agent Studio.</div>
    <div style="margin-top:52px;display:flex;gap:18px">
      <span class="pill" style="font-size:32px;padding:18px 28px">Start building free</span>
      <span style="font-size:32px;padding:18px 28px;border-radius:14px;border:1px solid rgba(255,255,255,.16);background:#242426">Book a 30-minute call</span>
    </div>
  </div>
  <div style="position:absolute;right:60px;bottom:48px" class="tag"><span style="font-size:22px">sample data · fictional practice</span></div>`, { bg: "#1b1b1d" });
await shot("h_label.png", 1920, 80, `<div style="position:absolute;right:56px;top:30px" class="tag"><span style="font-size:20px;background:rgba(27,27,29,.85);padding:6px 12px;border-radius:8px">sample data · fictional practice</span></div>`);

await browser.close();
fs.unlinkSync(tmp);
console.log("overlays in", OUT, fs.readdirSync(OUT).length);
