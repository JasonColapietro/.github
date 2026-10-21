#!/bin/sh
# Render the original background bed, then mix it under the narrated video,
# ducking the music whenever the voice is speaking.
# usage: add-music.sh <narrated.mp4> <out.mp4>
set -e
IN="$1"; OUT="$2"
DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")"
python3 -I "$(dirname "$0")/music.py" "$DUR" music.wav
ffmpeg -y -i music.wav -af "highpass=f=70:poles=2,equalizer=f=250:t=q:w=1:g=-3,equalizer=f=2500:t=q:w=1.2:g=-4,lowpass=f=9000" music-eq.wav
ffmpeg -y -i "$IN" -i music-eq.wav -filter_complex \
  "[0:a]asplit=2[voice][sc];[1:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-24:TP=-3:LRA=7,volume=-8dB[mus];[mus][sc]sidechaincompress=threshold=0.03:ratio=4:attack=40:release=700[duck];[voice][duck]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.94[aout]" \
  -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "$OUT"
