"""Builds the 60-second social cut, vertical (1080x1920) and horizontal
(1920x1080), from the caption-free footage, the social overlays, Emma's
social narration and a 60-second music bed.

usage: python3 -I compose.py
"""
import json
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "clean-footage.mp4")
OV = os.path.join(HERE, "ov")
VO = os.path.join(HERE, "vo-social")
WORK = os.path.join(HERE, "social-work")
os.makedirs(WORK, exist_ok=True)

APP = (240, 60, 1440, 810)       # centered app column, 16:9
FULL = (0, 0, 1920, 1080)
# beat id -> (duration, [(source start, source length, output length, crop), ...]); None = end card
CUTS = {
    "b1": (5.5, [(15.0, 5.5, 5.5, FULL)]),
    "b2": (6.5, [(45.0, 22.0, 4.0, APP), (73.6, 3.0, 2.5, APP)]),
    "b3": (9.0, [(95.0, 18.0, 9.0, APP)]),
    "b4": (7.0, [(117.4, 6.0, 3.0, APP), (149.0, 6.0, 4.0, APP)]),
    "b5": (8.0, [(173.5, 6.0, 2.6, APP), (187.0, 5.0, 2.2, APP), (214.6, 4.0, 3.2, APP)]),
    "b6": (6.0, [(225.9, 8.0, 6.0, APP)]),
    "b7": (7.0, [(252.6, 6.0, 3.5, APP), (268.5, 5.0, 3.5, APP)]),
    "b8": (4.5, [(283.1, 9.0, 4.5, APP)]),
    "b9": (6.0, None),
}
ORDER = ["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9"]
X264 = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30"]


def run(args):
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *args], check=True)


def footage_chain(subs, width, height):
    """Inputs and filter text producing [vid] from the beat's source moments."""
    inputs, parts, labels = [], [], []
    for k, (start, length, out, (cx, cy, cw, ch)) in enumerate(subs):
        inputs += ["-ss", f"{start:.3f}", "-t", f"{length:.3f}", "-i", SRC]
        speed = length / out
        parts.append(
            f"[{k}:v]setpts=(PTS-STARTPTS)/{speed:.5f},fps=30,crop={cw}:{ch}:{cx}:{cy},"
            f"scale={width}:{height}:flags=lanczos,setsar=1,trim=duration={out:.3f},setpts=PTS-STARTPTS[s{k}]"
        )
        labels.append(f"[s{k}]")
    parts.append(f"{''.join(labels)}concat=n={len(subs)}:v=1:a=0[vid]")
    return inputs, parts, len(subs)


def beat_vertical(bid):
    dur, subs = CUTS[bid]
    out = os.path.join(WORK, f"v_{bid}.mp4")
    if subs is None:
        run(["-loop", "1", "-t", f"{dur}", "-i", f"{OV}/v_end.png", "-vf", "fps=30,fade=in:st=0:d=0.45,format=yuv420p", "-t", f"{dur}", *X264, out])
        return out
    inputs, parts, n = footage_chain(subs, 1020, 574)
    imgs = ["v_base.png", f"v_top_{bid}.png", f"v_cap_{bid}.png", "v_frame.png"]
    for img in imgs:
        inputs += ["-loop", "1", "-t", f"{dur}", "-i", f"{OV}/{img}"]
    base, top, cap, frame = n, n + 1, n + 2, n + 3
    parts += [
        f"[{base}:v]fps=30,format=yuv420p[bg]",
        "[bg][vid]overlay=30:680[a]",
        f"[{top}:v]format=rgba,fade=in:st=0:d=0.35:alpha=1[t]",
        "[a][t]overlay=0:0[b]",
        f"[b][{frame}:v]overlay=30:680[c]",
        f"[{cap}:v]format=rgba,fade=in:st=0.15:d=0.35:alpha=1[cp]",
        "[c][cp]overlay=0:1290,format=yuv420p[v]",
    ]
    run([*inputs, "-filter_complex", ";".join(parts), "-map", "[v]", "-t", f"{dur}", *X264, out])
    return out


