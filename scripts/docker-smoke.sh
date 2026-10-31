#!/usr/bin/env bash
# Checks a running web container (make docker-up, or the CI docker job) from the outside.
# Usage: scripts/docker-smoke.sh [base-url]   (default http://localhost:8081)
set -euo pipefail

readonly BASE="${1:-http://localhost:8081}"
readonly ONE_YEAR_CACHE='public, max-age=31536000, immutable'

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# Stops the current check with a message. Each check runs in its own subshell, so this ends only it.
fail() {
  echo "$1" >&2
  exit 1
}

# Fetches a path without following redirects, so a 308 shows up as a failure. The body goes to
# $work/body, the headers to $work/headers, and the status code is printed.
get() {
  curl -sS -o "$work/body" -D "$work/headers" -w '%{http_code}' "$BASE$1"
}

# The value of a response header from the last get, or nothing. Names are case-insensitive.
header() {
  { grep -i "^$1:" "$work/headers" || true; } | tail -n 1 | sed -E "s/^[^:]*:[[:space:]]*//" | tr -d '\r'
}

# Asserts an HTML page: the status, the content type and the no-cache header.
check_page() {
  local path=$1 status=$2 got

  got=$(get "$path")
  [ "$got" = "$status" ] || fail "$path: expected $status, got $got"

  case "$(header content-type)" in
    text/html*) ;;
    *) fail "$path: expected HTML, got $(header content-type)" ;;
  esac

  [ "$(header cache-control)" = 'no-cache' ] \
    || fail "$path: expected cache-control no-cache, got $(header cache-control)"

  grep -q '<html' "$work/body" || fail "$path: body is not an HTML document"
}

# Asserts the headers every page carries.
check_security_headers() {
  local path=$1 csp

  get "$path" > /dev/null
  csp=$(header content-security-policy)

  [ "$(header x-content-type-options)" = 'nosniff' ] || fail "$path: x-content-type-options"
  [ "$(header referrer-policy)" = 'strict-origin-when-cross-origin' ] || fail "$path: referrer-policy"
  [[ "$csp" == *"default-src 'self'"* ]] || fail "$path: csp default-src"
  [[ "$csp" == *"frame-ancestors 'none'"* ]] || fail "$path: csp frame-ancestors"
  [[ "$csp" == *"object-src 'none'"* ]] || fail "$path: csp object-src"
  [[ "$csp" != *__API_ORIGIN__* ]] || fail "$path: csp still has the API origin placeholder"
}

# Asserts that a clean URL serves an HTML page with status 200 and no redirect.
check_clean_url() {
  check_page "$1" 200
}

# Asserts that an unknown path serves the export's not-found page with status 404.
check_not_found() {
  local status

  check_page /nope 404
  cp "$work/body" "$work/nope"

  status=$(get '/+not-found.html')
  [ "$status" = 200 ] || fail 'the export has no +not-found.html'
  cmp -s "$work/nope" "$work/body" || fail '/nope did not serve +not-found.html'
}

# Asserts that a hashed bundle is cached for a year.
check_hashed_asset() {
  local bundle status

  get / > /dev/null
  bundle=$(grep -oE 'src="/_expo/static/[^"]+\.js"' "$work/body" | head -n 1 | sed -E 's/^src="//; s/"$//' || true)
  [ -n "$bundle" ] || fail 'no /_expo/static script on the home page'

  status=$(get "$bundle")
  [ "$status" = 200 ] || fail "$bundle: expected 200, got $status"
  [ "$(header cache-control)" = "$ONE_YEAR_CACHE" ] \
    || fail "$bundle: cache-control was $(header cache-control)"
}

# Asserts that the health endpoint answers 200.
check_health() {
  local status

  status=$(get /health)
  [ "$status" = 200 ] || fail "/health: expected 200, got $status"
}

failed=0
total=0

# run "title" check_function path
run() {
  local title=$1 message

  total=$((total + 1))

  if message=$("$2" "$3" 2>&1); then
    echo "ok    $title"
  else
    failed=$((failed + 1))
    echo "FAIL  $title: $message"
  fi
}

run '/ returns 200 HTML' check_clean_url /
run '/squads returns 200 HTML without a redirect' check_clean_url /squads
run '/explore returns 200 HTML without a redirect' check_clean_url /explore
run '/profile returns 200 HTML without a redirect' check_clean_url /profile
run '/nope returns 404 with the not-found page' check_not_found /nope
run 'hashed assets are cached for a year, immutable' check_hashed_asset /
run 'security headers on a page' check_security_headers /squads
run 'security headers on the not-found page' check_security_headers /nope
run '/health returns 200' check_health /health

echo "$((total - failed))/$total checks passed against $BASE"

[ "$failed" -eq 0 ]
