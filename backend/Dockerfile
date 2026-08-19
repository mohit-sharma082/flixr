# syntax=docker/dockerfile:1

# bookworm-slim, not alpine: bcrypt is a native module and ships glibc
# prebuilds. On musl it would have to compile from source (or fail).
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate
WORKDIR /app

# --- dependencies (cached until a manifest changes) -------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- compile TypeScript -> dist/ --------------------------------------------
FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN pnpm run build

# --- production dependencies only -------------------------------------------
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# --- runtime -----------------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

# Drop privileges: the node image ships an unprivileged `node` user.
USER node
EXPOSE 4000

# server.ts installs SIGTERM/SIGINT handlers for graceful shutdown, so run node
# as PID 1 directly (no shell wrapper, which would swallow the signals).
CMD ["node", "dist/server.js"]
