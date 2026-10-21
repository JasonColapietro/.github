"""Original background bed for the Suede AI Agent Studio walkthrough.

Synthesized from scratch (no samples), in the harmonic language of the Studio's
"Live Canvas" motion film: D major, the D - Bm - G - A progression, a soft pad,
an FM electric piano, a round bass, a marimba-like mallet and light drums.

usage: python3 -I music.py <seconds> <out.wav>
"""
import sys
import wave

import numpy as np

SR = 44100
BPM = 96.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(7)

DUR = float(sys.argv[1])
OUT = sys.argv[2]
N = int((DUR + 3.0) * SR)
dry = np.zeros((2, N))
send = np.zeros((2, N))  # reverb send

NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def hz(name):
    pitch, octave = name[:-1], int(name[-1])
    midi = 12 * (octave + 1) + NOTE[pitch]
    return 440.0 * 2 ** ((midi - 69) / 12)


def place(sig, t, pan=0.0, gain=1.0, rev=0.0):
    """Add a mono signal at time t (seconds) with constant-power pan."""
    i = int(max(0.0, t) * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    left = np.cos((pan + 1) * np.pi / 4)
    right = np.sin((pan + 1) * np.pi / 4)
    dry[0, i:i + len(sig)] += sig * left
    dry[1, i:i + len(sig)] += sig * right
    if rev:
        send[0, i:i + len(sig)] += sig * left * rev
        send[1, i:i + len(sig)] += sig * right * rev


def tvec(seconds):
    return np.arange(int(seconds * SR)) / SR


def release(env, rel):
    n = min(len(env), int(rel * SR))
    if n > 0:
        env[-n:] *= np.linspace(1.0, 0.0, n)
    return env


def pad(names, t, length, vel):
    d = length + 1.6
    x = tvec(d)
    env = np.minimum(1.0, x / 1.4)
    env = release(env * np.where(x > length, np.exp(-(x - length) / 0.6), 1.0), 0.3)
    for k, name in enumerate(names):
        f = hz(name)
        for cents, pan in ((-5, -0.55), (0, 0.0), (5, 0.55)):
            ff = f * 2 ** (cents / 1200)
            ph = rng.uniform(0, 2 * np.pi)
            s = np.sin(2 * np.pi * ff * x + ph) + 0.32 * np.sin(4 * np.pi * ff * x + ph) + 0.1 * np.sin(6 * np.pi * ff * x)
            place(s * env, t, pan=pan * (0.6 + 0.1 * k), gain=0.05 * vel, rev=0.7)


def ep(names, t, length, vel):
    d = length + 1.2
    x = tvec(d)
    index = 1.8 * np.exp(-x / 0.3) + 0.25
    amp = np.minimum(1.0, x / 0.004) * np.exp(-x / 1.15)
    amp = release(amp * np.where(x > length, np.exp(-(x - length) / 0.25), 1.0), 0.05)
    for k, name in enumerate(names):
        f = hz(name)
        s = np.sin(2 * np.pi * f * x + index * np.sin(2 * np.pi * f * x))
        s += 0.18 * np.sin(2 * np.pi * 2 * f * x) * np.exp(-x / 0.4)
        place(s * amp, t + 0.006 * k, pan=-0.25 + 0.17 * k, gain=0.075 * vel, rev=0.3)


def bass(name, t, length, vel):
    x = tvec(length + 0.4)
    f = hz(name)
    s = np.sin(2 * np.pi * f * x) + 0.22 * np.sin(4 * np.pi * f * x) + 0.06 * np.sin(6 * np.pi * f * x)
    amp = np.minimum(1.0, x / 0.008) * np.exp(-x / 1.0)
    amp = release(amp * np.where(x > length, np.exp(-(x - length) / 0.08), 1.0), 0.02)
    place(s * amp, t, pan=0.0, gain=0.15 * vel)


def mallet(name, t, vel, pan=0.25):
    x = tvec(1.4)
    f = hz(name)
    s = np.sin(2 * np.pi * f * x) * np.exp(-x / 0.38) + 0.22 * np.sin(2 * np.pi * 4.0 * f * x) * np.exp(-x / 0.05)
    s *= np.minimum(1.0, x / 0.002)
    place(s, t, pan=pan, gain=0.085 * vel, rev=0.4)


def kick(t, vel):
    x = tvec(0.45)
    f = 44 + 70 * np.exp(-x / 0.035)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.26)
    place(s, t, gain=0.3 * vel)


def hpnoise(seconds, decay):
    x = tvec(seconds)
    n = np.diff(rng.standard_normal(len(x) + 2), 2)
    return n * np.exp(-x / decay) * np.minimum(1.0, x / 0.001)


def rim(t, vel):
    x = tvec(0.12)
    s = 0.6 * hpnoise(0.12, 0.012) + np.sin(2 * np.pi * 1750 * x) * np.exp(-x / 0.012)
    place(s, t, pan=-0.12, gain=0.07 * vel, rev=0.15)


