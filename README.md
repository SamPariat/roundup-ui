<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/svg/brand/banner-dark.svg">
    <img alt="Roundup: round up the squad, pick the place, split the bill" src="assets/svg/brand/banner-light.svg" width="100%">
  </picture>
</p>

<p align="center">
  <a href="https://github.com/SamPariat/roundup-ui/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/SamPariat/roundup-ui/ci.yml?branch=main&style=for-the-badge&label=CI&logo=githubactions&logoColor=cdd6f4&labelColor=1e1e2e&color=a6e3a1"></a>
  <img alt="Expo SDK 58" src="https://img.shields.io/badge/Expo-SDK%2058-cba6f7?style=for-the-badge&logo=expo&logoColor=cdd6f4&labelColor=1e1e2e">
  <img alt="TypeScript only" src="https://img.shields.io/badge/TypeScript-only-89b4fa?style=for-the-badge&logo=typescript&logoColor=cdd6f4&labelColor=1e1e2e">
  <img alt="NativeWind 5" src="https://img.shields.io/badge/NativeWind-v5%20RC-fab387?style=for-the-badge&logo=tailwindcss&logoColor=cdd6f4&labelColor=1e1e2e">
  <img alt="Made with love" src="https://img.shields.io/badge/made%20with-%F0%9F%92%9C-cba6f7?style=for-the-badge&labelColor=1e1e2e">
</p>

<p align="center">
  <b>The Roundup client</b>: one React Native + Expo app for web, Android and iOS. The backend lives in <a href="https://github.com/SamPariat/roundup">SamPariat/roundup</a>.
</p>

<p align="center">
  <a href="#-getting-started">🚀 Getting started</a> ·
  <a href="#-commands">🧰 Commands</a> ·
  <a href="#-repository-structure">📁 Structure</a> ·
  <a href="#-rules-the-tooling-enforces">📏 Rules</a> ·
  <a href="#-docker">🐳 Docker</a>
</p>

<p align="center"><img src="assets/svg/brand/divider.svg" width="100%" alt=""></p>

## ✨ What is here

This is the foundation: the workspace, the strictest lint and type setup, the NativeWind theme, every design-system component rebuilt in React Native, and an empty routed shell. There is no API client and there are no screens wired to the backend yet; sign-in comes next.

