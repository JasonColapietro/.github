#!/usr/bin/env node
// Generate the HTML sources in images-src/ from one template so every asset shares the
// Agent Studio palette. Edit here, then `node build-sources.mjs && node render.mjs`.
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(here, "images-src");
fs.mkdirSync(out, { recursive: true });

const css = `
  :root{--surface:#ffffff;--surface-muted:#f5f5fa;--ink:#111827;--ink-muted:#4b5563;--line:#e5e7eb;
        --indigo:#4f46e5;--indigo-deep:#4338ca;--indigo-soft:#eef2ff;--on-indigo:#ffffff;}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:100%;height:100%;overflow:hidden}
  body{font-family:Geist,Inter,"Helvetica Neue",Arial,system-ui,sans-serif;background:var(--surface);color:var(--ink);
       -webkit-font-smoothing:antialiased}
  .light{background:var(--surface);color:var(--ink)}
  .indigo{background:linear-gradient(135deg,var(--indigo) 0%,var(--indigo-deep) 100%);color:var(--on-indigo)}
  .frame{position:relative;width:100%;height:100%;display:flex;align-items:center}
  .grid{position:absolute;inset:0;background-image:linear-gradient(var(--g) 1px,transparent 1px),linear-gradient(90deg,var(--g) 1px,transparent 1px);
        background-size:64px 64px;opacity:.9}
  .light .grid{--g:#eef0f4}.indigo .grid{--g:rgba(255,255,255,.08)}
  .content{position:relative;padding:0 var(--pad,96px);width:100%;display:flex;align-items:center;gap:var(--gap,56px)}
  .mark{flex:none;display:flex;align-items:center;justify-content:center;border-radius:22%;
        font-weight:800;letter-spacing:-.04em;line-height:1}
  .light .mark{background:linear-gradient(135deg,var(--indigo),var(--indigo-deep));color:var(--on-indigo)}
  .indigo .mark{background:var(--on-indigo);color:var(--indigo-deep)}
  .text{min-width:0}
  .kicker{font-size:var(--k,18px);font-weight:600;letter-spacing:.14em;text-transform:uppercase;margin-bottom:.6em}
  .light .kicker{color:var(--indigo)}.indigo .kicker{color:rgba(255,255,255,.78)}
  h1{font-size:var(--h,72px);font-weight:700;letter-spacing:-.035em;line-height:1.02}
  .lede{font-size:var(--l,26px);line-height:1.35;margin-top:.7em;max-width:var(--lw,900px)}
  .light .lede{color:var(--ink-muted)}.indigo .lede{color:rgba(255,255,255,.86)}
  .chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:1.1em}
  .chip{font-size:var(--c,17px);font-weight:600;padding:.45em .9em;border-radius:999px;border:1.5px solid}
  .light .chip{background:var(--indigo-soft);border-color:#c7d2fe;color:var(--indigo-deep)}
  .indigo .chip{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.35);color:#fff}
  .url{position:absolute;right:var(--pad,96px);bottom:var(--urlb,40px);font-size:var(--u,20px);font-weight:600;letter-spacing:.02em}
  .light .url{color:var(--ink-muted)}.indigo .url{color:rgba(255,255,255,.85)}
  .org{position:absolute;right:var(--pad,96px);top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:14px}
  .org .row{display:flex;gap:14px}
  .node{border-radius:10px;border:1.5px solid;padding:8px 14px;font-size:14px;font-weight:600;white-space:nowrap}
  .light .node{background:#fff;border-color:var(--line);color:var(--ink)}
  .light .node.exec{background:var(--indigo-deep);border-color:var(--indigo-deep);color:#fff}
  .indigo .node{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.35);color:#fff}
  .indigo .node.exec{background:#fff;border-color:#fff;color:var(--indigo-deep)}
  .org .stem{width:1.5px;height:18px}
  .light .stem{background:var(--line)}.indigo .stem{background:rgba(255,255,255,.35)}
  .stack{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;width:100%;height:100%;gap:.35em}
`;

const org = `<div class="org"><div class="node exec">Suede AI Agent Studio</div><div class="stem"></div>
  <div class="row"><div class="node">GEO / SEO</div><div class="node">AI architecture</div><div class="node">Managed agents</div></div></div>`;

const page = ({ name, w, h, theme, body, vars = "" }) =>
  `<!doctype html><html><head><meta charset="utf-8"><meta name="size" content="${w}x${h}"><title>${name}</title>
<style>${css}</style></head><body class="${theme}" style="${vars}"><div class="frame">${body}</div></body></html>`;

const banner = ({ kicker, title, lede, chips, url, mark = 150, withOrg = false }) => `
  <div class="grid"></div>
  <div class="content">
    <div class="mark" style="width:${mark}px;height:${mark}px;font-size:${Math.round(mark * 0.62)}px">S</div>
    <div class="text"><div class="kicker">${kicker}</div><h1>${title}</h1>
      ${lede ? `<div class="lede">${lede}</div>` : ""}
      ${chips ? `<div class="chips">${chips.map((c) => `<span class="chip">${c}</span>`).join("")}</div>` : ""}
    </div>
  </div>${withOrg ? org : ""}<div class="url">${url}</div>`;

const LANES = ["Full-stack GEO / AEO / SEO", "AI architecture & integration", "Managed AI agents", "Forward-deployed engineer"];
const GC = "Google Cloud partner since 2025";

