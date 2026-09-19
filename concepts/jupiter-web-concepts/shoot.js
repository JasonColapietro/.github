// Render each local board to a 2x PNG (2160 x 2700) and a 1x preview.
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

(async () => {
  const root = __dirname;
  const out = path.join(root, 'out');
  fs.mkdirSync(out, { recursive: true });
  const scale = Number(process.env.SCALE || 2);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', (r) => errors.push('REQ FAILED ' + r.url()));
  for (let i = 1; i <= 4; i++) {
    const file = path.join(root, 'local', `board${i}.html`);
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })));
    });
    const fontsLoaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));
    const el = await page.$('.board');
    const name = `jupiter-web-concepts-0${i}`;
    await el.screenshot({ path: path.join(out, `${name}.png`), type: 'png' });
    console.log(name, 'fonts loaded:', [...new Set(fontsLoaded)].length);
  }
  await browser.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); }
})().catch((e) => { console.error(e); process.exit(1); });
