#!/usr/bin/env node
// Guard the countable claims in profile/README.md against their live sources.
//
// Why this exists. The skill count and the upstream contribution count are each
// stated in two forms: a shields.io badge and a prose sentence. Both drift,
// because the thing they count keeps moving while the README does not. On
// 2026-09-21 the badge and totals line read "45 PRs / 41 repos" while
// seo.suedeai.ai already said 49 across 44, and the higher figure was the
// correct one. Nothing caught it, because this repository has no CI.
//
// The skills repository solved the same problem for its own surfaces: it keeps
// counts out of prose, guards the short list where the number is the point, and
// ships `npm run fix:counts` to update them. This is that idea applied to the
// one count-bearing surface that lives outside it.
//
// Both numbers are derived, never asserted:
//   skills  directories under skills/ in JasonColapietro/suede-creator-skills
//   PRs     merged pull requests authored by the verified JasonColapietro and
//           Suede-AI accounts into repositories neither account owns
//   repos   distinct repositories among those pull requests
//
// Usage:
//   node scripts/check-profile-claims.mjs         verify, exit 1 on drift
//   node scripts/check-profile-claims.mjs --fix   rewrite the README to match
//
// Fails closed. An unreachable source is a failure, not a pass, because a guard
// that exits clean when it cannot see anything is worse than no guard at all.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
export const README_PATH = path.join(REPO_ROOT, "profile", "README.md");

const SKILLS_REPO = "JasonColapietro/suede-creator-skills";
const AUTHORS = ["JasonColapietro", "Suede-AI"];
const API = "https://api.github.com";

function headers() {
  const h = {
    accept: "application/vnd.github+json",
    "user-agent": "suede-profile-claim-guard",
    "x-github-api-version": "2022-11-28",
  };
  // Optional locally; the workflow always supplies one. Without it the search
  // endpoint allows only ten requests a minute, which this script can exceed.
  //
  // "proxy-injected" is not a credential. Some sandboxed environments set
  // GITHUB_TOKEN to that placeholder and attach real credentials at the egress
  // proxy instead, so forwarding it verbatim earns a 401 on a request that
  // would otherwise have succeeded.
  const token = process.env.GITHUB_TOKEN;
  if (token && token !== "proxy-injected") h.authorization = `Bearer ${token}`;
  return h;
}

async function getJSON(url) {
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  return res.json();
}

// The contents endpoint returns one entry per child, so "dir" entries are the
// skills themselves.
export async function countSkills() {
  const entries = await getJSON(`${API}/repos/${SKILLS_REPO}/contents/skills`);
  if (!Array.isArray(entries)) throw new Error("skills/ did not list as a directory");
  const dirs = entries.filter((e) => e.type === "dir");
  if (dirs.length === 0) throw new Error("skills/ listed zero directories");
  return dirs.length;
}

// Merged pull requests into repositories these accounts do not own. The two
// -user: qualifiers are what make it "codebases I don't maintain"; drop them and
// the number silently absorbs this estate's own repositories.
export async function countUpstream() {
  const seen = new Map(); // html_url -> owner/repo, so a re-run cannot double count
  for (const author of AUTHORS) {
    const q = ["is:pr", "is:merged", `author:${author}`, ...AUTHORS.map((a) => `-user:${a}`)].join("+");
    for (let page = 1; page <= 10; page += 1) {
      const data = await getJSON(`${API}/search/issues?q=${q}&per_page=100&page=${page}`);
      const items = data.items ?? [];
      for (const item of items) {
        seen.set(item.html_url, item.repository_url.split("/repos/")[1]);
      }
      if (items.length < 100) break;
    }
  }
  if (seen.size === 0) throw new Error("upstream search returned nothing");
  return { prs: seen.size, repos: new Set(seen.values()).size };
}

// Each claim names what it guards, the pattern whose first capture group is the
// number, and the value it must equal. A pattern that appears more than once
// must agree at every occurrence, not just the first.
export function claimsFor({ skills, prs, repos }) {
  return [
    { label: "upstream badge, pull request count", re: /badge\/upstream%20merged-(\d+)%20PRs/, expected: prs },
    { label: "upstream badge, repository count", re: /%20PRs%20%2F%20(\d+)%20repos/, expected: repos },
    { label: "skills badge", re: /badge\/open--source%20skills-(\d+)-/, expected: skills },
    { label: "totals line, pull request count", re: /\*\*Totals:\*\* (\d+) merged pull requests/, expected: prs },
    { label: "totals line, repository count", re: /merged pull requests across (\d+) repositories I do not maintain/, expected: repos },
    { label: "totals note, restated pull request count", re: /That (\d+) counts the verified/, expected: prs },
    { label: "totals note, kernel caveat", re: /not counted in the (\d+)\./, expected: prs },
    { label: "skill catalogs paragraph", re: /— (\d+) open-source agent skills for Claude Code and Codex —/, expected: skills },
  ];
}

export function audit(text, claims, { rewrite = false } = {}) {
  const failures = [];
  let updated = text;

  for (const claim of claims) {
    const global = new RegExp(claim.re.source, "g");
    const found = [...text.matchAll(global)];
    if (found.length === 0) {
      // A claim whose wording changed is a silent hole, so it fails loudly.
      failures.push(`${claim.label}: pattern not found, so this claim is no longer guarded`);
      continue;
    }
    for (const m of found) {
      if (Number(m[1]) !== claim.expected) {
        failures.push(`${claim.label}: README says ${m[1]}, live count is ${claim.expected}`);
      }
    }
    if (rewrite) {
      updated = updated.replaceAll(global, (whole, captured) => whole.replace(captured, String(claim.expected)));
    }
  }

  return { failures, updated };
}

async function run() {
  const fix = process.argv.includes("--fix");

  let counts;
  try {
    const [skills, upstream] = await Promise.all([countSkills(), countUpstream()]);
    counts = { skills, prs: upstream.prs, repos: upstream.repos };
  } catch (err) {
    console.error(`profile claim guard: could not reach a source - ${err.message}`);
    console.error("Failing closed. This is not a pass.");
    process.exit(1);
  }

  const text = fs.readFileSync(README_PATH, "utf8");
  const { failures, updated } = audit(text, claimsFor(counts), { rewrite: fix });

  console.log(
    `live counts: ${counts.skills} skills, ${counts.prs} merged pull requests across ${counts.repos} repositories`
  );

  if (fix) {
    if (updated !== text) {
      fs.writeFileSync(README_PATH, updated);
      console.log("profile claim guard: README updated to match the live counts");
    } else {
      console.log("profile claim guard: nothing to change");
    }
    return;
  }

  if (failures.length > 0) {
    console.error("\nprofile claim guard: drift found\n");
    for (const f of failures) console.error(`  ${f}`);
    console.error("\nRun `node scripts/check-profile-claims.mjs --fix` to bring the README into line.");
    console.error("If a pattern went missing, the wording changed and the claim needs re-pinning in this script.");
    process.exit(1);
  }

  console.log("profile claim guard: clean");
}

// Importing this file for its patterns must not fire the network calls above.
if (process.argv[1] === import.meta.filename) {
  await run();
}
