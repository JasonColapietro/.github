// Re-voices every cached narration line (vo/*.json) with another Kokoro v1.0 voice,
// writing clips under the same cache keys lib.mjs computes for that voice, so the
// next take plays at natural pace. usage: VO_VOICE=af_heart node pregen.cjs
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");

const VOICE = process.env.VO_VOICE ?? "bf_emma";
const SPEED = Number(process.env.VO_SPEED ?? 1.0);
const VO = path.join(__dirname, "vo");
const KOKORO_DIR = process.env.KOKORO_DIR ?? path.join(__dirname, "kokoro-multi-lang-v1_0");
const KOKORO_PY = process.env.KOKORO_PY ?? "python3";

const lines = [...new Set(fs.readdirSync(VO).filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(VO, f), "utf8")).say))];
const jobs = lines.flatMap((say) => {
  const key = crypto.createHash("sha1").update(`kokoro-v1.0|${VOICE}|${SPEED}|${say}`).digest("hex").slice(0, 16);
  const out = path.join(VO, `${key}.wav`);
  return fs.existsSync(`${out}.json`) ? [] : [{ text: say, out, voice: VOICE, speed: SPEED }];
});
if (jobs.length) {
  const jobFile = path.join(VO, "pregen-jobs.json");
  fs.writeFileSync(jobFile, JSON.stringify(jobs));
  const results = execFileSync(KOKORO_PY, ["-I", path.join(__dirname, "kokoro_v1.py"), KOKORO_DIR, jobFile], { encoding: "utf8", maxBuffer: 1 << 26 })
    .trim().split("\n").map((l) => JSON.parse(l));
  for (const [i, r] of results.entries()) {
    fs.writeFileSync(`${r.out}.json`, JSON.stringify({ dur: r.dur, say: jobs[i].text, voice: `kokoro-v1.0 ${VOICE}`, phonemes: r.phonemes }));
  }
  fs.rmSync(jobFile);
}
console.log("done", jobs.length, "new clips for", VOICE);
