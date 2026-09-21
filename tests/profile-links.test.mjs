// The link guard has two halves and only one of them is testable without a
// network. These tests cover the structural half in full — it is the half that
// is always fatal, so a false positive here turns CI red on a correct README —
// plus the classifier, which decides whether a live answer is a defect or a
// bot wall. `probe` itself is not exercised: it is a fetch with a timeout, and
// stubbing fetch would only test the stub.
//
// Every structural case is also run against the real README, so a defect
// reintroduced there fails here rather than waiting for a scheduled run.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  extractLinks,
  destinations,
  structuralFailures,
  classify,
  README_PATH,
} from "../scripts/check-profile-links.mjs";

const README = fs.readFileSync(README_PATH, "utf8");

test("the real README has no structural link failures", () => {
  const failures = structuralFailures(extractLinks(README));
  assert.deepEqual(failures, [], failures.join("\n"));
});

test("the README's links are found at all", () => {
  // A pattern that silently matches nothing would make every check above pass
  // on an empty set, which is the quiet failure this guard exists to avoid.
  const targets = destinations(extractLinks(README));
  assert.ok(targets.length > 50, `expected the README's many links, found ${targets.length}`);
  assert.ok(
    targets.some((t) => t.url.startsWith("https://seo.suedeai.ai")),
    "the practice site should be among the destinations"
  );
});

test("badge and stats images are not treated as destinations", () => {
  const md = "[![Free check](https://img.shields.io/badge/a-b-c)](https://seo.suedeai.ai/x)";
  const targets = destinations(extractLinks(md));
  assert.deepEqual(targets.map((t) => t.url), ["https://seo.suedeai.ai/x"]);
});

test("one ASIN linked as two titles fails", () => {
  // The 2026-09-21 defect, kept as a regression: *The Guitar Without a Number*
  // and *Suede Labs: The Human Authenticity Layer* both pointed at B0GD5FX6N6.
  const md = [
    "**[The Guitar Without a Number](https://www.amazon.com/dp/B0GD5FX6N6)** — Kindle",
    "**[Suede Labs: The Human Authenticity Layer](https://www.amazon.com/dp/B0GD5FX6N6)** — Kindle",
  ].join("\n\n");
  const failures = structuralFailures(extractLinks(md));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /B0GD5FX6N6 is linked as 2 different titles/);
});

test("one ASIN linked twice under one title is fine", () => {
  const md = [
    "[Stake Your Claim](https://www.amazon.com/dp/B0GRG8LGQQ)",
    "[Stake Your Claim](https://www.amazon.com/dp/B0GRG8LGQQ)",
  ].join("\n\n");
  assert.deepEqual(structuralFailures(extractLinks(md)), []);
});

test("one host spelled two ways fails", () => {
  const md = "[IG](https://instagram.com/suedeai) and [IG again](https://www.instagram.com/suedeai)";
  const failures = structuralFailures(extractLinks(md));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /instagram\.com is spelled 2 ways/);
});

test("a plaintext http link fails", () => {
  const failures = structuralFailures(extractLinks("[old](http://suedeai.ai)"));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /plaintext http link/);
});

test("the same site under many honest labels is not a failure", () => {
  // The practice site is linked a dozen times with a dozen different anchors,
  // which is correct. Only the ASIN rule asserts uniqueness.
  const md = [
    "[Suede AI SEO](https://seo.suedeai.ai)",
    "[the practice](https://seo.suedeai.ai)",
    "[Read the method](https://seo.suedeai.ai)",
  ].join("\n\n");
  assert.deepEqual(structuralFailures(extractLinks(md)), []);
});

test("404 and 410 are failures, a bot wall is not", () => {
  const link = { url: "https://example.com/a", label: "A" };
  assert.equal(classify(link, { status: 404, finalUrl: link.url }).level, "fail");
  assert.equal(classify(link, { status: 410, finalUrl: link.url }).level, "fail");
  assert.equal(classify(link, { status: 403, finalUrl: link.url }).level, "warn");
  assert.equal(classify(link, { status: 429, finalUrl: link.url }).level, "warn");
  assert.equal(classify(link, { status: 503, finalUrl: link.url }).level, "warn");
  assert.equal(classify(link, { status: 200, finalUrl: link.url }).level, "ok");
});

test("a timeout is unverified, not broken", () => {
  const link = { url: "https://example.com/a", label: "A" };
  const verdict = classify(link, { status: null, finalUrl: link.url, error: "timed out" });
  assert.equal(verdict.level, "warn");
  assert.match(verdict.message, /timed out/);
});

test("a first-party shortener may cross hosts, but only to its own target", () => {
  // CI caught this one: the booking badge points at Google's own short domain
  // for appointment schedules, which lands on calendar.google.com by design.
  // The pair is pinned, so a shortener repointed somewhere else still fails.
  const booking = { url: "https://calendar.app.google/8FyvYAspZaQFFP5eA", label: "Book a call" };
  assert.equal(
    classify(booking, {
      status: 200,
      finalUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2i5EvP",
    }).level,
    "ok"
  );
  assert.equal(
    classify(booking, { status: 200, finalUrl: "https://parked-domain.example/" }).level,
    "fail"
  );
});

test("an off-host redirect fails, a www or path redirect does not", () => {
  const link = { url: "https://guitar.solutions", label: "The Signal Chain" };
  assert.equal(
    classify(link, { status: 200, finalUrl: "https://strumly.suedeai.ai/book" }).level,
    "fail"
  );
  assert.equal(classify(link, { status: 200, finalUrl: "https://www.guitar.solutions/" }).level, "ok");
  assert.equal(classify(link, { status: 200, finalUrl: "https://guitar.solutions/book" }).level, "ok");
});
