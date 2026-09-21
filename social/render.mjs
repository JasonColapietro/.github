#!/usr/bin/env node
// Render every HTML source in images-src/ to a PNG in images/ at its declared size.
// Each source sets <meta name="size" content="WxH">. Uses the Playwright Chromium already
// on the machine; pass CHROME=/path/to/chrome to override.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PKG || "playwright");

const here = path.dirname(new URL(import.meta.url).pathname);
const srcDir = path.join(here, "images-src");
const outDir = path.join(here, "images");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith(".html")).sort()) {
  const html = fs.readFileSync(path.join(srcDir, file), "utf8");
  const m = html.match(/name="size" content="(\d+)x(\d+)"/);
  if (!m) throw new Error(`${file}: missing <meta name="size">`);
  const [w, h] = [Number(m[1]), Number(m[2])];
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html, { waitUntil: "load" });
  const out = path.join(outDir, file.replace(/\.html$/, ".png"));
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: w, height: h } });
  console.log(`${path.relative(here, out)}  ${w}x${h}`);
}
await browser.close();
