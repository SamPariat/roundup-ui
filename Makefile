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
	no-js \
	doctor \
	check \
	docker-build \
	docker-up \
	docker-down \
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

# Fails on tracked .js/.jsx/.mjs/.cjs files outside .js-allowlist.
no-js:
	pnpm no-js

# Expo's own checks: dependency versions against the SDK, then expo-doctor.
doctor:
	pnpm doctor

# Everything CI runs, minus the web export and the Docker build.
check: lint fmt-check knip syncpack no-js typecheck test tokens-check doctor

docker-build:
	docker compose build web

# Builds and runs the static web build at http://localhost:8081 (reads apps/app/.env.$(APP_ENV)).
docker-up:
	docker compose up -d --build web

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f web

clean:
	rm -rf node_modules apps/*/node_modules shared/*/node_modules apps/app/dist apps/app/.expo coverage
