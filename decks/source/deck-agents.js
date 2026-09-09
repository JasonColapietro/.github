const L = require("./lib");
const { W, H, M } = L;

const T = L.theme({
  title: "Suede Agent Studio — Build agents that can earn while you sleep",
  footer: "SUEDE AGENT STUDIO · AGENTS.SUEDEAI.AI · BUILD, VERSION, LAUNCH, GET PAID",
  darkBg: "agents-dark", lightBg: "agents-light",
  dark: { accent: "A5B4FC", accent2: "34D399", panel: "221E4E", line: "3F3A7A", ledger: "0F0C2E", ledgerLine: "35307A", ledgerAccent: "A5B4FC", muted: "C9C8E6" },
  light: { accent: "4F46E5", accent2: "059669", text: "0F1222", muted: "4B4F63", panel: "F5F6FA", line: "DCDDE8", ledger: "15123A", ledgerLine: "35307A", ledgerText: "ECEBFF", ledgerAccent: "A5B4FC" },
});

(async () => {
  const ctx = L.deck(T);

  L.cover(ctx, {
    eyebrow: "agents.suedeai.ai · Visual agent builder · x402 launch path",
    title: "Build agents that can earn while you sleep.",
    sub: "Wire an AI agent on a canvas, publish it as a URL, and get paid in USDC every time someone calls it. Free to build. Free to test. Payments switch on when you say so.",
    url: "AGENTS.SUEDEAI.AI",
  });

  // 2 Problem
  {
    const s = L.slide(ctx, { mode: "light" });
    L.header(s, "01 — The problem", "Agents are easy to demo and hard to sell.", { w: 9 });
    L.body(s, "Every builder can wire a prompt to a tool. Almost nobody can turn that flow into something another person, or another agent, can find, trust, call and pay for without an account, a contract and a sales call.", M, 2.0, 7.2, 1.2, { size: 14 });
    const cw = (W - 2 * M - 0.5) / 3;
    [["No packaging", "A working flow is not a product. It has no versioned checkpoints, no typed contract, no public page, no receipt."],
     ["No payment rail", "Card checkout assumes a human with a wallet of their own. Agents buying from agents need per-call settlement with no signup."],
     ["No discipline", "Drafts get deployed by accident, paid models run during tests, and nobody can say which version answered a call."]].forEach((c, i) => {
      L.card(s, M + i * (cw + 0.25), 3.45, cw, 2.5, { n: String(i + 1).padStart(2, "0"), title: c[0], text: c[1], textSize: 12 });
    });
    L.mono(s, "Every rule in Suede Agent Studio exists to close one of these three gaps.", M, 6.25, 10, 0.3, { size: 10, color: s.__m.accent });
  }

  // 3 What it is
  {
    const s = L.slide(ctx);
    L.header(s, "02 — What it is", "An agent builder with a launch path that pays.", { w: 11, h: 1.3 });
    L.body(s, "A visual, node-graph builder for any business workflow. Wire specialized agents on a canvas, package them with the Suede SDK and modern agent rails, and launch eligible flows through the pay-per-call x402 path. Music and IP rails are one built-in vertical; most of the catalog is ordinary business work.", M, 2.4, 6.0, 2.0, { size: 13.5 });
    L.ledger(s, M, 4.55, 6.0, [
      ["Guided", "step-by-step creation"],
      ["Studio", "the node-graph canvas"],
      ["Code", "the same flow as code"],
    ], { header: "One flow, three views", rowH: 0.52, size: 12, split: 0.4 });
    const cards = [
      ["Canvas", "Wire on a canvas", "Gumloop-style node graph. Inputs, LLM steps, tools, gates, outputs. Predictable state and immutable checkpoints."],
      ["Rails", "Package with the rails", "Suede SDK, x402, ACP, A2A and on-chain identity, so the flow can be discovered and called by other agents."],
      ["Launch", "Launch a public URL", "A launched agent gets a public page and a typed endpoint. Eligible flows become sellable to other agents in USDC."],
      ["Foundry", "Publish a Resource Pack", "Resource Foundry turns owner-selected material into a reviewed, immutable pack for one narrow, typed job."],
    ];
    const cw = 2.95, ch = 2.15;
    cards.forEach((c, i) => {
      L.card(s, 7.0 + (i % 2) * (cw + 0.22), 2.4 + Math.floor(i / 2) * (ch + 0.22), cw, ch, { tag: c[0], title: c[1], text: c[2], textSize: 10.5, titleSize: 15 });
    });
  }

  // 4 How it works
  {
    const s = L.slide(ctx, { mode: "light" });
    L.header(s, "03 — How it works", "Wire. Test. Version. Launch. Get paid.", { w: 10 });
    L.flow(s, [
      ["Wire", "Start from a template or a blank canvas. Guided, Studio and Code edit the same flow row."],
      ["Test", "Run scoped, ephemeral tests with no spend. Dry-run x402 by default; no USDC leaves the ledger."],
      ["Version", "Save immutable checkpoints. Restore or promote a version. Saves never deploy or settle funds."],
      ["Launch", "Publish to a public page at /a/<slug> with a typed contract, OpenAPI, MCP and A2A surfaces."],
      ["Get paid", "Switch on per-call USDC pricing through x402. Agents pay at the moment of use, no account required."],
    ], M, 2.35, W - 2 * M, { textH: 1.6, titleSize: 16, textSize: 11 });
    L.rule(s, M, 5.55, W - 2 * M);
    L.mono(s, "npm run dev · /build/new · /build/new?template=lead-qualifier · /a/<slug> · /resources", M, 5.75, 11, 0.3, { size: 10, color: s.__m.accent });
    L.body(s, "The durable runtime is replay-safe. Card top-ups run through Stripe Checkout with signed webhooks and a real ledger credit before any spend.", M, 6.1, 11, 0.5, { size: 11.5, italic: true });
  }

  // 5 Templates + pricing chart
  {
    const s = L.slide(ctx);
    L.header(s, "04 — The catalog", "Every template is a tiny business.", { w: 10.5 });
    const names = ["Lead Qualifier", "Contract Red-Flag Scan", "Invoice Chaser", "Review Responder", "Site Monitor", "Deep Research Agent", "Market Competitor Scanner", "Meeting Prep Brief", "Refund Decision Desk", "Resume vs JD Screener", "PR Diff Digest", "Release Machine"];
    L.chips(s, names, M, 2.05, 7.3, { perRow: 3, h: 0.56, size: 11 });
    L.body(s, "Contract review, lead scoring, invoice chasing, support triage, research digests, engineering hygiene. Music and IP templates such as Release Machine, A&R Analyst and Song Register & Royalty sit alongside as one vertical.", M, 5.15, 7.3, 0.9, { size: 11.5 });
    s.addChart(ctx.pres.ChartType.bar, [{ name: "Price per call (USD)", labels: ["Site Monitor", "Review Responder", "Lead Qualifier", "Invoice Chaser", "Research Agent", "Contract Scan"], values: [0.002, 0.004, 0.005, 0.008, 0.010, 0.012] }], {
      x: 8.3, y: 2.0, w: 4.4, h: 4.1, barDir: "bar", chartColors: ["A5B4FC"], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "$0.000", dataLabelColor: "ECEBFF", dataLabelFontSize: 9,
      catAxisLabelColor: "C9C8E6", catAxisLabelFontSize: 9.5, valAxisLabelColor: "8E8CB8", valAxisLabelFontSize: 8, valGridLine: { color: "3F3A7A", size: 0.5 }, catGridLine: { style: "none" }, showLegend: false,
      showTitle: true, title: "Example per-call prices in the catalog", titleColor: "ECEBFF", titleFontSize: 11, valAxisMaxVal: 0.016, valAxisLineShow: false, catAxisLineShow: false, plotArea: { fill: { color: "15123A" } }, chartArea: { fill: { color: "15123A" }, roundedCorners: true },
    });
    L.mono(s, "Lead pricing also exists per unit: $0.05 / lead on the lead-qualifier rail.", M, 6.2, 7.3, 0.3, { size: 9.5, color: s.__m.accent2 });
  }

  // 6 Rails
  {
    const s = L.slide(ctx, { mode: "light" });
    L.header(s, "05 — The rails", "Standing on the rails agents already use.", { w: 10 });
    const cw = (W - 2 * M - 0.75) / 4;
    [["x402", "Pay-per-call", "HTTP-native payments. An agent hits the endpoint, pays USDC on Base, gets the result. No account, no invoice."],
     ["ACP", "Virtuals commerce", "Agent Commerce Protocol. Producer by Suede Labs is a hireable ACP agent for music, video and ACP/x402 consulting."],
     ["A2A · MCP", "Interop surfaces", "Launched agents expose A2A, MCP, OpenAPI and catalog projections from the same immutable live release."],
     ["ERC-8004", "On-chain identity", "Identity, reputation and validation contracts on Base mainnet. 23 on-chain agent identities registered."]].forEach((c, i) => {
      L.card(s, M + i * (cw + 0.25), 2.05, cw, 2.7, { tag: c[0], title: c[1], text: c[2], textSize: 11, titleSize: 16 });
    });
    L.chips(s, ["Base", "Stripe", "Virtuals", "AgentCash", "Vercel AI SDK", "Supabase"], M, 5.05, W - 2 * M, { perRow: 6, h: 0.62, size: 12 });
    L.body(s, "Stack: Next.js 15, React 19, TypeScript strict, @xyflow/react canvas, viem on Base, zod contracts, SQLite or Supabase.", M, 5.95, 11, 0.4, { size: 11, italic: true });
  }

  // 7 Resource Foundry
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "06 — Resource Foundry", "A pack other agents pay to query.", { w: 11 });
    L.body(s, "Owners start with manual text, JSON rows or a bounded public site import. They define the typed schema, taxonomy, filters, return fields and a Job Contract, test the exact pack, and publish it through the same agent, API, MCP, A2A, OpenAPI, catalog and x402 rails.", M, 2.0, 6.4, 1.7, { size: 13.5 });
    L.flow(s, [
      ["Select", "Owner-chosen material only. No raw dumps."],
      ["Type", "Schema, taxonomy, filters, return fields, Job Contract."],
      ["Review", "Approve without supplying provenance; test the exact pack."],
      ["Publish", "One immutable active Live release feeds every projection."],
    ], M, 3.95, 6.4, { textH: 1.2, titleSize: 15, textSize: 10.5 });
    L.ledger(s, 7.5, 2.0, 5.15, [
      ["Raw sources", "never public"],
      ["Private records, credentials", "never public"],
      ["Private examples, provenance notes", "never public"],
      ["Public projections", "Live release only"],
      ["Relay registration before payment", "refused"],
    ], { header: "Privacy boundary", rowH: 0.56, size: 11.5, split: 0.66 });
  }

  // 8 Trust rules
  {
    const s = L.slide(ctx, { mode: "light" });
    L.header(s, "07 — The rules that keep it safe", "Nothing spends or deploys unless you say so.", { w: 11 });
    L.bullets(s, [
      "Version saves never deploy, launch, run paid models, settle funds or call providers.",
      "x402 runs in dry-run by default; no USDC is spent until payments are switched on.",
      "Scoped tests are ephemeral and no-spend. Durable execution never defaults to the studio database.",
      "Credential-stripped typed data: secrets never travel with a flow export.",
      "Live Stripe keys are refused by the payment verification gate; only test keys run end to end.",
      "Mobile keeps Guided as the creation surface and version history read-only.",
    ], M, 2.05, 6.6, 4.0, { size: 13, space: 8 });
    L.ledger(s, 7.6, 2.05, 5.05, [
      ["verify:phase2a", "canonical nodes"],
      ["verify:phase2c", "credential-stripped data"],
      ["verify:phase2e", "no-spend scoped tests"],
      ["verify:phase3a", "replay-safe runtime"],
      ["verify:card-payment", "checkout to ledger"],
    ], { header: "Release gates in the repo", rowH: 0.56, size: 11.5, split: 0.5 });
    L.body(s, "Each gate boots its own server on a throwaway database. The money-into-the-ledger half runs for real with local HMAC-signed webhooks.", 7.6, 5.55, 5.05, 0.8, { size: 11, italic: true });
  }

  // 9 Proof
  {
    const s = L.slide(ctx);
    L.header(s, "08 — On the record", "Shipped, listed and live on Base mainnet.", { w: 10 });
    L.stat(s, "22", "x402 paid endpoints across the Suede estate", M, 2.1, 2.7, { size: 52 });
    L.stat(s, "3", "ERC-8004 contracts on Base mainnet", M + 3.0, 2.1, 2.7, { size: 52 });
    L.stat(s, "23", "on-chain agent identities registered", M + 6.0, 2.1, 2.7, { size: 52 });
    L.stat(s, "155", "URLs in the public sitemap, including template pages", M + 9.0, 2.1, 2.9, { size: 52 });
    L.rule(s, M, 4.15, W - 2 * M);
    L.ledger(s, M, 4.35, 6.0, [
      ["awesome-x402 · curated listing", "Agent Studio + music API"],
      ["Producer by Suede Labs · Virtuals ACP agent", "hireable"],
      ["Suede Agent Studio · iOS", "App Store"],
      ["Agentix · mobile companion", "App Store"],
    ], { header: "Listings and surfaces", rowH: 0.46, size: 11, split: 0.62 });
    L.body(s, "The estate's own AI-operations practice runs its client agents here: seo.suedeai.ai links to Agent Studio as the place a client opens a flow and watches it execute. The builder is not a demo of the firm; it is the firm's tooling.", 7.0, 4.4, 5.65, 1.9, { size: 12.5 });
  }

  L.closing(ctx, {
    eyebrow: "Start building",
    title: "Free to build. Free to test.",
    sub: "Open the canvas, start from a template, and switch on payments when the agent is ready to earn.",
    url: "AGENTS.SUEDEAI.AI/BUILD/NEW",
    rows: [["Builder", "/build/new"], ["Templates", "/templates"], ["Directory", "/agents"], ["Docs", "/docs"], ["Contact", "/contact"]],
  });

  await L.save(ctx, process.argv[2] || "out/suede-agent-studio.pptx");
})();
