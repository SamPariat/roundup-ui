#!/usr/bin/env bash
# Turns on the repo's git hooks and creates apps/roundup/.env.beta from its template.
# Existing env files are kept. .env.prod is never generated: copy .env.prod.example by hand.
set -eu

cd "$(dirname "$0")/.."

if [ -f apps/roundup/.env.beta ]; then
  echo "keep    apps/roundup/.env.beta"
else
  cp apps/roundup/.env.beta.example apps/roundup/.env.beta
  echo "created apps/roundup/.env.beta"
fi

git config core.hooksPath .githooks
echo "Git hooks path set to .githooks (pre-commit runs eslint, prettier, tsc; commit-msg runs commitlint)"
