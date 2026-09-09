// Shared premium design system for the Suede surface decks.
const pptxgen = require("pptxgenjs");
const path = require("path");

const W = 13.333, H = 7.5, M = 0.7; // wide layout, 0.7" margins
const SERIF = "Cambria", SANS = "Calibri", MONO = "Courier New";
const BG = (n) => path.join(__dirname, "bg", n + ".png");
const ASSET = (n) => path.join(__dirname, "assets", n);

// theme: { name, dark:{bg, bg2, text, muted, accent, accent2, panel, line}, light:{...} | null }
function deck(theme) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Suede Labs AI";
  pres.company = "Suede Labs AI";
  pres.title = theme.title;
  const ctx = { pres, theme, n: 0, total: 0 };
  return ctx;
}

function mode(ctx, m) {
  return m === "light" && ctx.theme.light ? ctx.theme.light : ctx.theme.dark;
}

// Base slide: background image, footer line, page number.
function slide(ctx, opts = {}) {
  const m = mode(ctx, opts.mode);
  const s = ctx.pres.addSlide();
  const bgName = opts.bg || (opts.mode === "light" ? ctx.theme.lightBg : (opts.alt ? ctx.theme.darkBg2 : ctx.theme.darkBg));
  s.background = { path: BG(bgName) };
  ctx.n += 1;
  if (!opts.noFooter) {
    s.addText(ctx.theme.footer, {
      x: M, y: H - 0.5, w: 9.5, h: 0.25, fontFace: MONO, fontSize: 8.5, color: m.muted,
      margin: 0, isTextBox: true, charSpacing: 1,
    });
    s.addText(String(ctx.n).padStart(2, "0"), {
      x: W - M - 1, y: H - 0.5, w: 1, h: 0.25, fontFace: MONO, fontSize: 8.5, color: m.muted,
      margin: 0, align: "right", isTextBox: true,
    });
  }
  s.__m = m;
  return s;
}

// Mono eyebrow label, e.g. "01 — The problem"
function eyebrow(s, text, x, y, w, color) {
  s.addText(text.toUpperCase(), {
    x, y, w, h: 0.28, fontFace: MONO, fontSize: 9.5, color: color || s.__m.accent,
    charSpacing: 2.5, margin: 0, isTextBox: true,
  });
}

// Serif display title
function title(s, text, x, y, w, h, opts = {}) {
  s.addText(text, {
    x, y, w, h, fontFace: SERIF, fontSize: opts.size || 34, color: opts.color || s.__m.text,
    margin: 0, isTextBox: true, valign: opts.valign || "top", lineSpacingMultiple: 1.05,
    align: opts.align || "left",
  });
}

function body(s, text, x, y, w, h, opts = {}) {
  s.addText(text, {
    x, y, w, h, fontFace: SANS, fontSize: opts.size || 14, color: opts.color || s.__m.muted,
    margin: 0, isTextBox: true, valign: opts.valign || "top", lineSpacingMultiple: opts.ls || 1.2,
    align: opts.align || "left", italic: !!opts.italic, bold: !!opts.bold,
  });
}

function mono(s, text, x, y, w, h, opts = {}) {
  s.addText(text, {
    x, y, w, h, fontFace: MONO, fontSize: opts.size || 10.5, color: opts.color || s.__m.text,
    margin: 0, isTextBox: true, valign: opts.valign || "top", align: opts.align || "left",
    lineSpacingMultiple: opts.ls || 1.25, charSpacing: opts.cs || 0,
  });
}

// Numbered circle: the recurring motif (a registry index mark).
function numCircle(s, label, x, y, size, opts = {}) {
  const m = s.__m;
  s.addShape("ellipse", {
    x, y, w: size, h: size,
    fill: { color: opts.fill || m.accent },
    line: { color: opts.fill || m.accent, width: 0 },
  });
  s.addText(label, {
    x, y, w: size, h: size, fontFace: MONO, fontSize: opts.size || 10, bold: true,
    color: opts.color || m.onAccent, align: "center", valign: "middle", margin: 0, isTextBox: true,
  });
}

// Hairline
function rule(s, x, y, w, color) {
  s.addShape("line", { x, y, w, h: 0, line: { color: color || s.__m.line, width: 0.75 } });
}

