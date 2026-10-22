// Lays the Kokoro narration clips logged in timeline.json onto the encoded video.
// Wall-clock times map to output time the same way build.mjs lays out frames:
// each segment starts at its first frame and runs to its recorded end.
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const [video, out] = [process.argv[2], process.argv[3]];
const { frames: allFrames, segments, narration = [] } = JSON.parse(fs.readFileSync("timeline.json", "utf8"));
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

const placed = [];
for (const n of narration) {
  const k = segments.findIndex((seg) => n.t >= seg.start - 0.05 && n.t <= seg.end + 0.05);
  if (k < 0 || !firstTs.has(k)) { console.warn("unplaced clip", n.file); continue; }
  const at = offsets[k] + Math.max(0, n.t - firstTs.get(k));
  const overrun = at + n.dur - (offsets[k] + (segments[k].end - firstTs.get(k)));
  if (overrun > 0.05) console.warn(`clip runs ${overrun.toFixed(2)}s past its segment`, n.file);
  placed.push({ file: n.file, at });
}
console.log(`placing ${placed.length} clips on ${acc.toFixed(1)}s of video`);

const args = ["-y", "-hide_banner", "-loglevel", "error", "-i", video];
for (const p of placed) args.push("-i", p.file);
const chains = placed.map((p, i) => {
  const ms = Math.round(p.at * 1000);
  return `[${i + 1}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${ms}|${ms}[a${i}]`;
});
const mix = `${placed.map((_, i) => `[a${i}]`).join("")}amix=inputs=${placed.length}:normalize=0:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad[aout]`;
args.push(
  "-filter_complex", [...chains, mix].join(";"),
  "-map", "0:v", "-map", "[aout]",
  "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out,
);
execFileSync("ffmpeg", args, { stdio: "inherit" });
console.log("wrote", out);
