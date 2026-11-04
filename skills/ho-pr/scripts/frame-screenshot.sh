#!/usr/bin/env bash
# Wraps a PNG in a mock browser window, so a screenshot stands apart from the GitHub page around it.
# Usage: frame-screenshot.sh <input.png> <output.png> [scale]
# The scale is the capture's device pixel ratio, such as 2, so the frame keeps its size next to the page.
set -euo pipefail

input=$1
output=$2
scale=${3:-1}

read -r width height < <(magick identify -format '%w %h\n' "$input")
bar=$((44 * scale))
middle=$((22 * scale))
radius=$((6 * scale))
corner=$((10 * scale))
window="roundrectangle 0,0 $((width - 1)),$((height + bar - 1)) $corner,$corner"

light() {
  local x=$(($1 * scale))
  echo "circle $x,$middle $((x + radius)),$middle"
}

magick \
  \( -size "${width}x${bar}" xc:'#2b2b2f' \
    -fill '#ff5f57' -draw "$(light 20)" \
    -fill '#febc2e' -draw "$(light 40)" \
    -fill '#28c840' -draw "$(light 60)" \) \
  "$input" -append \
  \( -size "${width}x$((height + bar))" xc:none -fill white -draw "$window" \) \
  -compose DstIn -composite -compose Over \
  -fill none -stroke 'rgba(255,255,255,0.15)' -strokewidth "$scale" -draw "$window" \
  \( +clone -background black -shadow "55x$((14 * scale))+0+$((14 * scale))" \) +swap \
  -background none -layers merge +repage -depth 8 "$output"