// Panel with subtle tint + soft shadow (no edge stripes).
function panel(s, x, y, w, h, opts = {}) {
  const m = s.__m;
  s.addShape("roundRect", {
    x, y, w, h, rectRadius: opts.r ?? 0.12,
    fill: { color: opts.fill || m.panel, transparency: opts.transparency ?? 0 },
    line: { color: opts.line || m.line, width: 0.75 },
    shadow: opts.noShadow ? undefined : { type: "outer", color: "000000", blur: 12, offset: 3, angle: 90, opacity: m.isLight ? 0.08 : 0.35 },
  });
}

// Card: numbered/labelled block with heading + text.
function card(s, x, y, w, h, opts) {
  const m = s.__m;
  panel(s, x, y, w, h, { fill: opts.fill });
  let top = y + 0.28;
  if (opts.n !== undefined) {
    numCircle(s, String(opts.n), x + 0.28, top, 0.38, { size: 9 });
    top += 0.55;
  } else if (opts.tag) {
    s.addText(opts.tag.toUpperCase(), { x: x + 0.28, y: top, w: w - 0.56, h: 0.22, fontFace: MONO, fontSize: 8.5, color: m.accent, charSpacing: 2, margin: 0, isTextBox: true });
    top += 0.34;
  }
  const ts = opts.titleSize || 17;
  const lines = Math.max(1, Math.ceil((opts.title.length * ts * 0.0088) / (w - 0.56)));
  const th = opts.titleH || (lines * ts * 1.22 / 72 + 0.06);
  s.addText(opts.title, { x: x + 0.28, y: top, w: w - 0.56, h: th, fontFace: SERIF, fontSize: ts, color: m.text, margin: 0, isTextBox: true, valign: "top" });
  top += th + 0.08;
  s.addText(opts.text, { x: x + 0.28, y: top, w: w - 0.56, h: y + h - top - 0.22, fontFace: SANS, fontSize: opts.textSize || 12, color: m.muted, margin: 0, isTextBox: true, valign: "top", lineSpacingMultiple: 1.18 });
}

// Large stat callout
function stat(s, big, label, x, y, w, opts = {}) {
  const m = s.__m;
  s.addText(big, { x, y, w, h: opts.bigH || 0.95, fontFace: SERIF, fontSize: opts.size || 54, color: opts.color || m.text, margin: 0, isTextBox: true, valign: "bottom" });
  s.addText(label, { x, y: y + (opts.bigH || 0.95) + 0.08, w, h: opts.labelH || 0.6, fontFace: SANS, fontSize: opts.labelSize || 12, color: m.muted, margin: 0, isTextBox: true, valign: "top", lineSpacingMultiple: 1.15 });
}

// Ledger: dark evidence panel with label / value / meta rows in mono. The brand's "receipt".
function ledger(s, x, y, w, rows, opts = {}) {
  const m = s.__m;
  const rowH = opts.rowH || 0.62;
  const h = 0.55 + rows.length * rowH + 0.15;
  panel(s, x, y, w, h, { fill: opts.fill || m.ledger, line: opts.line || m.ledgerLine });
  if (opts.header) {
    s.addText(opts.header.toUpperCase(), { x: x + 0.3, y: y + 0.18, w: w - 0.6, h: 0.25, fontFace: MONO, fontSize: 8.5, color: opts.headerColor || m.ledgerAccent || m.accent, charSpacing: 2.5, margin: 0, isTextBox: true });
  }
  rows.forEach((r, i) => {
    const ry = y + 0.55 + i * rowH;
    rule(s, x + 0.3, ry, w - 0.6, opts.ruleColor || m.ledgerLine);
    const sp = opts.split || 0.58;
    s.addText(r[0], { x: x + 0.3, y: ry + 0.1, w: (w - 0.6) * sp - 0.1, h: rowH - 0.14, fontFace: SANS, fontSize: opts.size || 12, color: opts.textColor || m.ledgerText, margin: 0, isTextBox: true, valign: "middle", bold: false });
    s.addText(r[1], { x: x + 0.3 + (w - 0.6) * sp, y: ry + 0.1, w: (w - 0.6) * (1 - sp), h: rowH - 0.14, fontFace: MONO, fontSize: (opts.size || 12) - 2.5, color: opts.metaColor || m.ledgerAccent || m.accent, margin: 0, isTextBox: true, valign: "middle", align: "right" });
  });
  return h;
}

