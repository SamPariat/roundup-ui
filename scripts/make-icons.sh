#!/usr/bin/env bash
# Rasterises the app icon sources in assets/svg/app-icon into the 1024 px PNGs that app.config.ts
# points at (Expo's icon fields take PNG, not SVG). Run it after changing a source and commit the
# result, like the splash PNGs: every prebuild and EAS build reads them, and a build machine may
# have no SVG rasteriser.
# Uses rsvg-convert when installed (brew install librsvg, or apt install librsvg2-bin) and falls
# back to sips, which ships with macOS.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out="$root/apps/roundup/assets/icon"
size=1024

mkdir -p "$out"

for name in icon-light icon-dark icon-tinted adaptive-foreground adaptive-monochrome; do
  source="$root/assets/svg/app-icon/$name.svg"
  target="$out/$name.png"

  if command -v rsvg-convert > /dev/null; then
    rsvg-convert --width "$size" --height "$size" --output "$target" "$source"
  elif command -v sips > /dev/null; then
    sips --setProperty format png --resampleHeightWidthMax "$size" "$source" --out "$target" > /dev/null
  else
    echo 'icons: install rsvg-convert (brew install librsvg) or run this on macOS' >&2
    exit 1
  fi

  echo "icons: wrote $target"
done
