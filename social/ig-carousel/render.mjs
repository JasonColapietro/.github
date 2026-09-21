#!/usr/bin/env node
// Render every HTML source in src/ to a PNG in images/<theme>/ at its declared size.
// Each source sets <meta name="size" content="WxH">; the theme comes from the filename
// prefix (dark-*, light-*). Output is 2x by default so Instagram downsamples rather than
// upscales -- pass SCALE=1 for pixel-exact 1080x1350. Uses the Playwright Chromium already
// on the machine; pass CHROME=/path/to/chrome to override.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PKG || "playwright");

const here = path.dirname(new URL(import.meta.url).pathname);
const srcDir = path.join(here, "src");
const outDir = path.join(here, "images");
const scale = Number(process.env.SCALE || 2);

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const page = await browser.newPage({ deviceScaleFactor: scale });
for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith(".html")).sort()) {
  const html = fs.readFileSync(path.join(srcDir, file), "utf8");
  const m = html.match(/name="size" content="(\d+)x(\d+)"/);
  if (!m) throw new Error(`${file}: missing <meta name="size">`);
  const [w, h] = [Number(m[1]), Number(m[2])];
  const theme = file.split("-")[0];
  fs.mkdirSync(path.join(outDir, theme), { recursive: true });

  await page.setViewportSize({ width: w, height: h });
  await page.goto("file://" + path.join(srcDir, file), { waitUntil: "networkidle" });
  // The brand faces are webfonts; screenshotting before they land silently falls back.
  await page.evaluate(() => document.fonts.ready);
  const ok = await page.evaluate(() =>
    document.fonts.check('400 92px "Instrument Serif"') && document.fonts.check('300 30px "Geist"')
  );
  if (!ok) console.warn(`${file}: brand webfonts did not load; render fell back`);

  const out = path.join(outDir, theme, file.replace(/^\w+-/, `suede-msn-${theme}-`).replace(/\.html$/, ".png"));
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: w, height: h } });
  console.log(`${path.relative(here, out)}  ${w * scale}x${h * scale}`);
}
await browser.close();
