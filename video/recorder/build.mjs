// Turns frames/ + timeline.json from record.mjs into an H.264 MP4 at 30 fps.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const out = process.argv[2] || "walkthrough.mp4";
const { frames: allFrames, segments } = JSON.parse(fs.readFileSync("timeline.json", "utf8"));
// Drop frames the browser delivered late from before their segment began (it
// happens after a long synchronous pause), and order each segment by capture
// time, since a few frames arrive out of order.
const frames = allFrames
  .filter((f) => f.ts >= segments[f.seg].start - 0.05)
  .sort((a, b) => a.seg - b.seg || a.ts - b.ts);
const lines = [];
let total = 0;
frames.forEach((f, i) => {
  const next = frames[i + 1];
  let dur = next && next.seg === f.seg ? next.ts - f.ts : segments[f.seg].end - f.ts;
  dur = Math.max(0.001, Math.min(dur, 60));
  total += dur;
  lines.push(`file 'frames/${f.file}'`, `duration ${dur.toFixed(4)}`);
});
lines.push(`file 'frames/${frames[frames.length - 1].file}'`);
fs.writeFileSync("concat.txt", lines.join("\n") + "\n");
console.log(`frames ${frames.length}, segments ${segments.length}, length ${total.toFixed(1)}s`);
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", "concat.txt",
  "-vf", "fps=30,scale=1920:1080:flags=lanczos,format=yuv420p", "-c:v", "libx264", "-preset", process.env.PRESET || "slow", "-crf", "18",
  "-movflags", "+faststart", out], { stdio: "inherit" });
console.log("wrote", out);