- 🎨 **One hand-written theme** (`shared/ui/theme.css`): the Roundup design system's role colours, text styles and shadows as a Tailwind 4 stylesheet. Mocha is the dark theme, Latte the light one.
- 🌍 **One place for every string**: `@roundup/i18n` holds the English copy as typed resources; components and screens never contain user-facing text.
- 🧩 **27 components** with the design system's prop names (`Button`, `TextField`, `Modal`, `SquadCard`…), each with accessibility built into its types and tests.
- 🧭 **A routed shell**: `/` is Welcome, `/squads`, `/explore` and `/profile` sit behind a side nav on wide screens and a bottom nav on narrow ones. iOS uses the system tab bar with Liquid Glass.
- 🌐 **Web first**: a static export served by [static-web-server](https://static-web-server.net), in Docker.

> **Language policy:** source and configs are TypeScript only: no `.js`, `.jsx`, `.mjs` or `.cjs` files, except the one-line shims listed in `.js-allowlist` (there are none today). Scripts in `scripts/` are bash (`#!/usr/bin/env bash`, `set -euo pipefail`) and are checked by shellcheck.

<p align="center"><img src="assets/svg/brand/divider.svg" width="100%" alt=""></p>

## 🚀 Getting started

You need Node (the version in `.nvmrc`), `shellcheck` for `make lint` (`brew install shellcheck`; CI installs it with apt), `jq` and `curl` for `make updates`, and Docker if you want the container. pnpm comes with Node through corepack.

```sh
nvm use                # Node from .nvmrc
make install           # install corepack, enable it, pnpm install --frozen-lockfile
make setup             # git hooks + apps/roundup/.env.beta from the template
make web               # the app on http://localhost:8081
```

`make setup` keeps an existing `apps/roundup/.env.beta`. `.env.prod` is never created for you: copy `.env.prod.example` and fill in real values.

To use the backend, start the Go services from [roundup-monorepo](https://github.com/SamPariat/roundup) (`make services-up`). The app expects the gateway at `EXPO_PUBLIC_API_URL`, which is `http://localhost:8080` in `.env.beta`.

`APP_ENV` is `beta` or `prod`, the same names the backend uses: `make web APP_ENV=prod`. `scripts/with-env.sh` loads `apps/roundup/.env.<APP_ENV>` before Expo starts; `app.config.ts` only returns the config object.

### 📱 iOS and Android

`make ios` and `make android` need Xcode and Android Studio. Liquid Glass (the tab bar, the top bar, toasts and sheets) needs an iOS 26+ simulator; turn on **Reduce Transparency** and the surfaces go solid.

<p align="center"><img src="assets/svg/brand/divider.svg" width="100%" alt=""></p>

## 🧰 Commands

Every `make` target calls a root pnpm script.

| Command                                | What it does                                                         |
| -------------------------------------- | -------------------------------------------------------------------- |
| `make dev` / `web` / `ios` / `android` | Start Expo for a platform                                            |
| `make check`                           | Everything CI runs, except the web export and the Docker build       |
| `make lint`                            | ESLint with `--max-warnings=0`, then shellcheck                      |
| `make fmt` / `fmt-check`               | Prettier, write or check                                             |
| `make typecheck`                       | `tsc --noEmit` in every package                                      |
| `make test`                            | Jest in every package                                                |
| `make knip`                            | Unused files, exports and dependencies                               |
| `make syncpack`                        | Every dependency version comes from the pnpm catalog                 |
| `make files`                           | Fail on JavaScript files, bad script names and non-kebab-case assets |
| `make doctor`                          | `expo install --check`, then `expo-doctor`                           |
| `make updates`                         | Fail when a catalog dependency has a newer release it may take       |
| `make docker-up` / `down` / `logs`     | The static web build in Docker on port 8081                          |
| `make docker-smoke`                    | Assert URLs, 404 page, headers and health on the running image       |

Every dependency is pinned to an exact version (no `^` or `~`): `.npmrc` sets `save-exact`, and `make files` and `make syncpack` fail on a range. Node (`.nvmrc`), pnpm (`packageManager`) and the Docker base image are pinned the same way.

After any dependency change run `make doctor` and fix what it reports with `npx expo install --fix`, not by pinning versions by hand.

<p align="center"><img src="assets/svg/brand/divider.svg" width="100%" alt=""></p>

## 📁 Repository structure

```
roundup-ui/
├── apps/
│   └── roundup/        # @roundup/roundup: Expo SDK 58, Expo Router (routes in src/app = web URLs)
├── shared/
│   ├── config/         # @roundup/config: ESLint, Prettier, TypeScript and Jest settings, the SVG Jest transform
│   ├── i18n/           # @roundup/i18n: i18next + react-i18next, typed English resources, useT
│   └── ui/             # @roundup/ui: the design-system components, ThemeProvider and useTheme
├── assets/
│   ├── svg/            # every SVG: brand/ (README banner, divider), logo/, illustrations/, icons/
│   └── brand/          # the Onest font licence and notes on the logo files
├── sonar-project.properties  # SonarCloud settings, for when a project is connected
├── .githooks/          # pre-commit (lint-staged, tsc, expo-doctor) and commit-msg (commitlint)
├── .github/            # CI workflow and the pull request template
├── infra/sws.toml      # static-web-server settings: clean URLs, 404 page, headers, health
├── scripts/            # bash: docker-smoke, check-files, check-updates, copy-favicon, with-env, setup
├── Dockerfile          # deps → web export → static-web-server runtime
├── docker-compose.yml  # the web service on :8081
└── Makefile            # the front door
```

Every package has the same shape: `src/` for code and `tests/` beside it, mirroring `src/`'s paths (`shared/ui/src/components/Button.tsx` is tested by `shared/ui/tests/components/Button.test.tsx`). Test helpers live in `tests/helpers`. In `shared/ui`, each component is one flat file in `src/components`; helpers go in `src/lib` and the theme in `src/theme`.

Imports run one way: `app → ui → i18n`. `i18n` imports nothing internal, and `shared/*` never imports from `apps/*`; ESLint's boundaries rule enforces it.

### 🌍 Strings and i18n

Every user-visible string, including accessibility labels and hints, is a key in `shared/i18n/src/locales/en.ts` (nested by feature, `as const`). `t('nav.tabs.squads')` is type-checked against that file, so a misspelt key fails `tsc`. Components stay prop-driven; where a prop is omitted, its default copy comes from `useT()`. i18next starts synchronously with the bundled resources and picks the device language through `expo-localization`; English is the only language so far, and a new one is another file with the same shape. `eslint-plugin-i18next` fails the build on a literal string in JSX (text, `accessibilityLabel`, `placeholder`, `title` and the like), and the package's own tests check that every key the code uses exists and that none is empty. Jest setup imports the package, so tests query by the real English text.

### 🖼️ SVG assets

SVG files live in `assets/svg` and are imported as components: `import MarkDark from '…/assets/svg/logo/mark-dark.svg'`. Metro compiles them with `react-native-svg-transformer` (configured in `apps/roundup/metro.config.ts`), Jest with a matching SVGR transform (`shared/config/jest-svg-transform.ts`), and `shared/ui/src/svg.d.ts` types the import. Icons and the `mono` logo files use `currentColor`, so a `text-*` class (`text-accent`) tints them; shapes drawn in code use `fill-*` and `stroke-*` classes. `lib/svg.ts` lets an SVG component take a className (on native, `lib/svg.native.ts` maps it to react-native-svg's `color`, `fill` and `stroke` props). The few props that cannot take a class (a placeholder colour, the glass tint, the navigator background) read a role through `useRoleColor`. The `dark` and `light` logo files carry the `logo-*` role colours as literals, and `Logo.test.tsx` fails if they drift from `theme.css`. The logo is a mark, a wordmark of outlined paths (no font), or a lockup of both. `apps/roundup/public/favicon.svg` is generated from `logo/mark-dark.svg` by `scripts/copy-favicon.sh` before every dev, web and export run; it is git-ignored.

### 🎨 Tailwind classes

Components use Tailwind's default scale: `h-12`, `size-10`, `w-3/5`, `rounded-xl`, `md:flex`. `shared/ui/theme.css` (imported by `apps/roundup/global.css`) replaces only the colour palette with the role colours, adds the `type-*` text styles, the `shadow-sheet` and `shadow-toast` shadows and the 1200px `max-w-content`, and resets nothing else. Mocha is the default; Latte applies through `prefers-color-scheme` (the theme switch calls `Appearance.setColorScheme` on native and sets `data-theme` on the web). Breakpoints are Tailwind's `md` 768 and `lg` 1024, which `useBreakpoint` repeats in code. An arbitrary value (`text-[15px]`) is allowed only where no default step exists; `better-tailwindcss/enforce-canonical-classes` rewrites the rest. Tailwind sizes in rem, so `apps/roundup/metro.config.ts` sets `inlineRem: 16` and a class is the same size on native as on web.

<p align="center"><img src="assets/svg/brand/divider.svg" width="100%" alt=""></p>

## 📏 Rules the tooling enforces

Each rule in `shared/config/eslint.ts` carries a comment saying why it is on.

- **Strict types**: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and the typescript-eslint strict presets.
- **No semicolons**, 100 columns, single quotes, trailing commas (Prettier).
- **`Pressable` only**: `Touchable*` and React Native's `Button` are banned.
- **No `StyleSheet` and no inline style objects**: style with `className` and `cva`. Colours are roles (`bg-accent`), never primitives (`bg-ctp-mauve`) or `bg-[#fff]`.
- **Accessibility**: the a11y lint rules, role-and-label test queries (`getByTestId` is banned), types that force a `label` on icon-only buttons and inputs.
- **Conventional commits with a scope**: `feat(ui): add toast`, subject in lower case. Scopes: `app`, `ui`, `i18n`, `config`, `infra`, `deps`.
- **Named exports**, PascalCase component files, kebab-case everything else. Default exports only for Expo Router routes and tool configs.
- **No `any`, no `never`**: use `unknown` and narrow it; write exclusive union props as `prop?: undefined`; exhaustiveness comes from `switch-exhaustiveness-check` or `satisfies`.
- **No nested ternaries** (`no-nested-ternary` and SonarJS): use an early return, a lookup object or a small named helper.
- **No inline functions in JSX props** (`react/jsx-no-bind`, refs and DOM components included): pass a module-level function, a `useCallback`, or a handler that reads its data from props.
- **Blank lines in a fixed pattern** (`@stylistic/padding-line-between-statements`): before `return`/`throw`/`break`/`continue`, after a declaration group (single-line declarations may stack), around blocks, multi-line expressions and exports, and after directives. Test files add `jest/padding-around-all`. Neither rule is in `eslint-config-prettier`'s disable list, so no ordering trick is needed.
- **SonarQube rules** through `eslint-plugin-sonarjs`, every rule of its recommended set at error. A disabled rule needs a documented reason. `sonar-project.properties` is ready for a SonarCloud project; no service is connected.
- **JSDoc on everything** (`eslint-plugin-jsdoc`): functions, arrow functions, interfaces, type aliases, properties, enums and exported variables, with a description, `@param` and `@returns` descriptions, hyphens before them, and no types in the comment. Callbacks passed as arguments (`describe`, `it`, `.map`, `useEffect`) are exempt. Props are documented once, on their interface.
- **Every string in `@roundup/i18n`** and **default Tailwind classes** (see above).

The git hooks check, never rewrite: if one fails, run `make fmt` and stage again.

<p align="center"><img src="assets/svg/brand/divider.svg" width="100%" alt=""></p>

## 🐳 Docker

```sh
make setup
make docker-up         # http://localhost:8081
```

The image is built in stages: install from the lockfile, `expo export --platform web`, then the official `joseluisq/static-web-server:2.44.1-alpine` image (pinned) with the export in `/public` and `infra/sws.toml` as `/etc/sws.toml`. There is no custom server code. It runs as the image's non-root `sws` user on port 3000 (compose maps `8081:3000`).

`infra/sws.toml` makes it behave like this:

- **Clean URLs**: `/squads` serves `squads/index.html` with status 200 and no redirect (`redirect-trailing-slash = false`; `/squads/` works too).
- **404**: any unknown path returns the export's `+not-found.html` with status 404 (`page404`).
- **Caching**: `public, max-age=31536000, immutable` under `/_expo/static/`, `no-cache` on pages, one hour for `assets/`.
- **Security headers**: the Content-Security-Policy, `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`, set with `[[advanced.headers]]`. The Dockerfile replaces `__API_ORIGIN__` in the CSP's `connect-src` with the origin of `EXPO_PUBLIC_API_URL` while building.
- **Health**: `GET /health` returns 200 and is not logged; the compose healthcheck uses it.
- **Other**: directory listing is off, text files are compressed on demand, and SIGTERM (`docker stop`) makes the server stop accepting connections and finish in-flight requests.

`make docker-smoke` runs `scripts/docker-smoke.sh` against the running container and asserts all of the above; CI does the same after building the image.

`EXPO_PUBLIC_API_URL` is baked into the JavaScript at build time, so it is a build argument: rebuild after changing it.

<p align="center"><img src="assets/svg/brand/divider.svg" width="100%" alt=""></p>

## 🗺️ Not here yet

The API client (TanStack Query and orval), sign-in screens, view models, deploying the image, and end-to-end tests. See the pull request for the full list.
