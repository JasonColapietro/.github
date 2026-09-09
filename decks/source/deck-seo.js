const L = require("./lib");
const { W, H, M } = L;

const T = L.theme({
  title: "Suede SEO — AI engineering & full-stack GEO",
  footer: "SUEDE SEO · SEO.SUEDEAI.AI · FULL-STACK GEO & AI ENGINEERING",
  darkBg: "seo-dark", lightBg: "seo-light",
  dark: { accent: "7C9BFF", accent2: "3DD6F0", panel: "182452", line: "34437F", ledger: "0B1236", ledgerLine: "2B3A75", ledgerAccent: "8FB0FF", muted: "C3CBEA" },
  light: { accent: "1F3FBF", accent2: "0EA5C6", text: "161A2B", muted: "4A526B", panel: "F4F6FC", line: "D6DCF0", ledger: "0F1A45", ledgerLine: "2B3A75", ledgerText: "E9EDFF", ledgerAccent: "8FB0FF" },
});

(async () => {
  const ctx = L.deck(T);

  // 1 Cover
  L.cover(ctx, {
    eyebrow: "seo.suedeai.ai · Forward deployed engineering · Full-stack GEO",
    title: "AI engineering, deployed inside your operation.",
    sub: "We build and run AI agents. We capture what ChatGPT, Perplexity, Gemini and Google say about you, repair the pages they read, pitch the press they quote, and date what we find.",
    url: "SEO.SUEDEAI.AI",
  });

  // 2 Problem
  {
    const s = L.slide(ctx, { mode: "light" });
    L.header(s, "01 — The problem", "Your customers now ask a machine first.", { w: 7.5, h: 1.3, size: 34 });
    L.body(s, "Founders, executives and marketing leaders arrive with the same finding: their company is absent or misrepresented in AI-generated answers. The pages the engines read are stale, the entity records disagree, and nobody dated what was said.", M, 2.4, 5.6, 1.6, { size: 14 });
    L.stat(s, "4", "answer engines shaping the buying decision: ChatGPT, Perplexity, Gemini and Google", M, 4.3, 2.4, { size: 48 });
    L.stat(s, "0", "dated records of what they said about you, in most companies we open a file on", M + 2.9, 4.3, 2.6, { size: 48 });
    L.ledger(s, 7.3, 2.1, 5.35, [
      ["Captured AI answer", "Gemini"],
      ["“Suede has established itself as the third pillar”", "quote"],
      ["Captured", "17 Feb 2026"],
      ["Status", "Review evidence →"],
    ], { header: "Evidence registry", rowH: 0.66, split: 0.68 });
    L.body(s, "What a dated capture looks like. The same discipline applies to every client category.", 7.3, 5.6, 5.3, 0.5, { size: 11, italic: true });
  }

  // 3 Six lines of work
  {
    const s = L.slide(ctx);
    L.header(s, "02 — The practice", "Six lines of work, one firm.");
    const items = [
      ["Full-stack GEO", "Capture what the engines answer about your category, dated and screenshotted, then repair the pages and entity records those answers are built from."],
      ["Press and reputation", "The founder story, the newsroom, the pitch and the outreach behind coverage. Every placement filed as an exhibit engines can quote back."],
      ["Entity records and search", "Knowledge panels, entity graphs, third-party records and the classic technical repair, kept consistent wherever a machine looks you up."],
      ["Managed AI agents", "Named agents built, run and kept tuned by Suede Labs AI: call review, lead qualification, script consistency, PR rebuilds. You watch the run, we hold the KPI."],
      ["AI operations", "Automation placed where it earns its place, inside written guardrails, with a human owner and one agreed number on each lane."],
      ["Forward deployed engineer", "An engineer inside your operation on a fixed clock. Triage first, sorting what is broken from what is merely loud, then redirection toward the work that pays."],
    ];
    const cw = (W - 2 * M - 0.5) / 3, ch = 2.3;
    items.forEach((it, i) => {
      const c = i % 3, r = Math.floor(i / 3);
      L.card(s, M + c * (cw + 0.25), 2.0 + r * (ch + 0.2), cw, ch, { n: String(i + 1).padStart(2, "0"), title: it[0], text: it[1], textSize: 11, titleSize: 16 });
    });
  }

  // 4 Method flow
  {
    const s = L.slide(ctx, { mode: "light" });
    L.header(s, "03 — Full-stack GEO, layer by layer", "Capture. Repair. Pitch. Date.", { w: 9 });
    L.body(s, "Generative engine optimization is not a keyword list. It is a chain of custody from what an engine says today to what it reads tomorrow.", M, 1.95, 8.5, 0.7, { size: 14 });
    L.flow(s, [
      ["Capture", "Screenshot and date what ChatGPT, Perplexity, Gemini and Google answer for the category and the brand."],
      ["Repair", "Fix the pages and entity records the answers are built from: schema, canonicals, crawler access, knowledge panels."],
      ["Pitch", "Put the founder and the record in front of the press the engines quote, so the citations exist."],
      ["Date", "Re-capture on a schedule. Every public claim links to a receipt a reader can open."],
    ], M, 3.0, W - 2 * M, { textH: 1.5 });
    L.rule(s, M, 5.75, W - 2 * M);
    L.mono(s, "Also live: optimize.suedeai.ai, the free crawler-access check for any site.", M, 5.95, 9, 0.3, { size: 10, color: s.__m.accent });
  }

  // 5 Operations half
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "04 — The other half of the practice", "AI agent management, watched live while the work runs.", { w: 10.5, h: 1.3 });
    L.body(s, "Clients watch it run in real time without having to adjust or touch anything. Their job is watching; Suede runs the rest. An operator's practice, not a licence: the call centers Jason built, ran and exited, and the sales scripts still in use across that industry, are encoded into the agents.", M, 2.35, 5.4, 2.2, { size: 13.5 });
    const cards = [
      ["Agents", "Managed AI agents", "Call review, lead qualification, script and rebuttal consistency, PR rebuilds. Visible step by step while a run happens."],
      ["Ops", "AI operations", "Digital operations mapped lane by lane, bottleneck fixes first. Guardrails, owners, trackable KPIs."],
      ["People", "Human amplification", "A platform of human marketers who read a client's content and carry it into the feeds their own audiences sit in."],
      ["FDE", "Forward deployed engineer", "Serious triage and redirection on a fixed clock. A ranked list of what to fix, and the fixes."],
    ];
    const cw = 3.05, ch = 2.05;
    cards.forEach((c, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      L.card(s, 6.5 + col * (cw + 0.22), 2.2 + row * (ch + 0.22), cw, ch, { tag: c[0], title: c[1], text: c[2], textSize: 10.5, titleSize: 15 });
    });
    L.mono(s, "The agents are built and run in Suede Agent Studio, where a client opens a flow and watches it execute.", M, 6.6, 12, 0.3, { size: 9.5, color: s.__m.accent2 });
  }

  // 6 The receipts
  {
    const s = L.slide(ctx, { mode: "light" });
    L.header(s, "05 — The receipts", "Every claim we publish opens a receipt.", { w: 9 });
    L.ledger(s, M, 2.05, 6.4, [
      ["USPTO provisional patent application", "63/947,120"],
      ["Pull requests merged across external repositories", "47 · 42 repos"],
      ["Jest · virtual mock module isolation fix", "#16296"],
      ["Adobe React Spectrum · useShowFocusIndicator hook", "#10426"],
      ["Backstage · catalog graph page configuration fix", "#35102"],
      ["Hardhat · chain descriptor cleanup", "#8522"],
    ], { header: "Public record · as of September 2026", rowH: 0.56, size: 11.5, split: 0.7 });
    L.body(s, "Each line opens the merged pull request, accepted by that project's own maintainers. The count includes 26 substantive code or documentation contributions and 21 accepted listings of Jason-owned work, plus one public Linux kernel USB/IP contribution.", M, 6.25, 6.4, 0.7, { size: 10.5, italic: true });
    L.eyebrow(s, "Speaking appearances", 7.6, 2.1, 5);
    const talks = [["The Brave Show", "5 September 2025 · Panel"], ["ChainGPT", "October 2025 · Round table"], ["Mario Nawfal", "September 2025 · AMA"], ["BTSE", "17 February 2025 · AMA"]];
    talks.forEach((t, i) => {
      const y = 2.5 + i * 0.86;
      L.rule(s, 7.6, y, 5.05);
      L.title(s, t[0], 7.6, y + 0.12, 3, 0.4, { size: 17 });
      L.mono(s, t[1], 10.0, y + 0.18, 2.65, 0.3, { size: 9.5, color: s.__m.muted, align: "right" });
    });
    L.body(s, "Hosts, topics and source links, including the recorded Suede SocialFi Space, live on the press page.", 7.6, 6.05, 5.05, 0.6, { size: 10.5, italic: true });
  }

  // 7 Partnerships
  {
    const s = L.slide(ctx);
    L.header(s, "06 — The company the record keeps", "Partnerships on the Suede Labs record.", { w: 10 });
    L.body(s, "Read the partnership record and supporting captures on the receipts page. Each name below is on the record, not on a wish list.", M, 1.95, 8.5, 0.7, { size: 14 });
    L.chips(s, ["Google Cloud", "Stripe", "Base", "Chainlink", "ChainGPT", "LayerZero", "Virtuals", "AgentCash", "Mario Nawfal", "Brave Browser"], M, 3.0, W - 2 * M, { perRow: 5, h: 0.9, size: 15 });
    L.rule(s, M, 5.35, W - 2 * M);
    L.stat(s, "5.0", "rated by AI Agents Directory, from 9 reviews", M, 5.45, 3, { size: 40, bigH: 0.75, labelSize: 11 });
    L.stat(s, "#1", "Overall Music Platform, AI Agents Directory", M + 3.4, 5.45, 3.2, { size: 40, bigH: 0.75, labelSize: 11 });
    L.stat(s, "8", "iOS apps live on the App Store", M + 7.0, 5.45, 3, { size: 40, bigH: 0.75, labelSize: 11 });
  }

  // 8 Engagement model
  {
    const s = L.slide(ctx, { mode: "light" });
    L.header(s, "07 — How an engagement runs", "Retainer for the visibility work. A fixed clock for the engineering.", { w: 11, h: 1.3 });
    const cols = [
      ["Full-stack GEO", "Retainer", ["Dated captures across four engines", "Page and entity-record repair", "Press pitch and newsroom", "Monthly re-capture and receipts"]],
      ["Managed agents & AI operations", "Retainer", ["Named agents, built and run by Suede", "One agreed KPI per lane", "Written guardrails and a human owner", "Watch the run in Agent Studio"]],
      ["Forward deployed engineer", "Fixed clock", ["Triage: broken vs merely loud", "A ranked list of what to fix", "The fixes, shipped", "Consulting is the entry motion only"]],
    ];
    const cw = (W - 2 * M - 0.5) / 3;
    cols.forEach((c, i) => {
      const x = M + i * (cw + 0.25);
      L.panel(s, x, 2.45, cw, 3.7);
      L.eyebrow(s, c[1], x + 0.3, 2.7, cw - 0.6);
      L.title(s, c[0], x + 0.3, 3.0, cw - 0.6, 0.8, { size: 19 });
      L.bullets(s, c[2], x + 0.3, 3.9, cw - 0.6, 2.1, { size: 12 });
    });
    L.mono(s, "Each engagement is scoped and priced in a reply. No public price ladder, no guarantees we cannot date.", M, 6.4, 11, 0.3, { size: 10, color: s.__m.accent });
  }

  // 9 Who it's for + the book
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "08 — Who opens a file", "Built for the people who just found out what ChatGPT says about them.", { w: 10.5, h: 1.3 });
    L.bullets(s, [
      "Founders and executives whose category is answered without them",
      "Marketing leaders who need evidence before an engagement, not a pitch",
      "Sales-led operations that want agents run for them, with one number per lane",
      "Teams that need a serious engineer inside the operation for a few weeks",
    ], M, 2.45, 6.2, 2.4, { size: 13.5 });
    L.rule(s, M, 5.0, 6.2);
    L.title(s, "The Screenshot", M, 5.15, 4, 0.45, { size: 20 });
    L.body(s, "The book behind the practice, read free on the site: why the engines say what they say, and the page that owns the exact question “why does ChatGPT recommend your competitors?”", M, 5.6, 6.2, 1.0, { size: 12 });
    L.ledger(s, 7.4, 2.4, 5.25, [
      ["seo.suedeai.ai/full-stack-geo", "practice"],
      ["seo.suedeai.ai/ai-operations", "umbrella"],
      ["seo.suedeai.ai/managed-ai-agents", "lane"],
      ["seo.suedeai.ai/forward-deployed-engineer", "offer"],
      ["seo.suedeai.ai/evidence", "receipts"],
      ["seo.suedeai.ai/book", "the book"],
    ], { header: "Page map", rowH: 0.55, size: 11, split: 0.75 });
  }

  // 10 Close
  L.closing(ctx, {
    eyebrow: "Direct line",
    title: "Open a file.",
    sub: "Name, email, site. Enough for Jason to look at your category. He reads these himself and answers by email.",
    url: "SEO.SUEDEAI.AI · REQUEST A SCOPE",
    rows: [["Email", "info@suedeai.ai"], ["Scope form", "seo.suedeai.ai"], ["Evidence", "/evidence"], ["Founder", "x.com/johnnysuede"]],
  });

  await L.save(ctx, process.argv[2] || "out/suede-seo.pptx");
})();
