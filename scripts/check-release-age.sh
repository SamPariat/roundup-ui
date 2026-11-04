#!/usr/bin/env bash
# Fails when pnpm-lock.yaml adds a package version published less than a day ago.
#
# pnpm's own minimumReleaseAge is off in pnpm-workspace.yaml, so local installs never block and no
# exclude list piles up. CI installs with --frozen-lockfile, which skips resolution and so would
# never apply the rule either. This script is where the rule lives instead: it compares the
# lockfile's name@version keys with the base branch's and checks only the versions that are new.
# A version that is new here waits a day before it can merge, so a hijacked release has time to
# be caught and pulled.
#
# Usage: scripts/check-release-age.sh [base-ref]   (default: origin/main)
# Needs git, curl and jq, plus the network.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

readonly REGISTRY='https://registry.npmjs.org'
readonly LOCKFILE='pnpm-lock.yaml'
# One day, the same as pnpm's default minimumReleaseAge.
readonly MIN_AGE_SECONDS=86400

base="${1:-origin/main}"

# Prints the name@version keys of every packages: section in a lockfile read from stdin.
package_keys() {
  awk '
    /^packages:/ { inside = 1; next }
    /^[^ ]/ { inside = 0 }
    inside && /^  [^ ]/ {
      key = $0
      sub(/^  /, "", key)
      sub(/:$/, "", key)
      gsub(/'\''/, "", key)
      print key
    }
  ' | sort -u
}

current="$(package_keys < "$LOCKFILE")"
previous="$(git show "${base}:${LOCKFILE}" 2> /dev/null | package_keys || true)"
added="$(comm -23 <(printf '%s\n' "$current") <(printf '%s\n' "$previous"))"

if [[ -z "$added" ]]; then
  echo "release age: no new package versions since ${base}"
  exit 0
fi

now="$(date -u +%s)"
young=()

while IFS= read -r key; do
  # The version follows the last @, so scoped names keep their leading one.
  name="${key%@*}"
  version="${key##*@}"
  published="$(curl -fsS "${REGISTRY}/${name/\//%2f}" | jq -r --arg v "$version" '.time[$v] // empty')"

  if [[ -z "$published" ]]; then
    young+=("${key} (no publish time on the registry)")
    continue
  fi

  age=$((now - $(date -u -d "$published" +%s 2> /dev/null || date -u -j -f '%Y-%m-%dT%H:%M:%S' "${published%%.*}" +%s)))

  if ((age < MIN_AGE_SECONDS)); then
    young+=("${key} (published ${published})")
  fi
done <<< "$added"

if ((${#young[@]} > 0)); then
  echo 'release age: these versions are less than a day old; wait a day before merging:'
  printf '  %s\n' "${young[@]}"
  exit 1
fi

echo "release age: $(wc -l <<< "$added" | tr -d ' ') new package versions, all at least a day old"
