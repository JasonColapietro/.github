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

// The split halves get the same treatment, and for the same reason: pinning 29
// and 21 here would go stale the moment the total moves and a person restates
// them, which is precisely the maintenance this guard exists to demand. Read
// them through the claim's own patterns, so there is one definition of where
// those numbers live.
const SPLIT = claimsFor(CURRENT).find((claim) => claim.parts);

const readSplit = (text) => SPLIT.parts.map((re) => Number(text.match(re)[1]));

// Restate one half in place, at the capture group's own offsets, so this helper
// cannot land on a neighbouring digit run the way the guard's rewrite once did.
function restateHalf(text, half, next) {
  const [start, end] = text.match(new RegExp(SPLIT.parts[half].source, "d")).indices[1];
  return text.slice(0, start) + String(next) + text.slice(end);
}

test("every claim pattern still matches the README", () => {
  const missing = [];
  for (const claim of claimsFor(CURRENT)) {
    // A split claim carries several patterns; every one of them has to land.
    const patterns = claim.parts ?? [claim.re];
    if (!patterns.every((re) => new RegExp(re.source).test(README))) missing.push(claim.label);
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
  // The pull request count is left out of this one on purpose: moving it is the
  // one drift a rewrite cannot finish, because the substantive/catalog split
  // underneath it is a judgement. The test below covers that case.
  const bumped = { ...CURRENT, skills: 80, repos: 47 };
  const { updated } = audit(README, claimsFor(bumped), { rewrite: true });
  const { failures } = audit(updated, claimsFor(bumped));
  assert.deepEqual(failures, [], `rewrite left drift behind:\n${failures.join("\n")}`);
});

test("a --fix run leaves the suite green without a second edit", () => {
  // The cycle that matters: a count moves, --fix rewrites the README, and the
  // next CI run must pass on that README alone. A pinned fixture broke this.
  const moved = { ...CURRENT, skills: 91, repos: 58 };
  const { updated } = audit(README, claimsFor(moved), { rewrite: true });

  assert.deepEqual(readClaimed(updated), moved, "the rewritten README does not read back as the new counts");

  const baseline = readClaimed(updated);
  const { failures } = audit(updated, claimsFor(baseline));
  assert.deepEqual(failures, [], `the suite would still fail after --fix:\n${failures.join("\n")}`);
});

test("a moved pull request count needs the split restated before it goes green", () => {
  // The exception to the cycle above, and the point of guarding the split: when
  // the total moves, --fix does its half and CI keeps failing until a person
  // decides which side of the breakdown absorbed the new pull request.
  const moved = { ...CURRENT, prs: CURRENT.prs + 1 };
  const { updated } = audit(README, claimsFor(moved), { rewrite: true });

  const afterFix = audit(updated, claimsFor(moved)).failures;
  assert.deepEqual(
    afterFix.map((f) => f.split(":")[0]),
    ["totals note, substantive and catalog split"],
    `the split should be the only thing left to do:\n${afterFix.join("\n")}`
  );

  // Restating it by hand is all that remains, and then the README stands alone.
  const [substantive] = readSplit(updated);
  const restated = restateHalf(updated, 0, substantive + 1);
  assert.deepEqual(audit(restated, claimsFor(moved)).failures, [], "restating the split did not clear the guard");
});

test("--fix separates what it can repair from what it cannot", () => {
  // Rewriting fixes a number. It cannot fix a pattern that stopped matching, and
  // `--fix` used to return 0 on one, reporting success over an unguarded claim
  // while the verify path was telling people to run `--fix` for exactly that.
  const reworded = README.replace("**Totals:**", "**Grand totals:**");
  const { unguarded, updated } = audit(reworded, claimsFor(CURRENT), { rewrite: true });
  assert.ok(
    unguarded.some((f) => f.includes("totals line")),
    `a reworded claim is not listed as unrepairable: ${unguarded.join("; ")}`
  );
  assert.equal(updated, reworded, "a rewrite has nothing to change when the pattern is gone");

  // A plain count drift stays repairable, so `--fix` must not refuse that run.
  // The repository count has no breakdown under it, so it repairs cleanly.
  const drifted = audit(README, claimsFor({ ...CURRENT, repos: CURRENT.repos + 1 }), { rewrite: true });
  assert.deepEqual(drifted.unguarded, [], "an ordinary count drift should still be repairable");
  assert.ok(drifted.updated !== README, "an ordinary count drift should still be rewritten");
});

test("a rewrite lands on the count, not on an earlier digit run in the badge URL", () => {
  // The URL carries its own digits inside %20 and %2F. A string search for the
  // captured digits hit those first: a repository count of 20 rewrote "%20PRs"
  // to "%21PRs", and a count of 202 published 302.
  for (const repos of [20, 202]) {
    const line = `![x](https://img.shields.io/badge/upstream%20merged-50%20PRs%20%2F%20${repos}%20repos-blue)`;
    const { updated } = audit(line, claimsFor({ skills: 76, prs: 50, repos: repos + 1 }), { rewrite: true });
    assert.ok(updated.includes(`%2F%20${repos + 1}%20repos`), `a count of ${repos} rewrote wrong: ${updated}`);
    assert.ok(updated.includes("upstream%20merged-50%20PRs"), `the URL escapes were damaged: ${updated}`);
  }
});

test("the split still adds up to the pull request count it breaks down", () => {
  // 29 substantive + 21 catalog listings = the 50 the badge states. Nothing
  // derives the halves, so this sum is the only mechanical check available.
  const { failures } = audit(README, claimsFor(CURRENT));
  assert.deepEqual(failures, [], failures.join("\n"));
});

test("a total that moved past the split is reported, and --fix refuses it", () => {
  // The case that motivated this: --fix raises 50 to 51 everywhere it can, and
  // 29 + 21 quietly goes on describing a number the README no longer states.
  const moved = { ...CURRENT, prs: CURRENT.prs + 1 };
  const { failures, unguarded, updated } = audit(README, claimsFor(moved), { rewrite: true });

  const split = (f) => f.includes("substantive and catalog split");
  assert.ok(failures.some(split), `the split was not checked against the new total: ${failures.join("; ")}`);
  assert.ok(unguarded.some(split), "a split that no longer adds up must not be reported as repairable");

  // The counts it can repair are still repaired; only the split is left alone.
  assert.ok(updated.includes(`**Totals:** ${moved.prs} merged pull requests`), "the repairable counts were not rewritten");
  assert.deepEqual(
    readSplit(updated),
    readSplit(README),
    "a rewrite guessed at the split instead of leaving it to a person"
  );
});

test("a reworded half of the split is reported rather than silently skipped", () => {
  const reworded = README.replace("accepted listings", "accepted catalog listings");
  assert.notEqual(reworded, README, "this test rewords a phrase the README no longer uses");
  const { failures } = audit(reworded, claimsFor(CURRENT));
  assert.ok(
    failures.some((f) => f.includes("substantive and catalog split") && f.includes("no longer guarded")),
    `rewording half the split should fail loudly: ${failures.join("; ")}`
  );
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