// Process flow: numbered steps across the slide with connector line.
function flow(s, steps, x, y, w, opts = {}) {
  const m = s.__m;
  const n = steps.length, gap = 0.3, cw = (w - gap * (n - 1)) / n;
  rule(s, x + 0.3, y + 0.24, w - 0.6, m.line);
  steps.forEach((st, i) => {
    const cx = x + i * (cw + gap);
    numCircle(s, String(i + 1).padStart(2, "0"), cx, y, 0.48, { size: 10 });
    s.addText(st[0], { x: cx, y: y + 0.66, w: cw, h: 0.42, fontFace: SERIF, fontSize: opts.titleSize || 17, color: m.text, margin: 0, isTextBox: true });
    s.addText(st[1], { x: cx, y: y + 1.1, w: cw, h: opts.textH || 1.4, fontFace: SANS, fontSize: opts.textSize || 11.5, color: m.muted, margin: 0, isTextBox: true, lineSpacingMultiple: 1.18, valign: "top" });
  });
}

// Icon-less "chip" row of names (partners, rails)
function chips(s, items, x, y, w, opts = {}) {
  const m = s.__m;
  const perRow = opts.perRow || 5, gap = 0.18;
  const cw = (w - gap * (perRow - 1)) / perRow, ch = opts.h || 0.62;
  items.forEach((t, i) => {
    const r = Math.floor(i / perRow), c = i % perRow;
    const cx = x + c * (cw + gap), cy = y + r * (ch + gap);
    s.addShape("roundRect", { x: cx, y: cy, w: cw, h: ch, rectRadius: 0.08, fill: { color: m.panel }, line: { color: m.line, width: 0.75 } });
    s.addText(t, { x: cx, y: cy, w: cw, h: ch, fontFace: SANS, fontSize: opts.size || 13, color: m.text, align: "center", valign: "middle", margin: 0, isTextBox: true, bold: true });
  });
}

// Bulleted list (real bullets)
function bullets(s, items, x, y, w, h, opts = {}) {
  const m = s.__m;
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: i < items.length - 1, paraSpaceAfter: opts.space || 6 } })), {
    x, y, w, h, fontFace: SANS, fontSize: opts.size || 13, color: opts.color || m.muted, margin: 0, isTextBox: true, valign: "top", lineSpacingMultiple: 1.15,
  });
}

// Cover slide
function cover(ctx, o) {
  const s = slide(ctx, { noFooter: true, bg: o.bg });
  const m = s.__m;
  s.addImage({ path: ASSET(m.isLight ? "logo-dark.png" : "logo-light.png"), x: M, y: 0.6, w: 0.55, h: 0.55 });
  s.addText(o.brand || "Suede Labs AI", { x: M + 0.7, y: 0.6, w: 5, h: 0.55, fontFace: MONO, fontSize: 10, color: m.muted, charSpacing: 2.5, valign: "middle", margin: 0, isTextBox: true });
  eyebrow(s, o.eyebrow, M, 2.05, 11.5, m.accent);
  let ts = o.titleSize || 50; const tw = o.titleW || 10.6;
  while (o.title.length * ts * 0.0088 > 2 * tw && ts > 38) ts -= 1;
  const lines = Math.max(1, Math.ceil((o.title.length * ts * 0.0088) / tw));
  const th = lines * ts * 1.12 / 72 + 0.1;
  title(s, o.title, M, 2.4, tw, th, { size: ts });
  body(s, o.sub, M, 2.4 + th + 0.25, 8.2, 1.2, { size: 16, color: m.muted, ls: 1.25 });
  rule(s, M, H - 0.95, W - 2 * M, m.line);
  mono(s, o.url, M, H - 0.8, 6, 0.3, { size: 10, color: m.accent, cs: 2 });
  mono(s, o.date || "September 2026", W - M - 4, H - 0.8, 4, 0.3, { size: 10, color: m.muted, align: "right", cs: 2 });
  return s;
}

