// Voices the 60-second social cut's lines with Kokoro v1.0 bf_emma into vo-social/,
// through kokoro_v1.py (misaki British G2P). Uses KOKORO_DIR and KOKORO_PY like lib.mjs.
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const VOICE = process.env.VO_VOICE ?? "bf_emma";
const SPEED = Number(process.env.VO_SPEED ?? 1.0);
const KOKORO_DIR = process.env.KOKORO_DIR ?? path.join(__dirname, "kokoro-multi-lang-v1_0");
const KOKORO_PY = process.env.KOKORO_PY ?? "python3";
const OUT = path.join(__dirname, "vo-social");
fs.mkdirSync(OUT, { recursive: true });

const beats = JSON.parse(fs.readFileSync(path.join(__dirname, "social-beats.json"), "utf8"));
const jobs = beats.map((beat) => ({ text: beat.say, out: path.join(OUT, `${beat.id}.wav`), voice: VOICE, speed: SPEED }));
const jobFile = path.join(OUT, "jobs.json");
fs.writeFileSync(jobFile, JSON.stringify(jobs));
const results = execFileSync(KOKORO_PY, ["-I", path.join(__dirname, "kokoro_v1.py"), KOKORO_DIR, jobFile], { encoding: "utf8" })
  .trim().split("\n").map((l) => JSON.parse(l));
fs.rmSync(jobFile);
const meta = {};
for (const [i, r] of results.entries()) {
  meta[beats[i].id] = r.dur;
  console.log(beats[i].id, r.dur.toFixed(2) + "s", beats[i].say);
}
fs.writeFileSync(path.join(OUT, "durations.json"), JSON.stringify(meta, null, 2));
