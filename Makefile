# Front door for the Roundup client. Every target calls a root pnpm script.
# Selects apps/roundup/.env.<APP_ENV> (beta or prod, the same names as the backend). Override per command:
#   make web APP_ENV=prod
APP_ENV ?= beta
export APP_ENV

.PHONY: install \
	setup \
	dev \
	web \
	prebuild \
	ios \
	android \
	lint \
	fmt \
	fmt-check \
	typecheck \
	test \
	splash \
	knip \
	syncpack \
	files \
	doctor \
	updates \
	check \
	docker-build \
	docker-up \
	docker-down \
	docker-smoke \
	docker-logs \
	clean

# Installs the exact versions in pnpm-lock.yaml. Needs the Node in .nvmrc. Node 25+ does not ship corepack, so it is installed from npm first.
install:
	npm install --global corepack@0.36.0
	corepack enable
	pnpm install --frozen-lockfile

# Turns on the git hooks and creates apps/roundup/.env.beta from its template. Existing files are kept.
# .env.prod is never generated: copy .env.prod.example by hand and fill in real values.
setup:
	./scripts/setup.sh

# Expo dev server (press w for web, i for iOS, a for Android).
dev:
	pnpm dev

# Web only, served by Metro at http://localhost:8081.
web:
	pnpm web

# Regenerates ios/ and android/ from app.config.ts from scratch (expo prebuild --clean). Both
# folders are gitignored and owned by the config, so nothing hand-edited is lost.
prebuild:
	pnpm prebuild:ios
	pnpm prebuild:android

# Clean prebuild of ios/, then builds and runs the iOS development build (expo-dev-client, not
# Expo Go) on a simulator. Needs Xcode. Glass needs iOS 26+.
ios:
	pnpm prebuild:ios
	pnpm ios

# Clean prebuild of android/, then builds and runs the Android development build on an emulator.
# Needs Android Studio.
android:
	pnpm prebuild:android
	pnpm android

# ESLint with zero warnings allowed, then shellcheck on the scripts and git hooks.
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

# Rasterises assets/svg/logo/mark-*.svg into the PNGs the native splash screen needs. Commit the result.
splash:
	./scripts/make-splash.sh

# Unused files, exports and dependencies.
knip:
	pnpm knip

# Every dependency version must come from the pnpm catalog.
syncpack:
	pnpm syncpack

# Fails on JavaScript files outside .js-allowlist, scripts that are not executable kebab-case .sh
# files, asset files that are not kebab-case, and catalog versions that are ranges.
files:
	pnpm run files

# Expo's own checks (dependency versions against the SDK, then expo-doctor), then the update check.
doctor:
	pnpm run doctor
	pnpm run updates

# Fails when a catalog dependency has a newer release it may take (needs the network). Expo packages
# are held to what SDK 58 allows; releases that are held back are printed as info.
updates:
	pnpm run updates

# Everything CI runs, minus the web export and the Docker build.
check: lint fmt-check knip syncpack files typecheck test doctor

# The compose targets read apps/roundup/.env.$(APP_ENV) for the API address baked into the build.
docker-build:
	docker compose --env-file apps/roundup/.env.$(APP_ENV) build web

# Builds and runs the static web build at http://localhost:8081.
docker-up:
	docker compose --env-file apps/roundup/.env.$(APP_ENV) up -d --build web

docker-down:
	docker compose --env-file apps/roundup/.env.$(APP_ENV) down

# Checks the container started by docker-up: clean URLs, 404 page, cache and security headers, health.
docker-smoke:
	./scripts/docker-smoke.sh

docker-logs:
	docker compose --env-file apps/roundup/.env.$(APP_ENV) logs -f web

clean:
	rm -rf node_modules apps/*/node_modules shared/*/node_modules apps/roundup/dist apps/roundup/.expo
