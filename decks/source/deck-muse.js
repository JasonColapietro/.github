const L = require("./lib");
const { W, H, M } = L;

const T = L.theme({
  title: "Suede Muse — Tonight's card. Same one for every musician on earth.",
  footer: "SUEDE MUSE · MUSE.SUEDEAI.AI · ONE CREATIVE CONSTRAINT A NIGHT",
  darkBg: "muse-dark", darkBg2: "muse-dark2",
  dark: { accent: "C4B5FD", accent2: "F5D69A", panel: "1D1836", line: "3A3260", ledger: "0D0A1C", ledgerLine: "2E2850", ledgerAccent: "C4B5FD", muted: "C9C3E3", onAccent: "14102A" },
});

(async () => {
  const ctx = L.deck(T);

  L.cover(ctx, {
    eyebrow: "muse.suedeai.ai · The House Deck · iOS and web",
    title: "Tonight's card. Same one for every musician on earth.",
    sub: "One creative constraint a night, dealt at midnight. Flip it and talk it through with Muse, the bandmate who listens. Free every night, or $4.99 a month.",
    url: "MUSE.SUEDEAI.AI",
  });

  // 2 The rut
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "01 — The rut", "Four ways to get stuck. One card for each.", { w: 10.5 });
    const cw = (W - 2 * M - 0.75) / 4;
    [["Words", "For when every line sounds like a greeting card."], ["Melody and harmony", "For when your fingers keep playing yesterday's song."], ["Rhythm and groove", "For when everything you make marches in place."], ["Tone and texture", "For when the sound is clean and dead."]].forEach((c, i) => {
      L.card(s, M + i * (cw + 0.25), 2.05, cw, 2.3, { n: String(i + 1).padStart(2, "0"), title: c[0], text: c[1], titleSize: 17, textSize: 12 });
    });
    L.body(s, "Adaptive creative training: daily AI-powered constraints target your weakest creative dimension, track your progress, and capture provenance for every session.", M, 4.7, 11.5, 0.9, { size: 13.5 });
    L.mono(s, "Category: Music / Education · Bundle ai.suede.muse · iOS 17 and up · web at muse.suedeai.ai", M, 5.75, 12, 0.3, { size: 9.5, color: s.__m.accent });
  }

  // 3 What it is
  {
    const s = L.slide(ctx);
    L.header(s, "02 — What it is", "The House Deck, and a bandmate who listens.", { w: 10 });
    L.body(s, "The House Deck deals one creative constraint a night: the same card for every musician on earth. Muse is the musician companion on the other side of the card, for gear talk, songwriting help and creative conversation. Every night has a permanent page; every session is captured with provenance.", M, 1.95, 6.3, 2.0, { size: 13.5 });
    const cw = 3.05, ch = 1.3;
    [["The card", "One constraint, dealt at midnight, shared by everyone."], ["The companion", "Talk it through: lyrics, harmony, gear, arrangement."], ["The record", "Session provenance, so the night's work is yours and dated."], ["The archive", "Every past night at /night/YYYY-MM-DD, fully static."]].forEach((c, i) => {
      L.card(s, M + (i % 2) * (cw + 0.22), 4.1 + Math.floor(i / 2) * (ch + 0.2), cw, ch, { title: c[0], text: c[1], titleSize: 15, textSize: 10.5 });
    });
    L.ledger(s, 7.4, 1.95, 5.25, [
      ["Tonight", "muse.suedeai.ai"],
      ["Toolkit", "/toolkit · 12 tools"],
      ["Guitar tools", "/guitar-tools"],
      ["Articles", "/articles · 6 posts"],
      ["Docs and limitations", "/docs/limitations"],
      ["Pricing", "/pricing"],
    ], { header: "Site map", rowH: 0.52, size: 11.5, split: 0.45 });
  }

  // 4 A night
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "03 — A night with Muse", "Midnight deal. Flip. Talk. Make. Keep.", { w: 10 });
    L.flow(s, [
      ["Midnight", "The House Deck deals tonight's card to every musician at once."],
      ["Flip", "Read the constraint. Words, melody, rhythm or tone."],
      ["Talk", "Work it through with Muse: what it means, where to start, what to try."],
      ["Make", "Write the verse, find the change, chase the sound."],
      ["Keep", "The session is captured with provenance and tracked against your weakest dimension."],
    ], M, 2.2, W - 2 * M, { textH: 1.5, titleSize: 16, textSize: 11 });
    L.rule(s, M, 5.5, W - 2 * M);
    L.body(s, "No paywall mid-session. The card is never behind one at all.", M, 5.7, 10, 0.5, { size: 14, italic: true });
  }

  // 5 Honesty + platform
  {
    const s = L.slide(ctx);
    L.header(s, "04 — Built to be trusted", "Muse tells you where it fails.", { w: 10 });
    L.body(s, "The docs openly disclose the AI's failure modes at /docs/limitations, a real expertise-and-trust signal rather than a marketing page. Today's card is client-rendered, but every past night has a fully static, crawlable permalink, and the site allows every major AI crawler by name.", M, 1.95, 6.3, 1.9, { size: 13.5 });
    L.chips(s, ["SwiftUI · iOS 17", "Supabase", "Web + iOS", "Provenance per session"], M, 4.05, 6.3, { perRow: 2, h: 0.66, size: 12 });
    L.ledger(s, 7.4, 1.95, 5.25, [
      ["Web", "muse.suedeai.ai"],
      ["iOS app", "Suede Studio Muse · App Store"],
      ["Bundle", "ai.suede.muse"],
      ["Sibling apps", "Guitar Studio · Sing · AI Music"],
      ["Privacy", "muse.suedeai.ai/privacy"],
    ], { header: "Platform", rowH: 0.56, size: 12, split: 0.36 });
  }

  // 6 Pricing
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "05 — Pricing", "Free every night, or $4.99 a month.", { w: 10 });
    const cw = (W - 2 * M - 0.3) / 2;
    L.panel(s, M, 2.05, cw, 3.9);
    L.eyebrow(s, "Free", M + 0.3, 2.3, 4);
    L.title(s, "$0, every night", M + 0.3, 2.6, 5, 0.9, { size: 40 });
    L.bullets(s, ["Tonight's card, always", "Talk it through with Muse", "The archive of every past night"], M + 0.3, 3.65, cw - 0.6, 2.0, { size: 12.5, space: 7 });
    L.panel(s, M + cw + 0.3, 2.05, cw, 3.9, { fill: "26204A" });
    L.eyebrow(s, "Muse Pro · web", M + cw + 0.6, 2.3, 4);
    L.title(s, "$4.99 / month", M + cw + 0.6, 2.6, 5, 0.9, { size: 40 });
    L.bullets(s, ["Unlimited chats every night", "Session history across devices", "Priority response when the table is busy"], M + cw + 0.6, 3.65, cw - 0.6, 2.0, { size: 12.5, space: 7 });
    L.mono(s, "Billed monthly on the web. The iOS subscription is priced separately. An AI music companion under $10 a month.", M, 6.2, 12, 0.3, { size: 10, color: s.__m.accent });
  }

  L.closing(ctx, {
    eyebrow: "Tonight, at midnight",
    title: "Flip the card.",
    sub: "Same card for every musician on earth. See what you make of it.",
    url: "MUSE.SUEDEAI.AI",
    rows: [["Tonight's card", "muse.suedeai.ai"], ["iOS", "App Store · Suede Studio Muse"], ["Toolkit", "/toolkit"], ["Pricing", "/pricing"]],
  });

  await L.save(ctx, process.argv[2] || "out/suede-muse.pptx");
})();
