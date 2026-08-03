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
    pnpm install --frozen-lockfile --filter @tutor-marketplace/admin... \
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
# packages/ is required so that the @tutor-marketplace/config workspace
# dependency has its source available for compilation before the Next.js
# build resolves the import.
COPY --from=deps /app/packages ./packages
COPY apps/admin/ ./apps/admin/
COPY tsconfig.base.json ./

ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies in builder to get fresh node_modules with correct symlinks.
# --filter with "..." (three dots) includes all transitive workspace deps
# (config -> zod), matching the API/Worker Dockerfile pattern. Without it,
# zod types are unavailable and config's tsc fails with TS7006.
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @tutor-marketplace/admin... \
      --config.network-timeout=300000 \
      --config.fetch-retries=5 \
      --config.fetch-retry-mintimeout=10000

# Build required workspace packages before building the admin app.
# @tutor-marketplace/config has "main": "dist/index.js" — its TypeScript
# source must be compiled to dist/ before Next.js can resolve the import.
RUN pnpm --filter @tutor-marketplace/config build

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

# Healthcheck: Next.js standalone server responds on port 3001.
# Use node instead of wget because wget may not be available in the
# node:22-alpine image and because the non-root user may not be able
# to reach localhost via wget even though the server is listening.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const http=require('http');const host=require('os').hostname();const req=http.request({host,port:3001,path:'/',method:'GET',timeout:3000},(res)=>process.exit(res.statusCode<500?0:1));req.on('error',()=>process.exit(1));req.end();" || exit 1

CMD ["node", "apps/admin/server.js"]
