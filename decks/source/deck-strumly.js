const L = require("./lib");
const { W, H, M } = L;

const T = L.theme({
  title: "Strumly — your 24/7 guitar coach",
  footer: "STRUMLY · STRUMLY.SUEDEAI.AI · THE GUITAR COACH THAT REMEMBERS YOUR LAST SESSION",
  darkBg: "strumly-dark", darkBg2: "strumly-dark2",
  dark: { accent: "F1C75B", accent2: "E88B65", panel: "1C1512", line: "3A2D25", ledger: "0E0A08", ledgerLine: "33271F", ledgerAccent: "F1C75B", muted: "D2C6B8", onAccent: "1A1208" },
});

(async () => {
  const ctx = L.deck(T);

  L.cover(ctx, {
    eyebrow: "strumly.suedeai.ai · AI guitar coach · Signal-chain guides · Music API",
    title: "The guitar coach that remembers your last session.",
    sub: "Real-time chord feedback, practice drills and ear training, 24/7. Free during early access. Pro at $19.99 a month for full practice history.",
    url: "STRUMLY.SUEDEAI.AI",
  });

  // 2 Problem
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "01 — The problem", "Practice without feedback is just repetition.", { w: 10 });
    const cw = (W - 2 * M - 0.5) / 3;
    [["No one is listening", "You play the chord. Nobody tells you the B string was muted or the change came in late. YouTube cannot hear you."],
     ["Every lesson forgets you", "Apps reset to the same beginner path. A teacher remembers where you left off. Software never did, until now."],
     ["The tone knowledge is scattered", "Pickups, cables, amps and speakers explained across forums, videos and half a book. The signal chain deserves one place."]].forEach((c, i) => {
      L.card(s, M + i * (cw + 0.25), 2.0, cw, 2.7, { n: String(i + 1).padStart(2, "0"), title: c[0], text: c[1], textSize: 12 });
    });
    L.body(s, "Strumly is the coach, the toolkit, the book and the guides in one app, built by a guitarist who spent two decades chasing tone before building rights infrastructure.", M, 5.0, 11.5, 0.9, { size: 13.5, italic: true });
  }

  // 3 What it is
  {
    const s = L.slide(ctx);
    L.header(s, "02 — What it is", "Coach, toolkit, book, guides, API. One app.", { w: 11.5, h: 1.3 });
    const cw = 2.95, ch = 1.75;
    [["Coach", "AI guitar coach", "Real-time chord feedback, practice drills and ear training. It remembers your last session and picks up from there."],
     ["Toolkit", "Free toolkit", "Tuner, chord and scale references, timing tools. Free, in the browser."],
     ["Book", "The Signal Chain", "The full history of guitar amplifiers, effects and the pursuit of electric tone. 66 chapters, 111 lessons."],
     ["Guides", "20 guides", "Tone, signal chain and rights, including the eight migrated signal-chain guides at /guides."]].forEach((c, i) => {
      L.card(s, M + (i % 2) * (cw + 0.22), 2.45 + Math.floor(i / 2) * (ch + 0.2), cw, ch, { tag: c[0], title: c[1], text: c[2], titleSize: 15, textSize: 10.5 });
    });
    L.ledger(s, 7.3, 2.45, 5.35, [
      ["Coach", "/path · the practice path"],
      ["Guides", "/guides"],
      ["Book", "guitar.solutions"],
      ["Agents", "/agents · /developers"],
      ["API contract", "/openapi.json"],
      ["Pricing", "/pricing"],
    ], { header: "Site map", rowH: 0.52, size: 11.5, split: 0.36 });
  }

  // 4 Session flow
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "03 — A session", "Play. Get feedback. Drill. Come back.", { w: 11.5, h: 1.3 });
    L.flow(s, [
      ["Play", "Pick a chord, a change or a riff. The coach listens in real time through the browser."],
      ["Feedback", "Which strings rang, which were muted, whether the change landed on time."],
      ["Drill", "A practice drill built for the weakness it just heard, plus ear training."],
      ["Remember", "The session is saved. Next time, the coach starts where you left off."],
    ], M, 2.6, W - 2 * M, { textH: 1.4 });
    L.rule(s, M, 5.55, W - 2 * M);
    L.mono(s, "Pro keeps the full practice history across sessions. Free keeps the coach.", M, 5.75, 10, 0.3, { size: 10, color: s.__m.accent });
  }

  // 5 Guitar estate
  {
    const s = L.slide(ctx);
    L.header(s, "04 — Where Strumly sits", "Five hosts, three properties, one owner per job.", { w: 11 });
    L.ledger(s, M, 2.0, 7.2, [
      ["strumly.suedeai.ai", "coach · toolkit · book · guides · agent API"],
      ["guitar.solutions", "the book's front door, inside Strumly"],
      ["guitarhub.org", "beginner lessons, curriculum, practice planning"],
      ["guitarchords.info", "chord library, scales, tuner"],
      ["guitar.services", "index of Jason's guitar work"],
    ], { header: "Ownership map · September 2026", rowH: 0.58, size: 12, split: 0.4 });
    L.body(s, "Strumly's practice path is the path with the AI coach. Its beginner and routine guides hand readers to GuitarHub for lessons and a schedule, and GuitarHub sends players back for the coach. No two properties chase the same query.", 8.2, 2.05, 4.45, 2.4, { size: 12.5 });
    L.body(s, "The eight guides that lived at guides.guitar.solutions now resolve to Strumly with slug-preserving redirects.", 8.2, 4.6, 4.45, 1.0, { size: 11.5, italic: true });
  }

  // 6 The book + Suede DNA
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "05 — The Signal Chain", "Pickups, cables, amp, speaker. And then the royalty.", { w: 11 });
    L.body(s, "The complete edition of The Signal Chain lives at guitar.solutions: the full history of guitar amplifiers, effects and the pursuit of electric tone, with a music IP rights chapter no other guitar book includes. Standard, Deluxe and Workbook editions.", M, 2.0, 6.3, 1.7, { size: 13.5 });
    L.stat(s, "66", "chapters", M, 3.9, 1.6, { size: 46, bigH: 0.8 });
    L.stat(s, "111", "lessons", M + 1.9, 3.9, 1.6, { size: 46, bigH: 0.8 });
    L.stat(s, "409", "rigs archived at Suede DNA, from 390 artists", M + 3.8, 3.9, 2.5, { size: 46, bigH: 0.8 });
    L.ledger(s, 7.4, 2.0, 5.25, [
      ["Signal chain topology", "guide"],
      ["Gain and dynamics", "guide"],
      ["Electronics", "guide"],
      ["Power", "guide"],
      ["Rights: owning your own music", "guide"],
    ], { header: "Guide categories", rowH: 0.52, size: 11.5, split: 0.7 });
    L.mono(s, "\"The signal chain doesn't end at the speaker. It ends when the royalty clears.\"", M, 5.7, 12, 0.5, { size: 10.5, color: s.__m.accent });
  }

  // 7 For agents
  {
    const s = L.slide(ctx);
    L.header(s, "06 — For agents and developers", "A pay-per-call music API, in USDC or by card.", { w: 11 });
    L.body(s, "Strumly exposes its music tools to autonomous agents through x402 and Stripe. An agent reads the OpenAPI contract, pays per call, and gets the result; a developer does the same with a card. The endpoints are listed alongside the Suede music and video API in the awesome-x402 repository.", M, 2.0, 6.4, 1.9, { size: 13.5 });
    L.chips(s, ["x402 · USDC on Base", "Stripe · card", "OpenAPI contract", "MCP-ready"], M, 4.1, 6.4, { perRow: 2, h: 0.68, size: 12.5 });
    L.ledger(s, 7.5, 2.0, 5.15, [
      ["/agents", "what an agent can buy"],
      ["/developers", "integration guide"],
      ["/openapi.json", "typed contract"],
      ["Settlement", "per call · no account"],
    ], { header: "Developer surface", rowH: 0.58, size: 12, split: 0.42 });
  }

  // 8 Pricing
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "07 — Pricing", "Free in early access. Pro for the history.", { w: 11 });
    const cw = (W - 2 * M - 0.3) / 2;
    L.panel(s, M, 2.05, cw, 3.9);
    L.eyebrow(s, "Free · early access", M + 0.3, 2.3, 4);
    L.title(s, "$0", M + 0.3, 2.6, 3, 0.9, { size: 44 });
    L.bullets(s, ["The AI coach with real-time chord feedback", "Practice drills and ear training", "The free toolkit", "All twenty guides"], M + 0.3, 3.65, cw - 0.6, 2.1, { size: 12.5, space: 7 });
    L.panel(s, M + cw + 0.3, 2.05, cw, 3.9, { fill: "24170F" });
    L.eyebrow(s, "Pro", M + cw + 0.6, 2.3, 4);
    L.title(s, "$19.99 / month", M + cw + 0.6, 2.6, 5, 0.9, { size: 44 });
    L.bullets(s, ["Full practice history across sessions", "The coach that remembers everything you played", "Everything in Free"], M + cw + 0.6, 3.65, cw - 0.6, 2.1, { size: 12.5, space: 7 });
    L.mono(s, "The Signal Chain complete edition is sold separately at guitar.solutions.", M, 6.2, 10, 0.3, { size: 10, color: s.__m.accent });
  }

  L.closing(ctx, {
    eyebrow: "Pick up where you left off",
    title: "Play something. The coach is listening.",
    sub: "Open Strumly in the browser, play a chord, and get the first piece of feedback in under a minute.",
    url: "STRUMLY.SUEDEAI.AI",
    rows: [["Coach", "strumly.suedeai.ai/path"], ["Guides", "/guides"], ["The book", "guitar.solutions"], ["Agents", "/agents"]],
  });

  await L.save(ctx, process.argv[2] || "out/strumly.pptx");
})();
