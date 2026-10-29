# syntax=docker/dockerfile:1

# Static web build served by a small Node server (apps/server). Build from the repo root:
#   docker build --build-arg EXPO_PUBLIC_API_URL=http://localhost:8080 .
ARG NODE_VERSION=24

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
RUN pnpm --filter @roundup/app run export:web
# The server and its production dependencies only, without the rest of the workspace.
RUN pnpm --filter @roundup/server deploy --prod --legacy /out

# Runtime: Node runs server.ts directly (type stripping), so there is no build step and no JS output.
FROM node:${NODE_VERSION}-alpine AS runtime
ARG EXPO_PUBLIC_API_URL
ENV NODE_ENV=production \
    PORT=3000 \
    DIST_DIR=/app/dist \
    API_ORIGIN=${EXPO_PUBLIC_API_URL}
WORKDIR /app
COPY --from=build --chown=node:node /out ./
COPY --from=build --chown=node:node /repo/apps/app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "src/main.ts"]
