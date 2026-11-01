#!/usr/bin/env bash
# Rasterises the Roundup mark into the PNGs that the expo-splash-screen config plugin needs
# (it takes PNG, not SVG). Run it after changing assets/svg/logo/mark-dark.svg or mark-light.svg
# and commit the result. 288 px is the 96 pt splash image at 3x.
# Uses rsvg-convert when installed (brew install librsvg, or apt install librsvg2-bin) and falls
# back to sips, which ships with macOS.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out="$root/apps/roundup/assets/splash"
# The catalog app shows the same splash, so it gets a copy of each PNG.
copies=("$root/apps/catalog/assets/splash")
size=288

mkdir -p "$out" "${copies[@]}"

for variant in dark light; do
  source="$root/assets/svg/logo/mark-$variant.svg"
  target="$out/mark-$variant.png"

  if command -v rsvg-convert > /dev/null; then
    rsvg-convert --width "$size" --height "$size" --output "$target" "$source"
  elif command -v sips > /dev/null; then
    sips --setProperty format png --resampleHeightWidthMax "$size" "$source" --out "$target" > /dev/null
  else
    echo 'splash: install rsvg-convert (brew install librsvg) or run this on macOS' >&2
    exit 1
  fi

  echo "splash: wrote $target"

  for copy in "${copies[@]}"; do
    cp "$target" "$copy/mark-$variant.png"
    echo "splash: wrote $copy/mark-$variant.png"
  done
done
