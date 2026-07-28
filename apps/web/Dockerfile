# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@11.7.0 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile --filter @tutor-marketplace/web

# Stage 2: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11.7.0 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/web ./apps/web
COPY --from=deps /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json ./
COPY tsconfig.base.json ./

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter @tutor-marketplace/web build

# Stage 3: Production image
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@11.7.0 --activate
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["node", "apps/web/server.js"]