def hat(t, vel, open_=False):
    place(hpnoise(0.25, 0.07 if open_ else 0.025), t, pan=0.3, gain=0.011 * vel)


PROG = [
    (["D3", "A3", "D4", "F#4"], ["D4", "A4", "E5", "F#5"], "D2", ["D5", "A4", "F#5", "A4"]),
    (["B2", "F#3", "B3", "D4"], ["B3", "F#4", "C#5", "D5"], "B1", ["B4", "F#4", "D5", "F#4"]),
    (["G2", "D3", "G3", "B3"], ["G3", "D4", "A4", "B4"], "G1", ["G4", "D5", "B4", "D5"]),
    (["A2", "E3", "A3", "C#4"], ["A3", "E4", "B4", "C#5"], "A1", ["A4", "E5", "C#5", "E4"]),
]

END = DUR - 7.5  # last full bar starts before this; then a held final chord
INTRO = 2 * BAR
bars = int(END // BAR)
for b in range(bars):
    t0 = b * BAR
    keys, pad_notes, root, arp = PROG[b % 4]
    # 16-bar cycle: 10 bars full, then 6 lighter bars (no drums, softer keys).
    phase = (b - 2) % 16 if b >= 2 else -1
    light = b < 2 or phase >= 10
    jitter = lambda: rng.normal(0, 0.004)
    vel = lambda base: base * rng.uniform(0.9, 1.05)
    pad(pad_notes, t0, BAR, 0.9 if light else 0.75)
    if b >= 1:
        for i, beat in enumerate((0, 1, 2, 3)):
            mallet(arp[i], t0 + beat * BEAT + jitter(), vel(0.8 if beat == 2 else 0.6), pan=0.35 if i % 2 else 0.15)
    if b < 2:
        continue
    ep(keys, t0 + jitter(), 1.5 * BEAT, vel(0.55 if light else 0.8))
    ep(keys, t0 + 2.5 * BEAT + jitter(), 1.2 * BEAT, vel(0.4 if light else 0.6))
    bass(root, t0 + jitter(), 1.5 * BEAT, vel(0.7 if light else 0.9))
    bass(root, t0 + 2.5 * BEAT + jitter(), 1.0 * BEAT, vel(0.55 if light else 0.7))
    if not light:
        kick(t0 + jitter(), vel(0.9))
        kick(t0 + 2 * BEAT + jitter(), vel(0.75))
        rim(t0 + BEAT + jitter(), vel(0.9))
        rim(t0 + 3 * BEAT + jitter(), vel(0.85))
        for e in range(8):
            hat(t0 + e * BEAT / 2 + jitter(), vel(1.0 if e % 2 else 0.6), open_=(e == 7))

# Ending: a held D add9 chord, low D and a rising mallet run.
tend = bars * BAR
pad(["D3", "A3", "E4", "F#4"], tend, DUR - tend + 0.5, 1.0)
ep(["D3", "A3", "D4", "F#4", "A4"], tend, DUR - tend, 0.85)
bass("D2", tend, 2.5, 0.9)
for k, name in enumerate(["D5", "E5", "F#5", "A5", "B5", "D6"]):
    mallet(name, tend - 0.62 + 0.1 * k, 0.5 + 0.06 * k)

# Reverb: stereo exponentially decaying noise, darkened, FFT-convolved with the send bus.
ir_len = int(2.6 * SR)
x = np.arange(ir_len) / SR
kernel = np.ones(24) / 24
irs = []
for ch in range(2):
    noise = np.convolve(rng.standard_normal(ir_len), kernel, mode="same")
    irs.append(noise * np.exp(-x / 0.55) * np.minimum(1.0, x / 0.012))
size = 1 << int(np.ceil(np.log2(N + ir_len)))
wet = np.zeros_like(dry)
for ch in range(2):
    spec = np.fft.rfft(send[ch], size) * np.fft.rfft(irs[ch], size)
    wet[ch] = np.fft.irfft(spec, size)[:N]
wet *= 0.9 * np.max(np.abs(dry)) / (np.max(np.abs(wet)) + 1e-9)
mix = dry + 0.35 * wet

# Gentle master: fade in/out, soft clip, normalize to -1 dBFS peak.
n = int(DUR * SR)
mix = mix[:, :n]
fade_in = int(2.0 * SR)
mix[:, :fade_in] *= np.linspace(0, 1, fade_in)
fade_out = int(4.0 * SR)
mix[:, -fade_out:] *= np.linspace(1, 0, fade_out) ** 1.5
mix = np.tanh(0.6 * mix / (np.max(np.abs(mix)) + 1e-9)) / np.tanh(0.6)
mix *= 0.89

pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"wrote {OUT}: {DUR:.1f}s, {bars} bars at {BPM:.0f} BPM")
