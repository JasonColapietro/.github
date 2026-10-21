// Voices the 60-second social cut's lines with Kokoro bf_emma (sid 7) into vo-social/.
const fs = require("node:fs");
const path = require("node:path");
const sherpa = require(path.join(__dirname, "tts-runtime/node_modules/sherpa-onnx-node"));

const M = path.join(__dirname, "kokoro-model");
const OUT = path.join(__dirname, "vo-social");
fs.mkdirSync(OUT, { recursive: true });
const tts = new sherpa.OfflineTts({
  model: { kokoro: { model: `${M}/model.int8.onnx`, voices: `${M}/voices.bin`, tokens: `${M}/tokens.txt`, dataDir: `${M}/espeak-ng-data` }, numThreads: 4, provider: "cpu", debug: false },
  maxNumSentences: 1,
});

const lines = JSON.parse(fs.readFileSync(path.join(__dirname, "social-beats.json"), "utf8"));
const meta = {};
for (const beat of lines) {
  const a = tts.generate({ text: beat.say, sid: 7, speed: 1.05 });
  const file = path.join(OUT, `${beat.id}.wav`);
  sherpa.writeWave(file, { samples: a.samples, sampleRate: a.sampleRate });
  meta[beat.id] = a.samples.length / a.sampleRate;
  console.log(beat.id, meta[beat.id].toFixed(2) + "s", beat.say);
}
fs.writeFileSync(path.join(OUT, "durations.json"), JSON.stringify(meta, null, 2));