const files = {
  "x-header-brand": page({ name: "Suede AI X header", w: 1500, h: 500, theme: "indigo", vars: "--h:66px;--l:24px;--lw:820px",
    body: banner({ kicker: "Suede AI", title: "Search is being replaced by answers.", lede: "Full-stack GEO, AEO and SEO with AI architecture integration. Managed AI agents in Suede AI Agent Studio.", chips: [...LANES.slice(0, 3), GC], url: "seo.suedeai.ai" }) }),
  "x-header-founder": page({ name: "Jason Colapietro X header", w: 1500, h: 500, theme: "light", vars: "--h:62px;--l:24px;--lw:820px",
    body: banner({ kicker: "Jason Colapietro · Founder, Suede AI", title: "I ship the fixes AI answers are built from.", lede: "Full-stack GEO, AEO and SEO with AI architecture integration, delivered as pull requests with a source diff.", chips: [...LANES.slice(0, 2), "49 upstream PRs merged", "Five books"], url: "seo.suedeai.ai" }) }),
  "li-cover-founder": page({ name: "Jason Colapietro LinkedIn cover", w: 1584, h: 396, theme: "light", vars: "--h:52px;--l:21px;--lw:760px;--pad:120px;--urlb:28px",
    body: banner({ kicker: "Jason Colapietro · Founder, Suede AI", title: "GEO, SEO and AI architecture, shipped.", lede: "Answer-engine visibility and AI integration for the operation behind it.", chips: [LANES[0], LANES[1], GC], url: "seo.suedeai.ai", mark: 120 }) }),
  "li-cover-company": page({ name: "Suede AI LinkedIn company cover", w: 1128, h: 191, theme: "indigo", vars: "--h:34px;--k:13px;--pad:56px;--gap:28px;--u:15px;--urlb:18px",
    body: banner({ kicker: "Suede AI", title: "Full-stack GEO, AEO & SEO with AI architecture integration", chips: null, lede: null, url: "seo.suedeai.ai", mark: 84 }) }),
  "fb-cover": page({ name: "Suede AI Facebook cover", w: 820, h: 312, theme: "indigo", vars: "--h:36px;--l:17px;--lw:520px;--k:13px;--pad:48px;--gap:28px;--c:13px;--u:15px;--urlb:20px",
    body: banner({ kicker: "Suede AI", title: "Search is being replaced by answers.", lede: "Full-stack GEO, AEO and SEO with AI architecture integration. Managed AI agents.", chips: [GC], url: "seo.suedeai.ai", mark: 96 }) }),
  "yt-banner": page({ name: "Suede AI YouTube banner", w: 2560, h: 1440, theme: "indigo", vars: "--h:64px;--l:24px;--lw:900px;--k:18px;--pad:600px;--gap:48px;--c:17px;--u:20px;--urlb:530px",
    body: banner({ kicker: "Suede AI", title: "Search is being replaced by answers.", lede: "Full-stack GEO, AEO and SEO with AI architecture integration. Managed AI agents in Suede AI Agent Studio.", chips: [LANES[1], LANES[2], GC], url: "seo.suedeai.ai", mark: 140 }) }),
  "avatar-brand": page({ name: "Suede AI avatar", w: 1200, h: 1200, theme: "indigo",
    body: `<div class="stack"><div class="mark" style="width:640px;height:640px;font-size:420px">S</div></div>` }),
  "avatar-founder": page({ name: "Jason Colapietro avatar fallback", w: 1200, h: 1200, theme: "light",
    body: `<div class="stack"><div class="mark" style="width:560px;height:560px;font-size:360px">S</div><div style="margin-top:36px;font-size:84px;font-weight:700;letter-spacing:-.03em">Suede AI</div><div style="font-size:40px;color:var(--ink-muted);margin-top:6px">Jason Colapietro</div></div>` }),
  "ig-highlight-geo": page({ name: "IG highlight GEO", w: 1080, h: 1080, theme: "indigo",
    body: `<div class="stack"><div style="font-size:150px;font-weight:800;letter-spacing:-.04em">GEO</div><div style="font-size:44px;color:rgba(255,255,255,.85)">AEO · SEO</div></div>` }),
  "ig-highlight-agents": page({ name: "IG highlight Agents", w: 1080, h: 1080, theme: "light",
    body: `<div class="stack"><div class="mark" style="width:300px;height:300px;font-size:190px">S</div><div style="font-size:64px;font-weight:700;letter-spacing:-.03em;margin-top:30px;color:var(--indigo-deep)">Agent Studio</div></div>` }),
  "ig-highlight-receipts": page({ name: "IG highlight Receipts", w: 1080, h: 1080, theme: "indigo",
    body: `<div class="stack"><div style="font-size:120px;font-weight:800;letter-spacing:-.04em">Receipts</div><div style="font-size:44px;color:rgba(255,255,255,.85)">dated · screenshotted · re-measured</div></div>` }),
  "og-card": page({ name: "Suede AI OG card", w: 1200, h: 630, theme: "light", vars: "--h:58px;--l:23px;--lw:900px;--pad:80px",
    body: banner({ kicker: "Suede AI", title: "Full-stack GEO, AEO & SEO with AI architecture integration", lede: "Measure what AI answers say. Repair the sources. Integrate AI into the operation. Publish the receipts.", chips: [LANES[2], LANES[3], GC], url: "seo.suedeai.ai", mark: 130 }) }),
};

for (const [name, html] of Object.entries(files)) {
  fs.writeFileSync(path.join(out, `${name}.html`), html);
  console.log(`images-src/${name}.html`);
}
