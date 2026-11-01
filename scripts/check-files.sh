#!/usr/bin/env bash
# Checks the tracked files:
#   - no JavaScript outside .js-allowlist (source and configs are TypeScript; scripts are bash),
#   - every file in scripts/ is an executable, kebab-case .sh file,
#   - every asset file is named in kebab-case (bookmark-filled.svg, not bookmarkFilled.svg),
#   - every version in the pnpm catalog is exact. syncpack only sees package.json, where versions
#     are `catalog:`, so the ranges it cannot see are caught here.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

failed=0

# Tracked and untracked-but-not-ignored files matching git pathspecs, one per line.
list_files() {
  git ls-files --cached --others --exclude-standard -- "$@"
}

# --- JavaScript files ------------------------------------------------------------------------
allowlist=$(grep -Ev '^[[:space:]]*(#|$)' .js-allowlist || true)
js_files=$(list_files '*.js' '*.jsx' '*.mjs' '*.cjs' | grep -Fxv -f <(printf '%s\n' "$allowlist") || true)

if [ -n "$js_files" ]; then
  echo 'JavaScript files are not allowed. Write TypeScript (scripts are bash), or list a one-line shim in .js-allowlist:' >&2
  # shellcheck disable=SC2001
  echo "$js_files" | sed 's/^/  /' >&2
  failed=1
fi

# --- scripts/ --------------------------------------------------------------------------------
bad_scripts=""

while IFS= read -r file; do
  [ -n "$file" ] || continue
  name=${file##*/}

  if [[ ! "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*\.sh$ ]]; then
    bad_scripts+="  $file (must be a kebab-case .sh file)"$'\n'
  elif [ ! -x "$file" ]; then
    bad_scripts+="  $file (not executable: chmod +x)"$'\n'
  fi
done < <(list_files scripts)

if [ -n "$bad_scripts" ]; then
  echo 'Scripts must be kebab-case, executable .sh files:' >&2
  printf '%s' "$bad_scripts" >&2
  failed=1
fi

# --- asset names -----------------------------------------------------------------------------
# Everything under assets/svg, plus images and fonts anywhere. Licence and notes files in
# assets/brand keep their conventional names, and the fonts in assets/fonts keep their PostScript
# names (Onest-Regular.ttf): Android takes a font's family name from its file name and iOS from
# the PostScript name, so the two must match for one font-family to work on both.
bad_names=""

while IFS= read -r file; do
  [ -n "$file" ] || continue
  case "$file" in node_modules/*) continue ;; esac
  name=${file##*/}

  if [[ "$file" == assets/fonts/* && "$name" =~ ^[A-Z][A-Za-z0-9]*-[A-Z][A-Za-z0-9]*\.(ttf|otf)$ ]]; then
    continue
  fi

  if [[ ! "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+)*$ ]]; then
    bad_names+="  $file"$'\n'
  fi
done < <(list_files assets/svg '*.svg' '*.png' '*.jpg' '*.jpeg' '*.ttf' '*.woff2' | sort -u)

if [ -n "$bad_names" ]; then
  echo 'Asset files must be kebab-case (lower-case words joined by hyphens):' >&2
  printf '%s' "$bad_names" >&2
  failed=1
fi

# --- catalog ranges --------------------------------------------------------------------------
ranges=$(grep -E '^  ' pnpm-workspace.yaml | grep -Ev '^[[:space:]]*#' \
  | grep -E ": '?([~^<>*]|latest)" || true)

if [ -n "$ranges" ]; then
  echo 'Catalog versions must be exact (no ^, ~ or other ranges):' >&2
  # shellcheck disable=SC2001
  echo "$ranges" | sed 's/^ *//; s/^/  /' >&2
  failed=1
fi

if [ "$failed" -ne 0 ]; then
  exit 1
fi

echo 'files: ok'
