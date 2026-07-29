 # Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN npm install -g pnpm@11.7.0
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile --filter @tutor-marketplace/worker

# Stage 2: Build
FROM node:22-alpine AS builder
RUN npm install -g pnpm@11.7.0
WORKDIR /app

# Copy package manifest and workspace config (cached)
COPY --from=deps /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json ./

# Copy ALL source and config files needed for build
COPY apps/worker/ ./apps/worker/
COPY tsconfig.base.json ./

# Install dependencies in builder to get fresh node_modules with correct symlinks
RUN pnpm install --frozen-lockfile --filter @tutor-marketplace/worker

RUN pnpm --filter @tutor-marketplace/worker build

# Stage 3: Production image
FROM node:22-alpine AS runner
RUN npm install -g pnpm@11.7.0
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy built artifacts
COPY --from=builder /app/apps/worker/dist ./dist
COPY --from=builder /app/apps/worker/package.json ./

# Copy only production dependencies
COPY --from=builder /app/node_modules ./node_modules
RUN pnpm prune --prod 2>/dev/null || true

# Copy Prisma client if needed
COPY --from=builder /app/packages/database ./packages/database

USER nestjs

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]