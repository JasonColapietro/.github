const L = require("./lib");
const { W, H, M } = L;

const T = L.theme({
  title: "Suede IP Registry — Your music, on the record",
  footer: "SUEDE IP REGISTRY · IP.SUEDEAI.AI · PUBLIC PROVENANCE ON BASE AND AVALANCHE",
  darkBg: "ip-dark", darkBg2: "ip-dark2",
  dark: { accent: "22D3EE", accent2: "FF4D57", panel: "0F1A2C", line: "24344D", ledger: "070E1A", ledgerLine: "1E2D45", ledgerAccent: "22D3EE", muted: "B4C0D3", onAccent: "05121A" },
});

(async () => {
  const ctx = L.deck(T);

  L.cover(ctx, {
    eyebrow: "ip.suedeai.ai · Public provenance registry · Base + Avalanche",
    title: "Your music, on the record.",
    sub: "Fingerprint a file, sign a creator claim, add your contributors, and file a public timestamp on Base and Avalanche mainnet. Two minutes. About a cent in gas. A receipt built to last.",
    url: "IP.SUEDEAI.AI",
  });

  // 2 Problem
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "01 — The problem", "Creation got cheap. Ownership didn't scale.", { w: 10 });
    L.body(s, "AI drove the cost of making songs, images and video toward zero. Copyright protects ownership after distribution; AI-era media moves faster than that. When a track is trained on, remixed or claimed by someone else, a creator's word is all they have.", M, 2.0, 6.6, 1.8, { size: 14 });
    L.stat(s, "$0.01", "about a cent in gas to file a public record", M, 4.0, 3.2, { size: 44, bigH: 0.85 });
    L.stat(s, "2 min", "from upload to a claim anyone can verify", M + 3.5, 4.0, 3.1, { size: 44, bigH: 0.85 });
    L.ledger(s, 7.8, 2.0, 4.85, [
      ["Who made this?", "unprovable"],
      ["When?", "no dated record"],
      ["Who gets paid?", "no contributor record"],
      ["May a model train on it?", "no consent on file"],
    ], { header: "The questions a file cannot answer today", rowH: 0.64, size: 12, split: 0.55 });
    L.body(s, "Ownership has to be machine-readable, upstream, and portable across humans and agents.", 7.8, 5.5, 4.85, 0.8, { size: 12, italic: true });
  }

  // 3 What a record contains
  {
    const s = L.slide(ctx);
    L.header(s, "02 — What a record contains", "Four facts, signed, timestamped, public.", { w: 10 });
    const cw = (W - 2 * M - 0.75) / 4;
    [["Claim", "Wallet-signed creator claim", "The creator signs the claim from their own wallet. No custodian speaks for them."],
     ["Fingerprint", "Exact-file fingerprint", "A cryptographic hash of the exact file. Change one sample and the fingerprint changes."],
     ["Contributors", "Contributor record", "Co-writers, producers and performers on the record with their splits, before the money exists."],
     ["Timestamp", "Public timestamp", "Filed on Base and Avalanche mainnet. Dated evidence anyone can check without asking Suede."]].forEach((c, i) => {
      L.card(s, M + i * (cw + 0.25), 2.0, cw, 2.75, { tag: c[0], title: c[1], text: c[2], textSize: 11.5, titleSize: 16 });
    });
    L.rule(s, M, 5.05, W - 2 * M);
    L.body(s, "Consent terms travel with the record: a registered work can state whether AI training is permitted, so an authorized use pays and an unauthorized one meets a public record instead of a creator's word.", M, 5.2, 11.5, 0.9, { size: 13 });
  }

  // 4 How it works
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "03 — How it works", "Two minutes, then the claim is public.", { w: 10 });
    L.flow(s, [
      ["Upload", "Drop the file. The exact-file fingerprint is computed; the file itself is not the record."],
      ["Sign", "Sign the creator claim from your wallet. No crypto knowledge required beyond one signature."],
      ["Add", "Name contributors and their splits. Attach consent terms for AI training."],
      ["File", "The record lands on Base and Avalanche mainnet for about a cent in gas."],
      ["Keep", "A public receipt, an explore page and a permanent record URL for every work."],
    ], M, 2.2, W - 2 * M, { textH: 1.5, titleSize: 16, textSize: 11 });
    L.ledger(s, M, 5.15, W - 2 * M, [
      ["suede register acapella-take3.wav --facet voice --consent no-training", "OK · sealed sd_2b4f · consent terms attached"],
    ], { header: "Example session", rowH: 0.5, size: 11, split: 0.6, textColor: "22D3EE" });
  }

  // 5 Is / is not
  {
    const s = L.slide(ctx);
    L.header(s, "04 — What the registry is, and is not", "A public record. Not a copyright office.", { w: 11 });
    const cw = (W - 2 * M - 0.3) / 2;
    L.panel(s, M, 2.05, cw, 4.3);
    L.eyebrow(s, "It is", M + 0.3, 2.3, 4);
    L.bullets(s, ["Public, dated evidence of authorship and contribution", "Machine-readable: agents and platforms can verify it", "Chain-native on Base and Avalanche, verifiable by anyone", "A record of consent terms for AI training", "About a cent to file, and yours to keep"], M + 0.3, 2.7, cw - 0.6, 3.4, { size: 13, space: 8 });
    L.panel(s, M + cw + 0.3, 2.05, cw, 4.3);
    L.eyebrow(s, "It is not", M + cw + 0.6, 2.3, 4, "FF4D57");
    L.bullets(s, ["A copyright registration with a government office", "Custody of your files; only the fingerprint is on record", "A label deal, a distributor or a publishing administrator", "A requirement to understand crypto or hold tokens", "A promise about what a court will decide"], M + cw + 0.6, 2.7, cw - 0.6, 3.4, { size: 13, space: 8 });
    L.mono(s, "Read: ip.suedeai.ai/docs/what-is-the-registry", M, 6.55, 8, 0.3, { size: 10, color: s.__m.accent });
  }

  // 6 Likeness
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "05 — The whole likeness", "Voice, face, name and the work, on the record.", { w: 11 });
    L.body(s, "A generative model can reproduce a face from a press kit and a voice from one verse. That makes identity a commercial surface. Suede treats the whole likeness as catalog: the reference works an identity travels through enter the registry with dated proof and machine-readable consent terms.", M, 2.0, 6.2, 1.9, { size: 13.5 });
    const cw = 2.95, ch = 1.25;
    [["Voice", "a cappellas, demo vocals, isolated stems"], ["Face", "press photos, album art, portrait sets"], ["Name and persona", "stage names, aliases, the performed character"], ["The work itself", "tracks, stems, artwork, video"]].forEach((c, i) => {
      L.card(s, M + (i % 2) * (cw + 0.22), 4.1 + Math.floor(i / 2) * (ch + 0.2), cw, ch, { title: c[0], text: c[1], titleSize: 15, textSize: 11 });
    });
    L.ledger(s, 7.4, 2.0, 5.25, [
      ["register presskit/ --facet face --license commercial", "12 works sealed"],
      ["register acapella-take3.wav --facet voice", "consent: no-training"],
      ["verify suspect-clip.mp4", "NO CONSENT ON RECORD"],
      ["dated evidence", "sd_2b4f + 12 works"],
    ], { header: "Identity registry · example session", rowH: 0.66, size: 11, split: 0.62 });
    L.body(s, "An authorized use pays. An unauthorized one meets a public record.", 7.4, 5.55, 5.25, 0.5, { size: 12, italic: true });
  }

  // 7 On chain
  {
    const s = L.slide(ctx);
    L.header(s, "06 — On chain", "The rights stack underneath the registry.", { w: 10 });
    L.stat(s, "17", "public works on record: 14 on Base, 3 on Avalanche", M, 2.05, 3, { size: 52 });
    L.stat(s, "30", "indexed pages: docs, articles and record pages", M + 3.4, 2.05, 3, { size: 52 });
    L.stat(s, "2", "mainnets, one record format", M + 6.8, 2.05, 3, { size: 52 });
    L.rule(s, M, 4.1, W - 2 * M);
    L.chips(s, ["IP registry contract", "Licensing templates", "Derivatives", "Royalty distribution"], M, 4.3, 7.4, { perRow: 2, h: 0.72, size: 13 });
    L.ledger(s, 8.4, 4.3, 4.25, [
      ["USPTO provisional application", "63/947,120"],
      ["Contracts", "github.com/Suede-AI"],
      ["Settlement asset", "USDC on Base"],
    ], { header: "Record", rowH: 0.52, size: 11.5, split: 0.5 });
    L.body(s, "Base smart contracts for an IP registry, licensing templates, derivatives and royalty distribution. Every contract and transaction is public and verifiable on mainnet.", M, 6.2, 7.4, 0.7, { size: 11.5, italic: true });
  }

  // 8 Where it sits
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "07 — Where it sits", "Four stages. One spine. This is the wedge.", { w: 11 });
    const steps = [["Create", "AI lowers the cost of making media of every kind. Suede Create, Studio Music, the iOS line."], ["Prove", "Authorship, voice, likeness, consent and rights travel with the work. The IP Registry."], ["Launch", "Distribution, funding, audience and ownership participation. Distro, vaults, launchpad."], ["Earn", "Licensing, royalties and agent commerce turn output into income. x402, ACP, USDC."]];
    const cw = (W - 2 * M - 0.75) / 4;
    steps.forEach((st, i) => {
      const x = M + i * (cw + 0.25);
      L.card(s, x, 2.1, cw, 2.6, { n: String(i + 1).padStart(2, "0"), title: st[0], text: st[1], textSize: 11.5, fill: i === 1 ? "0F2A38" : undefined });
    });
    L.mono(s, "Suede's wedge", M + cw + 0.25, 4.8, cw, 0.3, { size: 9.5, color: s.__m.accent, cs: 2 });
    L.body(s, "Everything downstream settles against the proof layer. A licence, a royalty split or an agent's per-call payment all point back at a record that says who made the work and on what terms.", M, 5.3, 11.5, 1.0, { size: 13.5 });
  }

  // 9 Who it's for
  {
    const s = L.slide(ctx);
    L.header(s, "08 — Who files a record", "Anyone whose work can be trained on, remixed or monetized without them.", { w: 11.5, h: 1.3 });
    L.bullets(s, [
      "Independent artists and producers with a catalog and no paper trail",
      "Co-writers who want the split on record before the money exists",
      "Vocalists and performers whose voice and face are now reproducible",
      "Platforms and agents that need machine-readable rights before they use a file",
    ], M, 2.45, 6.2, 2.6, { size: 13.5, space: 8 });
    L.ledger(s, 7.3, 2.45, 5.35, [
      ["Music IP basics for independent artists", "article"],
      ["Provenance in the AI era", "article"],
      ["Preparing your catalog metadata", "article"],
      ["Common rights mistakes", "article"],
      ["What the registry is (and is not)", "docs"],
    ], { header: "Reading on the site", rowH: 0.52, size: 11.5, split: 0.75 });
    L.body(s, "Do I need to understand crypto? No. Is this a copyright registration? No. Both answers are on the homepage FAQ, in plain language.", M, 5.35, 6.2, 0.9, { size: 12, italic: true });
  }

  L.closing(ctx, {
    eyebrow: "File the first record",
    title: "Two minutes. About a cent. A receipt built to last.",
    sub: "Register a work, add your contributors, and hand every platform and agent a public answer to who made it.",
    url: "IP.SUEDEAI.AI",
    rows: [["Register", "ip.suedeai.ai"], ["Explore records", "/explore"], ["Docs", "/docs"], ["Company", "suedeai.ai"]],
  });

  await L.save(ctx, process.argv[2] || "out/suede-ip-registry.pptx");
})();
