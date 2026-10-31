# Front door for the Roundup client. Every target calls a root pnpm script.
# Selects apps/app/.env.<APP_ENV> (beta or prod, the same names as the backend). Override per command:
#   make web APP_ENV=prod
APP_ENV ?= beta
export APP_ENV

.PHONY: install \
	setup \
	dev \
	web \
	ios \
	android \
	lint \
	fmt \
	fmt-check \
	typecheck \
	test \
	tokens \
	tokens-check \
	knip \
	syncpack \
	files \
	doctor \
	check \
	docker-build \
	docker-up \
	docker-down \
	docker-smoke \
	docker-logs \
	clean

# Installs the exact versions in pnpm-lock.yaml. Needs the Node in .nvmrc and corepack (ships with Node).
install:
	corepack enable
	pnpm install --frozen-lockfile

# Turns on the git hooks and creates apps/app/.env.beta from its template. Existing files are kept.
# .env.prod is never generated: copy .env.prod.example by hand and fill in real values.
setup:
	./scripts/setup.sh

# Expo dev server (press w for web, i for iOS, a for Android).
dev:
	pnpm dev

# Web only, served by Metro at http://localhost:8081.
web:
	pnpm web

# iOS simulator. Needs Xcode. The glass tab bar needs an iOS 26+ simulator.
ios:
	pnpm ios

# Android emulator. Needs Android Studio.
android:
	pnpm android

# ESLint with zero warnings allowed.
lint:
	pnpm lint

# Rewrites files with Prettier. The pre-commit hook only checks, so run this when it complains.
fmt:
	pnpm fmt

fmt-check:
	pnpm fmt-check

# tsc --noEmit in every package.
typecheck:
	pnpm typecheck

# Jest in every package.
test:
	pnpm test

# Regenerates shared/tokens/src from tokens.json. Commit the result.
tokens:
	pnpm tokens

# Fails when the generated tokens differ from tokens.json (what CI's drift job checks).
tokens-check:
	pnpm tokens -- --check

# Unused files, exports and dependencies.
knip:
	pnpm knip

# Every dependency version must come from the pnpm catalog.
syncpack:
	pnpm syncpack

# Fails on JavaScript files outside .js-allowlist and on asset files that are not kebab-case.
files:
	pnpm run files

# Expo's own checks: dependency versions against the SDK, then expo-doctor.
doctor:
	pnpm run doctor

# Everything CI runs, minus the web export and the Docker build.
check: lint fmt-check knip syncpack files typecheck test tokens-check doctor

# The compose targets read apps/app/.env.$(APP_ENV) for the API address baked into the build.
docker-build:
	docker compose --env-file apps/app/.env.$(APP_ENV) build web

# Builds and runs the static web build at http://localhost:8081.
docker-up:
	docker compose --env-file apps/app/.env.$(APP_ENV) up -d --build web

docker-down:
	docker compose --env-file apps/app/.env.$(APP_ENV) down

# Checks the container started by docker-up: clean URLs, 404 page, cache and security headers, health.
docker-smoke:
	node scripts/docker-smoke.ts

docker-logs:
	docker compose --env-file apps/app/.env.$(APP_ENV) logs -f web

clean:
	rm -rf node_modules apps/*/node_modules shared/*/node_modules apps/app/dist apps/app/.expo
