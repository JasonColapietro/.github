const L = require("./lib");
const { W, H, M } = L;

const T = L.theme({
  title: "Suede Distro — Independent music distribution, $7.99/mo",
  footer: "SUEDE DISTRO · DISTRO.SUEDEAI.AI · INDEPENDENT MUSIC DISTRIBUTION",
  darkBg: "distro-dark", darkBg2: "distro-dark2",
  dark: { accent: "34D399", accent2: "F5D69A", panel: "0F1F1A", line: "24403A", ledger: "06110E", ledgerLine: "1E3530", ledgerAccent: "6EE7B7", muted: "B9CCC5", onAccent: "05140F" },
});

(async () => {
  const ctx = L.deck(T);

  L.cover(ctx, {
    eyebrow: "distro.suedeai.ai · Music distribution · Spotify, Apple Music and 100+ DSPs",
    title: "Independent music distribution, $7.99 a month.",
    sub: "Release-readiness planning and delivery coordination to Spotify, Apple Music and 100+ stores through supported distribution partners, with royalty-aware splits. Own the master. Keep the royalties.",
    url: "DISTRO.SUEDEAI.AI",
  });

  // 2 Problem + demand chart
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "01 — The problem", "Searching for a way out of the distributor tax.", { w: 11 });
    L.body(s, "The big distributors bundle percentage cuts, per-release fees and upsells, and the artist still owns nothing more than a login. The search demand tells the story: people are looking for the service and looking for the alternative in the same breath.", M, 2.0, 6.0, 1.9, { size: 13.5 });
    L.bullets(s, ["Percentage cuts on top of subscriptions", "Rights and splits handled nowhere, or by email", "Delivery checklists learned the hard way, release by release"], M, 4.1, 6.0, 2.0, { size: 13, space: 8 });
    s.addChart(ctx.pres.ChartType.bar, [{ name: "US monthly searches", labels: ["music distribution service", "distrokid alternative", "free music distribution"], values: [8100, 390, 4400] }], {
      x: 7.1, y: 2.0, w: 5.55, h: 4.1, barDir: "bar", chartColors: ["34D399"], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "#,##0", dataLabelColor: "EAF4F0", dataLabelFontSize: 10,
      catAxisLabelColor: "B9CCC5", catAxisLabelFontSize: 10, valAxisLabelColor: "7F958E", valAxisLabelFontSize: 8, valGridLine: { color: "24403A", size: 0.5 }, catGridLine: { style: "none" }, showLegend: false,
      showTitle: true, title: "What artists type into Google (US, monthly)", titleColor: "EAF4F0", titleFontSize: 11, valAxisMaxVal: 10000, valAxisLineShow: false, catAxisLineShow: false, plotArea: { fill: { color: "06110E" } }, chartArea: { fill: { color: "06110E" }, roundedCorners: true },
    });
    L.mono(s, "Source: Keywords Everywhere and DataForSEO, pulled 2026-09-05", 7.1, 6.2, 5.5, 0.3, { size: 9, color: s.__m.muted });
  }

  // 3 What it is
  {
    const s = L.slide(ctx);
    L.header(s, "02 — What it is", "Distribution only, done properly, one flat price.", { w: 10 });
    const cw = (W - 2 * M - 0.5) / 3;
    [["Intake", "Release intake", "Upload the release, the artwork and the metadata once. Suede checks readiness before anything ships."],
     ["Delivery", "Delivery coordination", "Spotify, Apple Music and 100+ DSPs through supported distribution partners. Coverage and eligibility vary by store."],
     ["Splits", "Royalty-aware splits", "Contributors and percentages recorded up front, so the money knows where to go when it arrives."]].forEach((c, i) => {
      L.card(s, M + i * (cw + 0.25), 2.0, cw, 2.55, { tag: c[0], title: c[1], text: c[2], titleSize: 17, textSize: 12 });
    });
    L.ledger(s, M, 4.85, W - 2 * M, [
      ["Publishing administration and sync licensing", "not included · by design"],
      ["Masters ownership and royalty share", "yours · 100%"],
    ], { header: "Scope, stated plainly", rowH: 0.52, size: 12, split: 0.6 });
  }

  // 4 How it works
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "03 — How a release moves", "Prepare. Check. Deliver. Track.", { w: 10 });
    L.flow(s, [
      ["Prepare", "Metadata, audio and timing gathered against the store checklists. The Spotify guide spells out each requirement."],
      ["Check", "Release-readiness planning catches the missing ISRC, the wrong sample rate or the too-late release date before a store rejects it."],
      ["Deliver", "Delivery coordinated through supported partners to Spotify, Apple Music and 100+ DSPs."],
      ["Track", "Splits on record, contact by email, and a path to the Suede IP Registry for the rights the distributor never handled."],
    ], M, 2.2, W - 2 * M, { textH: 1.8, textSize: 11.5 });
    L.mono(s, "Guide: distro.suedeai.ai/how-to-upload-music-to-spotify · Spotify metadata requirements · audio file requirements · timing", M, 5.9, 12, 0.3, { size: 9.5, color: s.__m.accent });
  }

  // 5 Rights gap
  {
    const s = L.slide(ctx);
    L.header(s, "04 — The rights gap, closed next door", "The file moves. The registry proves who made it.", { w: 11.5, h: 1.3 });
    L.body(s, "Distro deliberately leaves rights workflow out of scope, and points at the estate surface built for it. Suede Studio Music keeps the master and 100% of royalties while an idea is being sketched; the Suede IP Registry files the creator claim, the fingerprint, the contributor record and a public timestamp for about a cent in gas.", M, 2.45, 6.4, 2.2, { size: 13.5 });
    const cw = 2.55;
    [["studio.suedeai.ai", "Own the master", "Sketch ideas, remix directions, export stems, keep the masters. Standalone Distro is $7.99/mo when a track is ready."],
     ["ip.suedeai.ai", "Prove the work", "Wallet-signed claim, exact-file fingerprint, contributor record, public timestamp on Base and Avalanche."]].forEach((c, i) => {
      L.card(s, 7.5 + i * (cw + 0.22), 2.45, cw, 2.9, { tag: c[0], title: c[1], text: c[2], titleSize: 16, textSize: 11 });
    });
    L.mono(s, "Create → Prove → Launch → Earn. Distro is the Launch stage.", M, 5.6, 10, 0.3, { size: 10, color: s.__m.accent, cs: 1 });
  }

  // 6 Pricing
  {
    const s = L.slide(ctx, { alt: true });
    L.header(s, "05 — Pricing", "One number. No percentage. No per-release fee.", { w: 10 });
    L.panel(s, M, 2.05, 5.4, 4.1, { fill: "0E2A22" });
    L.eyebrow(s, "Suede Distro", M + 0.3, 2.3, 4);
    L.title(s, "$7.99 / month", M + 0.3, 2.6, 4.8, 0.9, { size: 42 });
    L.bullets(s, ["Release intake and readiness planning", "Delivery coordination to Spotify, Apple Music and 100+ DSPs", "Royalty-aware splits on record", "Masters and royalties stay yours", "Cancel any time"], M + 0.3, 3.65, 4.8, 2.4, { size: 12.5, space: 7 });
    L.ledger(s, 6.6, 2.05, 6.05, [
      ["Cut of your royalties", "0%"],
      ["Per-release fee", "none"],
      ["Publishing admin, sync", "not included"],
      ["Store coverage", "varies by partner and eligibility"],
      ["Contact", "distro.suedeai.ai/contact"],
    ], { header: "The fine print, in the open", rowH: 0.58, size: 12, split: 0.5 });
  }

  L.closing(ctx, {
    eyebrow: "Release it",
    title: "Ready when the track is.",
    sub: "Bring the release. Suede checks it, delivers it, and keeps the splits on record.",
    url: "DISTRO.SUEDEAI.AI",
    rows: [["Start", "distro.suedeai.ai"], ["Spotify checklist", "/how-to-upload-music-to-spotify"], ["Free distribution?", "/free-music-distribution"], ["Contact", "/contact"]],
  });

  await L.save(ctx, process.argv[2] || "out/suede-distro.pptx");
})();
