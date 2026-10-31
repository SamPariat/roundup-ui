# syntax=docker/dockerfile:1

# Static web build served by static-web-server (settings in infra/sws.toml). Build from the repo root:
#   docker build --build-arg EXPO_PUBLIC_API_URL=http://localhost:8080 .
ARG NODE_VERSION=26.13.0

FROM node:${NODE_VERSION}-alpine AS base
# pnpm is pinned by "packageManager" in package.json; corepack fetches that exact version.
RUN corepack enable
WORKDIR /repo

# Layer 1: every dependency, downloaded from the lockfile alone, so it is cached until the lockfile changes.
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store pnpm fetch

# Layer 2: install from that cache, then export the web build.
FROM deps AS build
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --offline
# Expo bakes EXPO_PUBLIC_* values into the JavaScript at export time, so they are build args.
ARG APP_ENV=beta
ARG EXPO_PUBLIC_API_URL
ENV APP_ENV=${APP_ENV} \
    EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}
RUN pnpm --filter @roundup/roundup run export:web

# Fills the API origin into the committed server settings. The origin is EXPO_PUBLIC_API_URL
# without a path; with no URL the placeholder is simply removed, leaving connect-src 'self'.
FROM alpine:3 AS config
ARG EXPO_PUBLIC_API_URL
COPY infra/sws.toml /sws.toml
RUN origin="$(printf '%s' "${EXPO_PUBLIC_API_URL}" | sed -E 's#^(https?://[^/]+).*#\1#')" \
    && sed -i "s#__API_ORIGIN__#${origin}#" /sws.toml

# Runtime: static-web-server (https://static-web-server.net), the official image and no custom code.
# The alpine variant has wget for the compose healthcheck. The image already runs as the
# non-root user sws (uid 1000); USER says so explicitly.
FROM joseluisq/static-web-server:2.44.1-alpine AS runtime
COPY --from=build /repo/apps/roundup/dist /public
COPY --from=config /sws.toml /etc/sws.toml
USER sws
EXPOSE 3000
CMD ["--config-file", "/etc/sws.toml"]
