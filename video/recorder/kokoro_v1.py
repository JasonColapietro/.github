"""Kokoro v1.0 narration: misaki British G2P (the phonemizer Kokoro v1.0 was
trained with) feeding the official k2-fsa ONNX export of Kokoro-82M v1.0.

usage: python -I kokoro_v1.py <model dir> <jobs.json | ->
jobs.json: [{"text": "...", "out": "clip.wav", "voice": "bf_emma", "speed": 1.0}, ...]
With "-", it reads one job per line from stdin, which keeps the model loaded
for the recorder. Prints one JSON line per job: {"out", "dur", "phonemes"}.
"""
import json
import sys
import wave

import numpy as np
import onnxruntime as ort
from misaki import en, espeak

MODEL_DIR, JOBS = sys.argv[1], sys.argv[2]

sess = ort.InferenceSession(f"{MODEL_DIR}/model.onnx", providers=["CPUExecutionProvider"])
meta = sess.get_modelmeta().custom_metadata_map
speaker2id = dict(p.split("->") for p in meta["speaker2id"].split(","))
voices = np.fromfile(f"{MODEL_DIR}/voices.bin", dtype=np.float32).reshape(-1, 510, 256)

vocab = {}
with open(f"{MODEL_DIR}/tokens.txt", encoding="utf-8") as f:
    for line in f:
        line = line.rstrip("\n")
        if not line:
            continue
        sym, _, idx = line.rpartition(" ")
        vocab[sym if sym else " "] = int(idx)

g2p = en.G2P(trf=False, british=True, fallback=espeak.EspeakFallback(british=True))


def synth(text, voice, speed):
    phonemes, _ = g2p(text)
    ids = [vocab[c] for c in phonemes if c in vocab]
    dropped = {c for c in phonemes if c not in vocab}
    if dropped:
        print(f"warn: dropped {sorted(dropped)} in {text!r}", file=sys.stderr)
    if len(ids) > 510:
        raise SystemExit(f"too long ({len(ids)} tokens): {text!r}")
    # Same as KPipeline: the style row is picked by phoneme count.
    style = voices[int(speaker2id[voice])][len(ids) - 1][None, :]
    audio = sess.run(None, {
        "tokens": np.array([[0, *ids, 0]], dtype=np.int64),
        "style": style.astype(np.float32),
        "speed": np.array([speed], dtype=np.float32),
    })[0].reshape(-1)
    return phonemes, audio


def run(job):
    phonemes, audio = synth(job["text"], job.get("voice", "bf_emma"), float(job.get("speed", 1.0)))
    pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
    with wave.open(job["out"], "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(24000)
        w.writeframes(pcm.tobytes())
    print(json.dumps({"out": job["out"], "dur": len(pcm) / 24000, "phonemes": phonemes}), flush=True)


jobs = (json.loads(line) for line in sys.stdin if line.strip()) if JOBS == "-" else json.load(open(JOBS))
for job in jobs:
    run(job)