def beat_horizontal(bid):
    dur, subs = CUTS[bid]
    out = os.path.join(WORK, f"h_{bid}.mp4")
    if subs is None:
        run(["-loop", "1", "-t", f"{dur}", "-i", f"{OV}/h_end.png", "-vf", "fps=30,fade=in:st=0:d=0.45,format=yuv420p", "-t", f"{dur}", *X264, out])
        return out
    inputs, parts, n = footage_chain(subs, 1920, 1080)
    for img in (f"h_chip_{bid}.png", f"h_cap_{bid}.png", "h_label.png"):
        inputs += ["-loop", "1", "-t", f"{dur}", "-i", f"{OV}/{img}"]
    chip, cap, label = n, n + 1, n + 2
    parts += [
        f"[{chip}:v]format=rgba,fade=in:st=0:d=0.35:alpha=1[ch]",
        "[vid][ch]overlay=0:0[a]",
        f"[{cap}:v]format=rgba,fade=in:st=0.15:d=0.35:alpha=1[cp]",
        "[a][cp]overlay=0:780[b]",
        f"[b][{label}:v]overlay=0:0,format=yuv420p[v]",
    ]
    run([*inputs, "-filter_complex", ";".join(parts), "-map", "[v]", "-t", f"{dur}", *X264, out])
    return out


def assemble(fmt, clips):
    lst = os.path.join(WORK, f"{fmt}.txt")
    with open(lst, "w") as f:
        f.writelines(f"file '{c}'\n" for c in clips)
    joined = os.path.join(WORK, f"{fmt}_joined.mp4")
    run(["-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", joined])
    return joined


def finish(fmt, joined, out):
    total = sum(CUTS[b][0] for b in ORDER)
    starts, t = {}, 0.0
    for b in ORDER:
        starts[b] = t
        t += CUTS[b][0]
    inputs = ["-i", joined, "-i", os.path.join(HERE, "music-social-eq.wav")]
    for b in ORDER:
        inputs += ["-i", os.path.join(VO, f"{b}.wav")]
    chains = []
    for i, b in enumerate(ORDER):
        ms = int((starts[b] + (0.35 if b == "b1" else 0.3)) * 1000)
        chains.append(f"[{i + 2}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[vo{i}]")
    vo_mix = "".join(f"[vo{i}]" for i in range(len(ORDER)))
    chains += [
        f"{vo_mix}amix=inputs={len(ORDER)}:normalize=0:dropout_transition=0,loudnorm=I=-15:TP=-1.5:LRA=11,apad,atrim=duration={total}[voice]",
        "[voice]asplit=2[v1][sc]",
        f"[1:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-24:TP=-3:LRA=7,volume=-2dB,apad,atrim=duration={total}[mus]",
        "[mus][sc]sidechaincompress=threshold=0.03:ratio=4:attack=40:release=600[duck]",
        f"[v1][duck]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.94,aresample=48000,apad,atrim=duration={total}[aout]",
    ]
    video_filter = []
    vmap = "0:v"
    if fmt == "v":
        inputs += ["-loop", "1", "-t", f"{total}", "-i", f"{OV}/v_progress.png"]
        pidx = 2 + len(ORDER)
        video_filter = [f"[0:v][{pidx}:v]overlay=x='-1080+1080*t/{total}':y=1912:shortest=1,format=yuv420p[vout]"]
        vmap = "[vout]"
    args = [*inputs, "-filter_complex", ";".join(video_filter + chains), "-map", vmap, "-map", "[aout]"]
    args += (X264 if fmt == "v" else ["-c:v", "copy"]) + ["-c:a", "aac", "-b:a", "192k", "-t", f"{total}", "-movflags", "+faststart", out]
    run(args)
    print("wrote", out)


if __name__ == "__main__":
    for fmt, beat in (("v", beat_vertical), ("h", beat_horizontal)):
        joined = os.path.join(WORK, f"{fmt}_joined.mp4")
        if not (os.environ.get("REUSE_BEATS") == "1" and os.path.exists(joined)):
            joined = assemble(fmt, [beat(b) for b in ORDER])
        name = "suede-social-60s-vertical.mp4" if fmt == "v" else "suede-social-60s-16x9.mp4"
        finish(fmt, joined, os.path.join(HERE, name))
