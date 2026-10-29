<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/brand/banner-dark.svg">
    <img alt="Roundup: round up the squad, pick the place, split the bill" src="assets/brand/banner-light.svg" width="100%">
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

<p align="center"><img src="assets/brand/divider.svg" width="100%" alt=""></p>

## ✨ What is here

This is the foundation: the workspace, the strictest lint and type setup, generated design tokens, the NativeWind theme, every design-system component rebuilt in React Native, and an empty routed shell. There is no API client and there are no screens wired to the backend yet; sign-in comes next.

- 🎨 **Design tokens** from the Roundup design system, generated into TypeScript and a Tailwind theme. Mocha is the dark theme, Latte the light one.
- 🧩 **27 components** with the design system's prop names (`Button`, `TextField`, `Modal`, `SquadCard`…), each with accessibility built into its types and tests.
- 🧭 **A routed shell**: `/` is Welcome, `/squads`, `/explore` and `/profile` sit behind a side nav on wide screens and a bottom nav on narrow ones. iOS uses the system tab bar with Liquid Glass.
- 🌐 **Web first**: a static export served by a tiny Node server, in Docker.

> **Language policy:** TypeScript only. No `.js`, `.jsx`, `.mjs` or `.cjs` files, except the one-line shims listed in `.js-allowlist` (there are none today).

<p align="center"><img src="assets/brand/divider.svg" width="100%" alt=""></p>

## 🚀 Getting started

You need Node (the version in `.nvmrc`) and Docker if you want the container. pnpm comes with Node through corepack.

```sh
nvm use                # Node from .nvmrc
make install           # corepack enable + pnpm install --frozen-lockfile
make setup             # git hooks + apps/app/.env.beta from the template
make web               # the app on http://localhost:8081
```

`make setup` keeps an existing `apps/app/.env.beta`. `.env.prod` is never created for you: copy `.env.prod.example` and fill in real values.

To use the backend, start the Go services from [roundup-monorepo](https://github.com/SamPariat/roundup) (`make services-up`). The app expects the gateway at `EXPO_PUBLIC_API_URL`, which is `http://localhost:8080` in `.env.beta`.

`APP_ENV` is `beta` or `prod`, the same names the backend uses. Anything else stops the app at startup: `make web APP_ENV=prod`.

### 📱 iOS and Android

`make ios` and `make android` need Xcode and Android Studio. Liquid Glass (the tab bar, the top bar, toasts and sheets) needs an iOS 26+ simulator; turn on **Reduce Transparency** and the surfaces go solid.

<p align="center"><img src="assets/brand/divider.svg" width="100%" alt=""></p>

## 🧰 Commands

Every `make` target calls a root pnpm script.

| Command                                | What it does                                                   |
| -------------------------------------- | -------------------------------------------------------------- |
| `make dev` / `web` / `ios` / `android` | Start Expo for a platform                                      |
| `make check`                           | Everything CI runs, except the web export and the Docker build |
| `make lint`                            | ESLint with `--max-warnings=0`                                 |
| `make fmt` / `fmt-check`               | Prettier, write or check                                       |
| `make typecheck`                       | `tsc --noEmit` in every package                                |
| `make test`                            | Jest in every package                                          |
| `make tokens`                          | Regenerate `shared/tokens/src` from `tokens.json`              |
| `make knip`                            | Unused files, exports and dependencies                         |
| `make syncpack`                        | Every dependency version comes from the pnpm catalog           |
| `make no-js`                           | Fail on `.js`/`.jsx`/`.mjs`/`.cjs` files                       |
| `make doctor`                          | `expo install --check`, then `expo-doctor`                     |
| `make docker-up` / `down` / `logs`     | The static web build in Docker on port 8081                    |

After any dependency change run `make doctor` and fix what it reports with `npx expo install --fix`, not by pinning versions by hand.

<p align="center"><img src="assets/brand/divider.svg" width="100%" alt=""></p>

## 📁 Repository structure

```
roundup-ui/
├── apps/
│   ├── app/            # @roundup/app: Expo SDK 58, Expo Router (routes in src/app = web URLs)
│   └── server/         # @roundup/server: Hono on Node, serves the web export
├── shared/
│   ├── config/         # @roundup/config: ESLint, Prettier, TypeScript and Jest settings
│   ├── tokens/         # @roundup/tokens: tokens.json and the generator for tokens.ts and theme.css
│   └── ui/             # @roundup/ui: the design-system components, ThemeProvider and useTheme
├── assets/brand/       # logo, banner and mark files (from roundup-monorepo)
├── .githooks/          # pre-commit (lint-staged, tsc, expo-doctor) and commit-msg (commitlint)
├── .github/            # CI workflow and the pull request template
├── Dockerfile          # deps → web export → Node runtime
├── docker-compose.yml  # the web service on :8081
└── Makefile            # the front door
```

Imports run one way: `app → ui → tokens`. `shared/*` never imports from `apps/*`; ESLint enforces it.

<p align="center"><img src="assets/brand/divider.svg" width="100%" alt=""></p>

## 📏 Rules the tooling enforces

Each rule in `shared/config/eslint.ts` carries a comment saying why it is on.

- **Strict types**: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and the typescript-eslint strict presets.
- **No semicolons**, 100 columns, single quotes, trailing commas (Prettier).
- **`Pressable` only**: `Touchable*` and React Native's `Button` are banned.
- **No `StyleSheet` and no inline style objects**: style with `className` and `cva`. Colours are roles (`bg-accent`), never primitives (`bg-ctp-mauve`) or `bg-[#fff]`.
- **Accessibility**: the a11y lint rules, role-and-label test queries (`getByTestId` is banned), types that force a `label` on icon-only buttons and inputs.
- **Conventional commits with a scope**: `feat(ui): add Toast`. Scopes: `app`, `ui`, `tokens`, `config`, `infra`, `deps`.
- **Named exports**, PascalCase component files, kebab-case everything else. Default exports only for Expo Router routes and tool configs.

The git hooks check, never rewrite: if one fails, run `make fmt` and stage again.

<p align="center"><img src="assets/brand/divider.svg" width="100%" alt=""></p>

## 🐳 Docker

```sh
make setup
make docker-up         # http://localhost:8081
```

The image is built in three steps: install from the lockfile, `expo export --platform web`, then a small Node runtime that runs `apps/server/src/main.ts` as the non-root `node` user. The server maps clean URLs (`/squads`) to the export's HTML, serves the export's 404 page, caches hashed assets for a year, sets security headers, answers `/healthz` and shuts down cleanly on SIGTERM.

`EXPO_PUBLIC_API_URL` is baked into the JavaScript at build time, so it is a build argument: rebuild after changing it.

<p align="center"><img src="assets/brand/divider.svg" width="100%" alt=""></p>

## 🗺️ Not here yet

The API client (TanStack Query and orval), sign-in screens, view models, deploying the image, and end-to-end tests. See the pull request for the full list.
