#!/usr/bin/env bash
# Wraps a PNG in a mock browser window, so a screenshot stands apart from the GitHub page around it.
# Usage: frame-screenshot.sh <input.png> <output.png>
set -euo pipefail

input=$1
output=$2

read -r width height < <(magick identify -format '%w %h\n' "$input")
window="roundrectangle 0,0 $((width - 1)),$((height + 43)) 10,10"

magick \
  \( -size "${width}x44" xc:'#2b2b2f' \
    -fill '#ff5f57' -draw 'circle 20,22 26,22' \
    -fill '#febc2e' -draw 'circle 40,22 46,22' \
    -fill '#28c840' -draw 'circle 60,22 66,22' \) \
  "$input" -append \
  \( -size "${width}x$((height + 44))" xc:none -fill white -draw "$window" \) \
  -compose DstIn -composite -compose Over \
  -fill none -stroke 'rgba(255,255,255,0.15)' -draw "$window" \
  \( +clone -background black -shadow 55x14+0+14 \) +swap \
  -background none -layers merge +repage -depth 8 "$output"
