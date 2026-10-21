// Re-voices every cached narration line (vo/*.json) with another Kokoro speaker,
// writing clips under the same cache keys lib.mjs computes for that speaker.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const sherpa = require(path.join(__dirname, "tts-runtime/node_modules/sherpa-onnx-node"));

const SID = Number(process.argv[2]);
const SPEED = Number(process.env.VO_SPEED ?? 1.0);
const VO = path.join(__dirname, "vo");
const M = path.join(__dirname, "kokoro-model");
const tts = new sherpa.OfflineTts({
  model: { kokoro: { model: `${M}/model.int8.onnx`, voices: `${M}/voices.bin`, tokens: `${M}/tokens.txt`, dataDir: `${M}/espeak-ng-data` }, numThreads: 4, provider: "cpu", debug: false },
  maxNumSentences: 1,
});

const lines = [...new Set(fs.readdirSync(VO).filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(VO, f), "utf8")).say))];
let made = 0;
for (const say of lines) {
  const key = crypto.createHash("sha1").update(`${SID}|${SPEED}|${say}`).digest("hex").slice(0, 16);
  const file = path.join(VO, `${key}.wav`);
  if (fs.existsSync(`${file}.json`)) continue;
  const a = tts.generate({ text: say, sid: SID, speed: SPEED });
  sherpa.writeWave(file, { samples: a.samples, sampleRate: a.sampleRate });
  const dur = a.samples.length / a.sampleRate;
  fs.writeFileSync(`${file}.json`, JSON.stringify({ dur, say }));
  made += 1;
  console.log(`${made}/${lines.length}`, dur.toFixed(1) + "s", say.slice(0, 50));
}
console.log("done", made, "new clips for speaker", SID);
