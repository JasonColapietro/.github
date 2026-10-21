// Prints each narration line's start time in the encoded footage, using the same
// segment mapping as build.mjs / mix.mjs, so social beats can be cut by moment.
import fs from "node:fs";

const { frames: allFrames, segments, narration = [] } = JSON.parse(fs.readFileSync(process.argv[2] ?? "timeline-clean.json", "utf8"));
// Drop frames the browser delivered late from before their segment began (it
// happens after a long synchronous pause), and order each segment by capture
// time, since a few frames arrive out of order.
const frames = allFrames
  .filter((f) => f.ts >= segments[f.seg].start - 0.05)
  .sort((a, b) => a.seg - b.seg || a.ts - b.ts);
const firstTs = new Map();
for (const f of frames) if (!firstTs.has(f.seg)) firstTs.set(f.seg, f.ts);
const offsets = [];
let acc = 0;
segments.forEach((seg, k) => {
  offsets[k] = acc;
  if (firstTs.has(k)) acc += seg.end - firstTs.get(k);
});
const segStarts = segments.map((_, k) => offsets[k].toFixed(1)).join(" ");
console.log(`total ${acc.toFixed(1)}s; segment starts: ${segStarts}`);
for (const n of narration) {
  const k = segments.findIndex((seg) => n.t >= seg.start - 0.05 && n.t <= seg.end + 0.05);
  const at = offsets[k] + Math.max(0, n.t - firstTs.get(k));
  const say = JSON.parse(fs.readFileSync(`${n.file}.json`, "utf8")).say;
  console.log(`${at.toFixed(1).padStart(6)}  +${n.dur.toFixed(1)}s  seg${k}  ${say.slice(0, 80)}`);
}