// Section header slide (short, dark, editorial)
function statement(ctx, o) {
  const s = slide(ctx, { alt: true, bg: o.bg });
  const m = s.__m;
  eyebrow(s, o.eyebrow, M, 2.2, 8);
  title(s, o.title, M, 2.6, 10.5, 2.2, { size: o.size || 44 });
  if (o.sub) body(s, o.sub, M, 5.0, 8.5, 1.2, { size: 15 });
  return s;
}

// Closing slide
function closing(ctx, o) {
  const s = slide(ctx, { noFooter: true, bg: o.bg });
  const m = s.__m;
  s.addImage({ path: ASSET(m.isLight ? "logo-dark.png" : "logo-light.png"), x: M, y: 0.6, w: 0.55, h: 0.55 });
  eyebrow(s, o.eyebrow, M, 2.1, 6.6);
  let ts = 46; const tw = 6.6;
  while (o.title.length * ts * 0.0088 > 2 * tw && ts > 34) ts -= 1;
  const lines = Math.max(1, Math.ceil((o.title.length * ts * 0.0088) / tw));
  const th = lines * ts * 1.12 / 72 + 0.1;
  title(s, o.title, M, 2.5, tw, th, { size: ts });
  body(s, o.sub, M, 2.5 + th + 0.3, 6.6, 1.3, { size: 15 });
  const rows = o.rows || [];
  ledger(s, W - M - 4.9, 2.2, 4.9, rows, { header: o.ledgerHeader || "Direct line", rowH: 0.58, size: 12, split: 0.36 });
  rule(s, M, H - 0.95, W - 2 * M, m.line);
  mono(s, o.url, M, H - 0.8, 6, 0.3, { size: 10, color: m.accent, cs: 2 });
  mono(s, "Suede Labs AI · Jason Colapietro, Founder & CEO", W - M - 6, H - 0.8, 6, 0.3, { size: 9.5, color: m.muted, align: "right", cs: 1 });
  return s;
}

// Standard content header (eyebrow + title top-left)
function header(s, eyebrowText, titleText, opts = {}) {
  eyebrow(s, eyebrowText, M, 0.6, 10);
  const w = opts.w || 11.6, f = 0.0085;
  let size = opts.size || 30;
  const twoLinesOk = (opts.h || 0.9) >= 1.2;
  if (titleText.length * size * f > w) {
    if (twoLinesOk) { while (titleText.length * size * f > 2 * w && size > 23) size -= 1; }
    else { size = Math.max(23, Math.floor(w / (titleText.length * f))); if (titleText.length * size * f > w) console.warn("TITLE WRAPS:", titleText); }
  }
  const lines = Math.max(1, Math.ceil((titleText.length * size * f) / w));
  title(s, titleText, M, 0.95, w, lines * size * 1.1 / 72 + 0.1, { size });
}

async function save(ctx, file) {
  await ctx.pres.writeFile({ fileName: file });
  console.log("wrote", file, ctx.n, "slides");
}

// Theme factory
function theme(o) {
  const dark = Object.assign({
    isLight: false,
    text: "F4F5F9", muted: "B7BCCB", line: "3A4056", panel: "141A2E", ledger: "0B0F1C", ledgerLine: "2A3148", ledgerText: "E6E8F0",
    onAccent: "FFFFFF",
  }, o.dark);
  const light = o.light ? Object.assign({
    isLight: true,
    text: "161A2B", muted: "4E5568", line: "D9DDE8", panel: "F3F5FA", ledger: dark.panel, ledgerLine: "2A3148", ledgerText: "E6E8F0",
    onAccent: "FFFFFF",
  }, o.light) : null;
  return { title: o.title, footer: o.footer, darkBg: o.darkBg, darkBg2: o.darkBg2 || o.darkBg, lightBg: o.lightBg, dark, light };
}

module.exports = { pptxgen, W, H, M, SERIF, SANS, MONO, ASSET, BG, deck, slide, eyebrow, title, body, mono, numCircle, rule, panel, card, stat, ledger, flow, chips, bullets, cover, statement, closing, header, save, theme };
