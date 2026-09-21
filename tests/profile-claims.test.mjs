// The guard's weak point is not arithmetic, it is pattern rot: reword a
// sentence in the README and a claim stops being checked while CI stays green.
// These tests run the real patterns against the real README, so a wording
// change fails here rather than going quiet.
//
// The network half (countSkills, countUpstream) is not exercised. It needs the
// GitHub search endpoint, which is unavailable in some sandboxes, and stubbing
// it would only test the stub.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { claimsFor, audit, readClaimed, countUpstream, README_PATH } from "../scripts/check-profile-claims.mjs";

const README = fs.readFileSync(README_PATH, "utf8");

// Read the baseline out of the README rather than pinning it here. A hardcoded
// fixture goes stale the moment `--fix` updates a count, and these tests would
// then fail on a correct README, leaving the repair path unable to restore CI
// on its own. These tests are about pattern integrity and internal agreement,
// not about which numbers are currently true; the live check owns that.
const CURRENT = readClaimed(README);

test("every claim pattern still matches the README", () => {
  const missing = [];
  for (const claim of claimsFor(CURRENT)) {
    if (!new RegExp(claim.re.source).test(README)) missing.push(claim.label);
  }
  assert.deepEqual(missing, [], `these claims no longer match the README: ${missing.join(", ")}`);
});

test("the README agrees with the counts it currently states", () => {
  const { failures } = audit(README, claimsFor(CURRENT));
  assert.deepEqual(failures, [], failures.join("\n"));
});

test("drift in any single count is reported", () => {
  for (const key of ["skills", "prs", "repos"]) {
    const skewed = { ...CURRENT, [key]: CURRENT[key] + 1 };
    const { failures } = audit(README, claimsFor(skewed));
    assert.ok(failures.length > 0, `a wrong ${key} count was not reported`);
    assert.ok(
      failures.every((f) => f.includes("live count is")),
      `drift in ${key} should report a count mismatch, got: ${failures.join("; ")}`
    );
  }
});

test("a reworded claim is reported rather than silently skipped", () => {
  const reworded = README.replace("**Totals:**", "**Grand totals:**");
  const { failures } = audit(reworded, claimsFor(CURRENT));
  assert.ok(
    failures.some((f) => f.includes("no longer guarded")),
    "rewording a guarded sentence should fail loudly"
  );
});

test("--fix rewrites every occurrence, including the restated counts", () => {
  const bumped = { skills: 80, prs: 52, repos: 47 };
  const { updated } = audit(README, claimsFor(bumped), { rewrite: true });
  const { failures } = audit(updated, claimsFor(bumped));
  assert.deepEqual(failures, [], `rewrite left drift behind:\n${failures.join("\n")}`);
});

test("a --fix run leaves the suite green without a second edit", () => {
  // The cycle that matters: a count moves, --fix rewrites the README, and the
  // next CI run must pass on that README alone. A pinned fixture broke this.
  const moved = { skills: 91, prs: 63, repos: 58 };
  const { updated } = audit(README, claimsFor(moved), { rewrite: true });

  assert.deepEqual(readClaimed(updated), moved, "the rewritten README does not read back as the new counts");

  const baseline = readClaimed(updated);
  const { failures } = audit(updated, claimsFor(baseline));
  assert.deepEqual(failures, [], `the suite would still fail after --fix:\n${failures.join("\n")}`);
});

test("rewriting does not touch unrelated numbers", () => {
  const bumped = { skills: 80, prs: 52, repos: 47 };
  const { updated } = audit(README, claimsFor(bumped), { rewrite: true });
  // A catalog pull request that happens to be numbered 49, and the patent
  // number, must survive a rewrite of the totals.
  assert.ok(updated.includes("awesome-skills/pull/49"), "a same-valued PR link was rewritten");
  assert.ok(updated.includes("63/947,120"), "the patent number was rewritten");
  assert.ok(updated.includes("12%2C280"), "the contributions badge was rewritten");
});

// This one does stub fetch, deliberately. It is not testing GitHub; it is
// testing the branch that decides whether a 200 response can be trusted, and
// that branch cannot be reached with a real, healthy API.
test("a timed-out search is refused rather than counted", async () => {
  const real = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        incomplete_results: true,
        items: [
          {
            html_url: "https://github.com/someone/repo/pull/1",
            repository_url: "https://api.github.com/repos/someone/repo",
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  try {
    await assert.rejects(countUpstream(), /incomplete_results/);
  } finally {
    globalThis.fetch = real;
  }
});
