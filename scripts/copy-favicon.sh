#!/usr/bin/env bash
# Copies the Roundup mark into apps/roundup/public/favicon.svg, where Expo's web build looks for
# static files. The copy is generated and git-ignored, so assets/svg/logo/mark-dark.svg stays the
# only hand-maintained favicon. The app's dev, web, ios, android and export:web scripts run this first.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
target="$root/apps/roundup/public/favicon.svg"

mkdir -p "$(dirname "$target")"
cp "$root/assets/svg/logo/mark-dark.svg" "$target"
echo "favicon: wrote $target"
