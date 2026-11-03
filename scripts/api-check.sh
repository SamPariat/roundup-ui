#!/usr/bin/env bash
# Regenerates the API client and fails when the committed output differs from what the spec makes.
# Runs where the spec exists (the roundup-monorepo checkout next to this one, or ROUNDUP_API_SPEC)
# and prints "skipped: no spec" elsewhere, so CI, which has no Go repo, never needs it.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# orval resolves the spec from shared/api, so the existence check is made from there as well.
spec="${ROUNDUP_API_SPEC:-../../../roundup-monorepo/shared/api/openapi.yaml}"

if [ ! -f "shared/api/$spec" ] && [ ! -f "$spec" ]; then
  echo 'skipped: no spec'
  exit 0
fi

pnpm api

if [ -n "$(git status --porcelain -- shared/api/src/generated)" ]; then
  git status --short -- shared/api/src/generated >&2
  echo 'shared/api/src/generated differs from what the spec generates: run make api and commit the result' >&2
  exit 1
fi

echo 'shared/api/src/generated matches the spec'
