#!/usr/bin/env bash
# Runs a command with the variables of apps/roundup/.env.<APP_ENV> in its environment.
# Usage: scripts/with-env.sh expo start
#
# Expo only reads .env, .env.local and .env.<mode>. Roundup's backend names its files .env.beta and
# .env.prod, so the matching one is loaded here. APP_ENV is beta unless set, and a variable that is
# already set wins, which is how Docker build args and CI override the file.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

export APP_ENV="${APP_ENV:-beta}"

file="$root/apps/roundup/.env.$APP_ENV"

if [ -f "$file" ]; then
  while IFS="=" read -r key value || [ -n "$key" ]; do
    case "$key" in '' | '#'*) continue ;; esac
    value=${value%\"}
    value=${value#\"}

    if [ -z "${!key+x}" ]; then
      export "$key=$value"
    fi
  done < "$file"
fi

exec "$@"
