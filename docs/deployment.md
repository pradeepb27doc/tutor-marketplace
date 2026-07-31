# Deployment Guide

## Overview

This document covers deployment of the Tutor Marketplace application across three environments: local development, Docker-based deployment, and production deployment.

## Architecture

The application consists of four services:

- **API** (NestJS) - Backend REST API on port 4000
- **Worker** (NestJS) - Background job processor
- **Web** (Next.js) - Main frontend application on port 3000
- **Admin** (Next.js) - Admin dashboard on port 3001

Infrastructure dependencies:

- **PostgreSQL 16** - Primary database
- **Redis 7** - Caching and job queues

---

## Prerequisites

- Node.js >= 22.0.0
- pnpm >= 11.0.0
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL 16 (for local deployment)
- Redis 7 (for local deployment)

---

## Local Deployment

### 1. Clone and install

```bash
git clone <repository-url>
cd tutor-marketplace
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

Required variables in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Minimum 16 characters

### 3. Generate Prisma client and run migrations

```bash
pnpm --filter @tutor-marketplace/database prisma generate
pnpm --filter @tutor-marketplace/database prisma migrate dev --name init
```

### 4. Build all packages

```bash
pnpm build
```

### 5. Start services

```bash
# Start API
pnpm dev:api

# Start Worker (in separate terminal)
pnpm dev:worker

# Start Web frontend (in separate terminal)
cd apps/web && pnpm dev

# Start Admin frontend (in separate terminal)
cd apps/admin && pnpm dev
```

---

## Docker Deployment

### Build and run all services

```bash
# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

### Run individual services

```bash
# Start only infrastructure
docker compose up -d postgres redis

# Start a specific app
docker compose up -d api

# Rebuild a specific service
docker compose build api
```

### Health checks

Each service exposes a health endpoint:

- API: `http://localhost:4000/v1/health`
- Worker: Health logged on startup
- Web: `http://localhost:3000/` (homepage)
- Admin: `http://localhost:3001/` (dashboard)

### Environment variables for Docker

Create a `.env` file in the project root. The `docker-compose.yml` reads from it:

```bash
JWT_SECRET=your-production-secret-min-16-chars
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ADMIN_URL=https://admin.yourdomain.com
LOG_LEVEL=info
```

---

## Production Deployment

### Recommended infrastructure

- **Container orchestration**: Kubernetes or Docker Compose (single-host)
- **Database**: Managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
- **Redis**: Managed Redis (AWS ElastiCache, Upstash, etc.)
- **Object storage**: S3-compatible for file uploads
- **Reverse proxy**: Nginx / Traefik with TLS termination
- **CI/CD**: GitHub Actions (see `.github/workflows/ci.yml`)

### Build production images

```bash
# Build all images
docker compose build

# Tag and push to container registry
docker tag tutor-marketplace-api registry.example.com/tutor-marketplace/api:latest
docker push registry.example.com/tutor-marketplace/api:latest
```

### Database migrations

Always run migrations before deploying new application code:

```bash
# Locate via Docker
docker compose run --rm api pnpm --filter @tutor-marketplace/database prisma migrate deploy

# Or via direct connection
DATABASE_URL="..." pnpm --filter @tutor-marketplace/database prisma migrate deploy
```

### Environment variables required in production

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `JWT_SECRET` | Yes | JWT signing secret (min 16 chars) |
| `JWT_ACCESS_TOKEN_EXPIRY_SECONDS` | No | Default: 900 |
| `JWT_REFRESH_TOKEN_EXPIRY_DAYS` | No | Default: 30 |
| `RAZORPAY_KEY_ID` | Yes* | Live Razorpay key |
| `RAZORPAY_KEY_SECRET` | Yes* | Live Razorpay secret |
| `RAZORPAY_WEBHOOK_SECRET` | Yes* | Webhook verification secret |
| `API_PORT` | No | Default: 4000 |
| `SENTRY_DSN` | No | Error reporting DSN |
| `LOG_LEVEL` | No | Default: debug |
| `NODE_ENV` | No | Set to `production` |
| `NEXT_PUBLIC_API_URL` | Yes | Public API URL for frontend |

*Required if payment features are enabled

### Health check endpoints

- **API**: `GET /v1/health` → `{ "status": "ok", "service": "api", "checkedAt": "..." }`
- **Worker**: Logs health on startup
- **Web/Admin**: Application-level health via response status 200

---

## Build Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm build` | Build all packages and apps |
| `pnpm build:api` | Build only API |
| `pnpm build:web` | Build only Web frontend |
| `pnpm build:admin` | Build only Admin frontend |
| `pnpm build:worker` | Build only Worker |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm test` | Run all test suites |
| `pnpm format:check` | Check code formatting |
| `pnpm verify` | Run workspace structure verification |

---

## Troubleshooting

### Database connection failed

```
Error: Missing required environment variables: DATABASE_URL
```

Ensure `.env` file exists with `DATABASE_URL` set and PostgreSQL is running.

### Prisma client not generated

```bash
pnpm --filter @tutor-marketplace/database prisma generate
```

### Port already in use

```bash
# Check what is using the port
lsof -i :4000
# Kill the process or change API_PORT in .env
```

### Docker build fails

```bash
# Rebuild without cache
docker compose build --no-cache api

# Check Docker logs
docker compose logs api
```

### TypeScript compilation errors

```bash
# Run typecheck to see all errors
pnpm typecheck
```

### Tests failing

```bash
# Run tests with more verbose output
pnpm test -- --reporter verbose

# Run specific test suite
pnpm test:api