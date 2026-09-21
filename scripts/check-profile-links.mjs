#!/usr/bin/env node
// Guard the outbound links in profile/README.md.
//
// Why this exists. This README is the estate's highest-authority link surface
// and nothing checked where its links actually go. On 2026-09-21 two different
// books — *The Guitar Without a Number* and *Suede Labs: The Human Authenticity
// Layer* — both pointed at `amazon.com/dp/B0GD5FX6N6`. One title had been
// absorbed into another years-old work and the other owned that ASIN, so the
// README was advertising a book that no longer exists and sending its readers
// to a different one. The claim guard next door counts things; it never looks
// at a destination. This does.
//
// Two classes of check, deliberately kept apart:
//
//   structural   Offline, deterministic, always fatal. A duplicate ASIN, a
//                plaintext http:// link or one host spelled two ways is a
//                defect in this file and a re-run will not change the verdict.
//
//   liveness     Network. Fatal only for 404, 410 and a redirect that lands on
//                a different host — the three answers that mean the link is
//                wrong. A 403, a 429, a 5xx or a timeout is reported and does
//                not fail the run: Amazon and the social hosts bot-wall CI
//                runners, and a third party having a bad afternoon is not a
//                defect in this repository. A guard that goes red for reasons
//                the repository cannot fix gets ignored, and an ignored guard
//                is worse than none.
//
// Usage:
//   node scripts/check-profile-links.mjs             structural + liveness
//   node scripts/check-profile-links.mjs --offline   structural only
//
// Unlike the claim guard this does not fail closed on an unreachable network:
// with no reachable host every link would "fail" at once, which reports a
// sandbox as a README defect. Structural checks still run and still bite.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
export const README_PATH = path.join(REPO_ROOT, "profile", "README.md");

const REQUEST_TIMEOUT_MS = 15_000;

// Shields.io renders the badges and these two render the stats cards. They are
// image infrastructure, not destinations, and they answer differently to a bare
// fetch than to a browser. The badge *targets* are ordinary links and are
// checked; only the image sources are skipped.
const IMAGE_HOSTS = new Set([
  "img.shields.io",
  "github-readme-stats.vercel.app",
  "streak-stats.demolab.com",
]);

// A badge is `[![alt](src)](target)` — an image wrapped in a link. It has to be
// matched before the general pattern, because a label containing `]` defeats
// the `[^\]]*` label class and the outer target would otherwise never be seen
// at all. Every badge across the top of the README is one of these, so getting
// this wrong means silently checking none of them.
// The outer target is deliberately `[^\s)]+` and not an http URL: a badge may
// point at a local anchor, and two of them do. Requiring a URL there made this
// pattern miss those badges entirely, and the general pattern below then ate
// them from the outer `[`, producing a link whose label was the literal text
// `![Upstream merged` and whose URL was the Shields image — classified as a
// destination, so the liveness step went and probed the badge service that
// `destinations()` exists to exclude.
const BADGE_LINK = /\[\s*!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)\s*\]\(([^\s)]+)\)/g;

// `[label](url)` and a bare `![alt](src)`. The leading `!` is captured so an
// image source can be told from a link target. The URL half stops at
// whitespace or the closing paren, which is enough for this file.
const MARKDOWN_LINK = /(!?)\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;

export function extractLinks(text) {
  const found = [];

  // Badges first, then blanked out of the text so the general pass below does
  // not see their halves a second time. The replacement keeps the string's
  // length irrelevant — nothing here depends on offsets.
  const rest = text.replace(BADGE_LINK, (_whole, alt, src, target) => {
    found.push({ url: src, label: alt.trim(), image: true });
    // The alt text is the badge's anchor text, so it is the label that matters
    // for the target too. A local anchor is a real badge target but not one
    // this guard can resolve over HTTP, so the badge is still blanked and the
    // target simply is not recorded as a destination.
    if (/^https?:\/\//i.test(target)) found.push({ url: target, label: alt.trim(), image: false });
    return "";
  });

  for (const m of rest.matchAll(MARKDOWN_LINK)) {
    const [, bang, label, url] = m;
    found.push({ url, label: label.trim(), image: bang === "!" });
  }
  return found;
}

// The destinations worth checking: every markdown link target, minus the badge
// and stats images. A badge's own target arrives here as a normal link, because
// in `[![alt](src)](target)` the target is the outer link.
export function destinations(links) {
  return links.filter((link) => {
    if (!link.image) return true;
    try {
      return !IMAGE_HOSTS.has(new URL(link.url).hostname);
    } catch {
      return true; // unparseable: let the structural check report it
    }
  });
}

function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

// Amazon identifies a title by its ASIN, so two titles sharing one is always an
// error: either a link was copied and not edited, or a title no longer exists.
// The general "same URL under two labels" rule cannot be used here — the
// practice site is linked a dozen times under a dozen honest labels — so the
// check is scoped to the identifier where uniqueness is guaranteed.
const AMAZON_ASIN = /^https:\/\/(?:www\.)?amazon\.com\/dp\/([A-Z0-9]{10})\b/;

export function structuralFailures(links) {
  const failures = [];
  const targets = destinations(links);

  // 1. Every URL has to parse, and has to be https. A plaintext link on a page
  //    this widely read is an interception opportunity and an engine downranks
  //    it besides.
  for (const { url, label } of targets) {
    if (!hostOf(url)) {
      failures.push(`unparseable URL under "${label}": ${url}`);
      continue;
    }
    if (url.startsWith("http://")) {
      failures.push(`plaintext http link under "${label}": ${url}`);
    }
  }

  // 2. One ASIN, one title.
  const asins = new Map(); // asin -> Set of labels
  for (const { url, label } of targets) {
    const m = url.match(AMAZON_ASIN);
    if (!m) continue;
    if (!asins.has(m[1])) asins.set(m[1], new Set());
    asins.get(m[1]).add(label);
  }
  for (const [asin, labels] of asins) {
    if (labels.size > 1) {
      failures.push(
        `ASIN ${asin} is linked as ${labels.size} different titles: ${[...labels].map((l) => `"${l}"`).join(", ")}`
      );
    }
  }

  // 3. One host, one spelling. `instagram.com` in one line and
  //    `www.instagram.com` in the next are the same destination described two
  //    ways, and an entity graph built from this page reads them as two. The
  //    comparison ignores a leading `www.` precisely so it can catch the pair.
  const spellings = new Map(); // bare host -> Set of spellings as written
  for (const { url } of targets) {
    const host = hostOf(url);
    if (!host) continue;
    const bare = host.replace(/^www\./, "");
    if (!spellings.has(bare)) spellings.set(bare, new Set());
    spellings.get(bare).add(host);
  }
  for (const [bare, written] of spellings) {
    if (written.size > 1) {
      failures.push(`${bare} is spelled ${written.size} ways: ${[...written].sort().join(", ")}`);
    }
  }

  return failures;
}

// A HEAD first, because most of these are large pages and the status is all
// this needs. Some hosts answer HEAD with 405 while serving GET fine, so a
// non-2xx HEAD is retried as a GET before being believed.
export async function probe(url, { fetchImpl = fetch } = {}) {
  const attempt = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetchImpl(url, {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "suede-profile-link-guard" },
      });
      return { status: res.status, finalUrl: res.url || url };
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    let result = await attempt("HEAD");
    if (result.status >= 400) result = await attempt("GET");
    return result;
  } catch (err) {
    return { status: null, finalUrl: url, error: err.name === "AbortError" ? "timed out" : err.message };
  }
}

