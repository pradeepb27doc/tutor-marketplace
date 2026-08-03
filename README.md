# Tutor Marketplace (Mentora)

India-first education services marketplace for parents to discover, book, pay for, and manage verified tutors for children aged 3 to 15.

## Milestone Status

| Milestone | Description | Status |
|---|---|---|
| M1 | PRD | ✅ Complete |
| M2 | System Architecture | ✅ Complete |
| M3 | Folder Structure | ✅ Complete |
| M4 | Database Schema | ✅ Complete |
| M5 | REST API Specification | ✅ Complete |
| M6–M15 | Core Modules (Auth, Profiles, Catalog, Verification, Search, Bookings, Payments, Notifications, Reviews, Admin) | ✅ Complete |
| M16 | Critical Testing & CI/CD | ✅ Complete |
| M17 | Production Readiness Hardening | ✅ Complete |

## Workspace Shape

This repository is a TypeScript monorepo managed with pnpm workspaces.

| Path | Description |
|---|---|
| `apps/api` | NestJS REST API |
| `apps/worker` | NestJS background notification/outbox worker |
| `apps/web` | Next.js parent-facing web app |
| `apps/admin` | Next.js admin dashboard |
| `apps/mobile` | Expo React Native mobile app |
| `packages/domain` | Framework-independent domain primitives |
| `packages/application` | Use-case and port definitions |
| `packages/infrastructure` | Adapters for external services (Prisma, Razorpay, JWT) |
| `packages/config` | Zod-validated environment configuration |
| `packages/database` | Prisma schema and database package |
| `infra` | Deployment infrastructure (Docker, Terraform) |
| `docs` | Product, architecture, and implementation documentation |

## Prerequisites

- Node.js ≥ 22
- pnpm ≥ 11
- PostgreSQL 16 (for local dev / tests)
- Redis 7 (optional for worker)

## Development Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Create environment file
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, etc.

# 3. Run database migrations
pnpm --filter @tutor-marketplace/database prisma migrate deploy

# 4. Start the API and worker
pnpm dev:api      # http://localhost:4000
pnpm dev:worker   # background worker
```

Frontend apps can be started with:

```bash
pnpm dev:web      # http://localhost:3000
pnpm dev:admin    # http://localhost:3001
```

## Environment Variables

Copy `.env.example` to `.env` and fill in required values. Key variables:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (min 32 chars in production) |
| `REDIS_URL` | Optional | Redis connection string |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | For payments | Razorpay credentials |
| `RAZORPAY_WEBHOOK_SECRET` | For webhooks | Razorpay webhook secret |
| `CORS_ORIGINS` | Production | Comma-separated allowed origins |
| `NODE_ENV` | Optional | `development`, `staging`, or `production` |

## Verification Commands

```bash
# Structural verifiers
pnpm verify

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Unit tests
pnpm test

# Test coverage
pnpm test:coverage
```

## Docker Deployment

```bash
# Build images
docker compose build

# Start all services (requires JWT_SECRET in the environment)
export JWT_SECRET="$(openssl rand -base64 48)"
docker compose up -d
```

Services:
- API: http://localhost:4000 (health at `/v1/health`)
- Web: http://localhost:3000
- Admin: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

For detailed deployment instructions, see [docs/deployment.md](docs/deployment.md).

## CI/CD

GitHub Actions workflows are in `.github/workflows/`:

- `ci.yml` — lint, typecheck, test on every push/PR
- `docker.yml` — build and push Docker images
- `release.yml` — tagged release builds

## Architecture Overview

The system follows a modular monolith architecture with a clean hexagonal core:

- **API layer** (NestJS controllers + DTOs) → **Application layer** (use cases) → **Domain layer** (entities)
- **Infrastructure layer** implements ports (Prisma repositories, Razorpay gateway, JWT service)
- **Outbox pattern** enables reliable notification delivery via the background worker
- **JWT access tokens** (HS256, short-lived) + **opaque refresh tokens** (256-bit, hashed at rest)

See [docs/architecture-overview.md](docs/architecture-overview.md) for details.