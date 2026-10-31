#!/usr/bin/env bash
# Fails when a dependency in the pnpm catalog has a newer release it is allowed to take.
#
# expo-doctor and `expo install --check` only compare against the versions the installed `expo`
# bundles (bundledNativeModules.json) and the newest SDK patch of `expo` itself. They say nothing
# about eslint, jest, i18next and the rest, so this script covers both halves:
#   1. Expo-managed packages: the newest version SDK 58 allows (the bundled range, or the newest
#      58.x for the expo-versioned packages).
#   2. Every other catalog package: the newest stable release on npm.
# Newer versions that SDK 58 or a documented hold-back rules out are printed as info only.
# Needs curl and jq, plus the network.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

readonly REGISTRY='https://registry.npmjs.org'
readonly SDK_MAJOR=58
# The versions the installed expo bundles. A path, not a node call, so this works from the root.
readonly BUNDLED_LIST='apps/roundup/node_modules/expo/bundledNativeModules.json'
readonly MAX_JOBS=16

# Newer releases that cannot be taken yet. Each needs a reason; delete the entry when it clears.
held_back() {
  case "$1" in
    eslint) echo 'eslint-plugin-react-native and -a11y stop at ESLint 9' ;;
    @eslint/js) echo 'moves with eslint' ;;
    nativewind) echo 'NativeWind 5 is a release candidate; the latest tag is the old 4.x line' ;;
    react-native-css) echo 'release candidate that NativeWind 5 needs' ;;
    typescript) echo 'typescript-eslint supports TypeScript below 6.1 only' ;;
    @types/node) echo 'kept on the Node major in .nvmrc' ;;
    jest) echo 'moves with jest-expo' ;;
    lightningcss) echo '1.30.2+ cannot read var() back from a visitor; react-native-css needs 1.30.1 for native styles (see the override in pnpm-workspace.yaml)' ;;
    eslint-plugin-unicorn) echo 'newer majors drop rule options this config sets (79 fails to load); upgrade with eslint 10' ;;
    *) echo '' ;;
  esac
}

# The jq program that decides, for one package, whether there is an update to apply (row), a newer
# release that is held back (info), or nothing. The input is the registry's package document.
# shellcheck disable=SC2016
readonly DECIDE='
  def parse: split(".") | if length == 3 and all(.[]; test("^[0-9]+$")) then map(tonumber) else null end;
  def plain: parse // [0, 0, 0];
  def in_range($range):
    ($range | ltrimstr("~") | ltrimstr("^")) as $base
    | parse as $v
    | ($base | parse) as $b
    | if $v == null or $b == null then false
      elif ($range | startswith("~")) then $v[0] == $b[0] and $v[1] == $b[1] and $v >= $b
      elif ($range | startswith("^")) then $v[0] == $b[0] and $v >= $b
      else . == $base end;

  (."dist-tags".latest // "") as $latest
  | ([.versions | keys[] | select(parse != null)] | sort_by(parse)) as $versions
  | ($current | parse) as $cur
  | (if $range != "" then "bundled"
     elif ($family == "yes" and $cur != null and $cur[0] == $sdk) then "expo-family"
     else "other" end) as $kind
  | ([$versions[] | select(
        if $kind == "bundled" then in_range($range)
        elif $kind == "expo-family" then (parse[0] == $cur[0])
        else . == $latest end)] | last // $current) as $allowed
  | if $cur == null then
      ["info", $name, $current, $latest, (if $hold != "" then $hold else "pinned to a prerelease; check by hand" end)]
    elif ($allowed | plain) > ($current | plain) and $hold == "" then
      ["row", $name, $current, $allowed,
       (if $name == "expo"
        then "pnpm update -r expo@\($allowed) && pnpm --filter @roundup/roundup exec expo install --fix"
        else "pnpm update -r \($name)@\($allowed)" end)]
    elif ($latest | plain) > ($allowed | plain) or ($hold != "" and ($latest | plain) > ($current | plain)) then
      ["info", $name, $current, $latest, (if $hold != "" then $hold else "SDK \($sdk) allows \($allowed)" end)]
    else empty end
  | @tsv
'

# Checks one catalog entry against the registry and writes at most one TSV line to stdout.
check_package() {
  local name=$1 current=$2 range family=no hold document

  range=$(jq -r --arg name "$name" '.[$name] // ""' "$BUNDLED_LIST")

  case "$name" in
    expo | expo-* | @expo/* | babel-preset-expo | jest-expo) family=yes ;;
    *) ;;
  esac

  hold=$(held_back "$name")
  document=$(curl -fsS -H 'Accept: application/vnd.npm.install-v1+json' "$REGISTRY/${name//\//%2F}") \
    || { echo "$name: the registry did not answer" >&2; return 1; }

  printf '%s' "$document" | jq -r \
    --arg name "$name" --arg current "$current" --arg range "$range" \
    --arg family "$family" --arg hold "$hold" --argjson sdk "$SDK_MAJOR" "$DECIDE"
}

# Name and version pairs from the `catalog:` block of pnpm-workspace.yaml, one "name version" per line.
read_catalog() {
  awk '
    /^catalog:/ { inside = 1; next }
    inside && !/^  / { exit }
    inside && !/^[[:space:]]*#/ { print }
  ' pnpm-workspace.yaml | sed -E "s/'//g; s/^ +//; s/^(.*): (.*)\$/\1 \2/"
}

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

index=0

while read -r name current; do
  while [ "$(jobs -rp | wc -l)" -ge "$MAX_JOBS" ]; do sleep 0.1; done

  index=$((index + 1))
  (check_package "$name" "$current" > "$work/$(printf '%04d' "$index").out" 2> "$work/$(printf '%04d' "$index").err" \
    || touch "$work/$(printf '%04d' "$index").failed") &
done < <(read_catalog)

wait

if compgen -G "$work/*.failed" > /dev/null; then
  cat "$work"/*.err >&2
  exit 1
fi

lines=$(cat "$work"/*.out)
infos=$(printf '%s\n' "$lines" | awk -F'\t' '$1 == "info" { printf "  %s %s -> %s: %s\n", $2, $3, $4, $5 }')
rows=$(printf '%s\n' "$lines" | awk -F'\t' '$1 == "row" { printf "%s\t%s\t%s\t%s\n", $2, $3, $4, $5 }')

if [ -n "$infos" ]; then
  echo 'Newer releases that are not taken (info):'
  echo "$infos"
fi

if [ -n "$rows" ]; then
  printf '\nUpdates available:\n'
  { printf 'package\tcurrent\tlatest allowed\tupdate\n'; echo "$rows"; } | column -t -s "$(printf '\t')"
  exit 1
fi

echo 'updates: every catalog dependency is on the newest version it may take'