// Link shorteners that are first-party to their destination, and the one host
// each is allowed to land on. An off-host redirect is normally the signal that
// a domain was parked, sold or repointed, which is worth failing over — but a
// shortener crossing hosts is the entire point of a shortener.
//
// The pair is pinned rather than the source alone: `calendar.app.google` is
// Google's own short domain for appointment schedules and lands on
// `calendar.google.com`. If it ever landed anywhere else, that is exactly the
// kind of change this guard should still catch.
const FIRST_PARTY_SHORTENERS = new Map([["calendar.app.google", "calendar.google.com"]]);

// Fatal: the link is wrong. Warning: the answer says more about the responder
// than about the link.
export function classify({ url, label }, { status, finalUrl, error }) {
  if (error) return { level: "warn", message: `${label || url}: ${error} (${url})` };

  if (status === 404 || status === 410) {
    return { level: "fail", message: `${label || url}: HTTP ${status} (${url})` };
  }

  const from = hostOf(url);
  const to = hostOf(finalUrl);
  const expected = FIRST_PARTY_SHORTENERS.get(from);
  const shortened = expected != null && to === expected;
  if (from && to && !shortened && from.replace(/^www\./, "") !== to.replace(/^www\./, "")) {
    return { level: "fail", message: `${label || url}: redirects off-host to ${finalUrl} (${url})` };
  }

  if (status >= 400) {
    return { level: "warn", message: `${label || url}: HTTP ${status}, likely a bot wall (${url})` };
  }

  return { level: "ok", message: `${label || url}: HTTP ${status}` };
}

async function run() {
  const offline = process.argv.includes("--offline");
  const text = fs.readFileSync(README_PATH, "utf8");
  const links = extractLinks(text);
  const targets = destinations(links);

  const structural = structuralFailures(links);
  console.log(`profile link guard: ${targets.length} destinations, ${structural.length} structural failures`);

  if (structural.length > 0) {
    console.error("\nstructural failures\n");
    for (const f of structural) console.error(`  ${f}`);
  }

  const fails = [];
  const warns = [];

  if (!offline) {
    // Unique URLs only: the practice site appears a dozen times and there is no
    // reason to ask it a dozen questions.
    const byUrl = new Map();
    for (const link of targets) if (!byUrl.has(link.url)) byUrl.set(link.url, link);

    // Ten at a time. Enough to keep the run short, gentle enough that no host
    // sees a burst worth rate-limiting.
    const queue = [...byUrl.values()];
    const workers = Array.from({ length: Math.min(10, queue.length) }, async () => {
      for (let link = queue.shift(); link; link = queue.shift()) {
        const verdict = classify(link, await probe(link.url));
        if (verdict.level === "fail") fails.push(verdict.message);
        else if (verdict.level === "warn") warns.push(verdict.message);
      }
    });
    await Promise.all(workers);

    console.log(`liveness: ${byUrl.size} unique URLs, ${fails.length} broken, ${warns.length} unverified`);

    if (warns.length > 0) {
      console.log("\nunverified (not a failure)\n");
      for (const w of warns.sort()) console.log(`  ${w}`);
    }
    if (fails.length > 0) {
      console.error("\nbroken links\n");
      for (const f of fails.sort()) console.error(`  ${f}`);
    }
  }

  if (structural.length > 0 || fails.length > 0) {
    console.error("\nprofile link guard: failed");
    process.exit(1);
  }

  console.log("profile link guard: clean");
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  await run();
}
