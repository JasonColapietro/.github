const L = require("./lib");
const { W, H, M } = L;

const T = L.theme({
  title: "Suede Labs AI — Creator ownership infrastructure for the AI media era",
  footer: "SUEDE LABS AI · SUEDEAI.AI · APP.SUEDEAI.AI · CREATOR OWNERSHIP INFRASTRUCTURE",
  darkBg: "flag-dark", darkBg2: "flag-dark2",
  dark: { accent: "FF5A63", accent2: "22D3EE", panel: "151722", line: "2E3140", ledger: "0A0B12", ledgerLine: "262838", ledgerAccent: "F5D69A", muted: "BFC2CF" },
});

(async () => {
  const ctx = L.deck(T);

  L.cover(ctx, {
    eyebrow: "suedeai.ai · app.suedeai.ai · Proof of creation for music, media and likeness",
    title: "Your work. Your likeness. On the record.",
    sub: "Creator ownership infrastructure for the AI media era: proof of creation, programmable IP, rights metadata, royalty routing and agent commerce. Live on Base mainnet.",
    url: "SUEDEAI.AI",
  });

  // 2 Thesis
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "01 — Thesis", "The next internet: agentic, creative, owned.", { w: 11 });
    L.body(s, "AI systems will create, remix and transact at scale. Without new infrastructure, value is extracted, rights are opaque, and creators are disconnected from the upside. Suede Labs builds the ownership layer: verifiable authorship, machine-readable licenses, rights-aware payments, and distribution paths that route value back to the people who create.", M, 2.0, 6.4, 2.4, { size: 13.5 });
    const cw = 1.6;
    [["Supply shock", "AI-media volume", "Generated media is exploding across every format. Provenance cannot keep up by hand."],
     ["New buyers", "Agent commerce", "Autonomous agents now pay per call for content and APIs. They need machine-readable rights."],
     ["New rails", "On-chain standards", "ERC-8004 identity, reputation and validation mature into a usable ownership substrate."]].forEach((c, i) => {
      L.card(s, 7.5 + 0, 2.0 + i * 1.5, 5.15, 1.35, { tag: c[0], title: c[1], text: c[2], titleSize: 15, textSize: 10.5 });
    });
    L.mono(s, "Three curves converging in 2026.", M, 4.7, 6, 0.3, { size: 10, color: s.__m.accent, cs: 2 });
    L.body(s, "The question is not whether another tool can generate media. It is who owns the rails when that media has to be proven, licensed and paid out.", M, 5.05, 6.4, 1.2, { size: 13, italic: true });
  }

  // 3 Ownership spine
  {
    const s = L.slide(ctx);
    L.header(s, "02 — The model", "Four stages. One ownership spine.", { w: 10 });
    L.flow(s, [
      ["Create", "AI lowers the cost of making media of every kind. Suede Create for music and video; Studio Music keeps the master."],
      ["Prove", "Authorship, voice, likeness, consent and rights travel with the work. The Suede IP Registry on Base and Avalanche."],
      ["Launch", "Routes to funding, audience and ownership participation. Distro to 100+ DSPs; vaults and the launchpad."],
      ["Earn", "Payments, vaults, royalties, licensing and agent commerce turn output into income, in USDC, at the moment of use."],
    ], M, 2.2, W - 2 * M, { textH: 1.7 });
    L.rule(s, M, 5.6, W - 2 * M);
    L.body(s, "Everything downstream settles against the proof layer, and that layer is Suede.", M, 5.8, 11, 0.5, { size: 14, italic: true });
  }

  // 4 Product
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "03 — Product", "Shipped. Not slideware.", { w: 8 });
    L.body(s, "A working product surface at app.suedeai.ai: rights passports, licensing, royalty vaults, an on-chain swap, Suede Create for music and video, and rewards for holding SUEDE. Alongside it, the iOS line: eight apps live on the App Store.", M, 1.95, 6.3, 1.6, { size: 13.5 });
    const cw = 3.05, ch = 1.3;
    [["Rights passports", "Registry-backed proof of creation attached to every file."], ["Licensing", "Commercial and custom licences, machine-readable, priced in USDC."], ["Royalty vaults", "Artist vaults and participation; settlement routes to contributors."], ["Suede Create", "Generate music and video, refine, and save finished work with ownership metadata."]].forEach((c, i) => {
      L.card(s, M + (i % 2) * (cw + 0.22), 3.75 + Math.floor(i / 2) * (ch + 0.2), cw, ch, { title: c[0], text: c[1], titleSize: 15, textSize: 10.5 });
    });
    L.ledger(s, 7.5, 1.95, 5.15, [
      ["Work", "Night Circuit"],
      ["Proof of creation", "sd_9f3a1c"],
      ["Commercial license", "lic_96e2"],
      ["Payment", "$250.00 USDC"],
      ["Creator route", "$212.50"],
      ["Chain", "Base mainnet"],
    ], { header: "Rights passport · illustrative example", rowH: 0.55, size: 12, split: 0.5 });
    L.body(s, "Own · License · Settle. An on-chain verification workflow, end to end.", 7.5, 5.85, 5.15, 0.5, { size: 11.5, italic: true });
  }

  // 5 Agent commerce
  {
    const s = L.slide(ctx);
    L.header(s, "04 — Agent commerce", "The rail agents transact through for IP.", { w: 10 });
    L.body(s, "Machine-readable proof of creation and on-chain royalty routing, so autonomous agents can discover, license and pay for creative work. One install, and an agent pays for owned work over x402.", M, 1.95, 6.3, 1.3, { size: 13.5 });
    L.ledger(s, M, 3.4, 6.3, [
      ["$ pip install suede-ai", "SDK"],
      ["suede find --type music --query \"cinematic hook\"", "3 results"],
      ["suede license sd_d81e --use commercial --term 3y", "license created"],
      ["suede pay --license", "settled · USDC"],
    ], { header: "Suede console", rowH: 0.56, size: 11, split: 0.68, textColor: "22D3EE" });
    L.stat(s, "$0.50", "music-gen · per call", 7.5, 2.0, 1.7, { size: 34, bigH: 0.7, labelSize: 10.5 });
    L.stat(s, "$4.99", "video-gen · per call", 9.35, 2.0, 1.7, { size: 34, bigH: 0.7, labelSize: 10.5 });
    L.stat(s, "$0.15", "image-gen · per call", 11.2, 2.0, 1.5, { size: 34, bigH: 0.7, labelSize: 10.5 });
    L.rule(s, 7.5, 3.55, 5.15);
    L.bullets(s, ["Discover work with verifiable provenance", "Negotiate terms and licenses programmatically", "Execute transactions and settle payments", "Deliver assets and track usage", "Distribute value to contributors"], 7.5, 3.75, 5.15, 2.6, { size: 12.5, space: 6 });
    L.mono(s, "app.suedeai.ai/.well-known/x402.json", 7.5, 6.3, 5, 0.3, { size: 9.5, color: s.__m.accent2 });
  }

  // 6 Ecosystem
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "05 — Ecosystem", "What we've shipped.", { w: 8 });
    L.ledger(s, M, 1.95, 6.1, [
      ["suedeai.ai", "creator ownership home"],
      ["app.suedeai.ai", "platform · USDC payments"],
      ["ip.suedeai.ai", "IP registry · Base + Avalanche"],
      ["agents.suedeai.ai", "agent studio · x402 publishing"],
      ["distro.suedeai.ai", "distribution · 100+ DSPs"],
      ["seo.suedeai.ai", "GEO and AI operations practice"],
      ["hub.suedeai.ai", "ecosystem directory"],
    ], { header: "$ suede map · platform", rowH: 0.48, size: 11, split: 0.42 });
    L.ledger(s, 7.1, 1.95, 5.55, [
      ["AI Music & Video Generator", "App Store"],
      ["Suede Guitar Tuner & Studio", "App Store"],
      ["Suede Voice: Vocal Range Test", "App Store"],
      ["Suede Studio Muse", "App Store"],
      ["Suede Agent Studio · Agentix", "App Store"],
      ["Suede Social · FretPulse", "App Store"],
      ["SUEDE token · 1B supply", "Solana + Base"],
    ], { header: "Apps and protocol", rowH: 0.48, size: 11, split: 0.6 });
    L.body(s, "Plus community and publishing: suede.social and The Suede 100, Suede DNA with 409 rigs from 390 artists, Suede Cosmos, guitarchords.info, The Signal Chain, and 71 public creator skills.", M, 6.05, 12, 0.6, { size: 11.5, italic: true });
  }

  // 7 Traction
  {
    const s = L.slide(ctx);
    L.header(s, "06 — Traction", "Real, on-chain, shipped.", { w: 8 });
    L.stat(s, "22", "x402 paid endpoints", M, 2.0, 2.7, { size: 56 });
    L.stat(s, "3", "ERC-8004 contracts on Base mainnet", M + 3.0, 2.0, 2.7, { size: 56 });
    L.stat(s, "23", "on-chain agent identities", M + 6.0, 2.0, 2.7, { size: 56 });
    L.stat(s, "8", "iOS apps shipped", M + 9.0, 2.0, 2.7, { size: 56 });
    L.rule(s, M, 4.05, W - 2 * M);
    L.bullets(s, [
      "ERC-8004 identity, reputation and validation live on Base mainnet; agents pay per call in USDC.",
      "Producer by Suede Labs: a hireable Virtuals ACP agent for music, video and ACP/x402 consulting.",
      "Ranked #1 Overall Music Platform by AI Agents Directory; rated 5.0 from 9 reviews.",
      "Suede Agent Studio and the Suede music/video x402 API listed in the community-curated awesome-x402 repository.",
      "Every contract and transaction is public and verifiable on Base mainnet. Proof without trust.",
    ], M, 4.25, 11.8, 2.5, { size: 13, space: 7 });
  }

  // 8 Market chart
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "07 — Market", "Under a trillion-dollar economy.", { w: 10.5 });
    s.addChart(ctx.pres.ChartType.bar, [{ name: "Global creator economy (USD billions)", labels: ["2024", "2033"], values: [205, 1350] }], {
      x: M, y: 2.0, w: 5.6, h: 4.3, barDir: "col", chartColors: ["FF5A63"], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "\"$\"#,##0\"B\"", dataLabelColor: "F4F5F9", dataLabelFontSize: 11,
      catAxisLabelColor: "BFC2CF", catAxisLabelFontSize: 11, valAxisLabelColor: "7E8193", valAxisLabelFontSize: 8, valGridLine: { color: "2E3140", size: 0.5 }, catGridLine: { style: "none" }, showLegend: false,
      showTitle: true, title: "Global creator economy · ~23% CAGR (Grand View Research, 2025)", titleColor: "F4F5F9", titleFontSize: 11, valAxisMaxVal: 1600, valAxisLineShow: false, catAxisLineShow: false, plotArea: { fill: { color: "0A0B12" } }, chartArea: { fill: { color: "0A0B12" }, roundedCorners: true }, barGapWidthPct: 60,
    });
    L.stat(s, "$1.35T", "TAM · creator economy by 2033, from $205B in 2024", 6.9, 2.0, 2.9, { size: 34, bigH: 0.7, labelSize: 11 });
    L.stat(s, "~$19B", "SAM · IP-management and DRM software plus $13.6B/yr in royalty collections", 9.95, 2.0, 2.75, { size: 34, bigH: 0.7, labelSize: 11 });
    L.stat(s, "$385B", "Tailwind · agent-driven commerce GMV by 2030", 6.9, 3.9, 2.9, { size: 34, bigH: 0.7, labelSize: 11 });
    L.stat(s, "$80B", "GenAI content creation by 2030", 9.95, 3.9, 2.75, { size: 34, bigH: 0.7, labelSize: 11 });
    L.body(s, "Sources: Grand View Research, Fortune Business Insights, Market.us, CISAC via MBW, Goldman Sachs, Morgan Stanley (2024–2025). Full citations in the investor brief.", 6.9, 5.7, 5.8, 0.7, { size: 10, italic: true });
  }

  // 9 Built on
  {
    const s = L.slide(ctx);
    L.header(s, "08 — Built on, integrated, partnered", "Standing on serious rails.", { w: 10 });
    L.chips(s, ["Base", "Stripe", "Google Cloud", "Chainlink", "LayerZero", "Virtuals", "ChainGPT", "AgentCash"], M, 2.05, W - 2 * M, { perRow: 4, h: 0.85, size: 15 });
    L.rule(s, M, 4.4, W - 2 * M);
    L.body(s, "Settlement on Base. Payments via Stripe and x402. Oracles via Chainlink. Cross-chain via LayerZero. Agent commerce via Virtuals. Agent payments via AgentCash. Google Cloud Partner; ecosystem partner ChainGPT.", M, 4.6, 11.5, 1.0, { size: 13.5 });
    L.mono(s, "USPTO provisional patent application 63/947,120 · proof of creation and cryptographic media registration", M, 5.8, 12, 0.3, { size: 10, color: s.__m.accent });
  }

  // 10 Founder
  {
    const s = L.slide(ctx, { alt: true });
    s.addImage({ path: L.ASSET("founder.png"), x: M, y: 1.4, w: 3.6, h: 4.6, sizing: { type: "cover", w: 3.6, h: 4.6 }, rounding: false });
    L.eyebrow(s, "09 — Founder", 4.8, 1.4, 6);
    L.title(s, "Jason Colapietro", 4.8, 1.75, 8, 0.8, { size: 36 });
    L.body(s, "Founder & CEO, Suede Labs AI. “Johnny Suede.” Two decades chasing guitar tone, then the ownership layer that thinking led to: creation proof, rights metadata, on-chain registration, royalty routing. Author of five books, including Stake Your Claim and Proof as Infrastructure. Solo operator behind the shipped Suede ecosystem.", 4.8, 2.6, 7.8, 1.9, { size: 13.5 });
    L.title(s, "“The signal chain doesn't end at the speaker. It ends when the royalty clears.”", 4.8, 4.55, 7.8, 1.0, { size: 22, color: "F5D69A" });
    L.mono(s, "suedeai.ai/founder · x.com/johnnysuede · guitar.solutions", 4.8, 5.75, 7.8, 0.3, { size: 10, color: s.__m.muted });
  }

  L.closing(ctx, {
    eyebrow: "Own · License · Settle",
    title: "The ownership layer for the AI media era.",
    sub: "Create, prove, launch and earn on one spine. Talk to Suede about the platform, the registry, or the agent rails.",
    url: "SUEDEAI.AI · APP.SUEDEAI.AI",
    rows: [["Platform", "app.suedeai.ai"], ["Registry", "ip.suedeai.ai"], ["Investors", "suedeai.org/investors"], ["Email", "info@suedeai.ai"]],
  });

  await L.save(ctx, process.argv[2] || "out/suede-labs-flagship.pptx");
})();
