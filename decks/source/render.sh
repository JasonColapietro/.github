#!/bin/bash
# usage: render.sh name  -> out/name.pdf, out/name-NN.jpg, out/name-grid.jpg
set -e
cd "$(dirname "$0")/out"
python3 /root/.claude/skills/synced/5eab2bf9-900a-4ebe-a081-9715f432e549_2a9ca768-c5c7-48a7-905f-a40c5fedff00/pptx/scripts/office/soffice.py --headless --convert-to pdf --outdir "$PWD" "$PWD/$1.pptx" >/dev/null 2>&1
rm -f "$1"-[0-9]*.jpg
pdftoppm -jpeg -r 55 "$1.pdf" "$1"
python3 - "$1" <<'PY'
import sys,glob
from PIL import Image
n=sys.argv[1]
fs=sorted(glob.glob(f'{n}-[0-9]*.jpg'))
ims=[Image.open(f) for f in fs]
w,h=ims[0].size; cols=2; rows=(len(ims)+1)//2
g=Image.new('RGB',(cols*w+(cols+1)*8, rows*h+(rows+1)*8),(90,90,90))
for i,im in enumerate(ims): g.paste(im,(8+(i%cols)*(w+8),8+(i//cols)*(h+8)))
g.save(f'{n}-grid.jpg',quality=82); print(n, len(ims), 'slides', g.size)
PY
