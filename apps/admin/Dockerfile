# syntax=docker/dockerfile:1
# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN npm install -g pnpm@11.7.0
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/admin/package.json ./apps/admin/package.json
COPY packages/ ./packages/

RUN echo "store-dir=/pnpm/store" >> .npmrc

RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @tutor-marketplace/admin \
      --config.network-timeout=300000 \
      --config.fetch-retries=5 \
      --config.fetch-retry-mintimeout=10000

# Stage 2: Build
FROM node:22-alpine AS builder
RUN npm install -g pnpm@11.7.0
WORKDIR /app

# Copy package manifest and workspace config (cached)
COPY --from=deps /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json /app/.npmrc ./

# Copy ALL source and config files needed for build
COPY apps/admin/ ./apps/admin/
COPY tsconfig.base.json ./

ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies in builder to get fresh node_modules with correct symlinks
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @tutor-marketplace/admin \
      --config.network-timeout=300000 \
      --config.fetch-retries=5 \
      --config.fetch-retry-mintimeout=10000

RUN pnpm --filter @tutor-marketplace/admin build

# Stage 3: Production image
FROM node:22-alpine AS runner
RUN npm install -g pnpm@11.7.0
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static

USER nextjs

EXPOSE 3001

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["node", "apps/admin/server.js"]
