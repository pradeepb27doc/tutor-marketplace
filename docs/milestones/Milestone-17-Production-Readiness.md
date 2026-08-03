# Milestone 17 Report — Production Readiness

## Security Issues Found

| # | Severity | Issue | File |
|---|---|---|---|
| 1 | **CRITICAL** | JWT signing used `createHash(data + secret)` instead of `createHmac` — vulnerable to length-extension attacks. No `alg` header validation. Non-constant-time signature comparison (`!==`). | `packages/infrastructure/src/auth/jwt-auth.service.ts` |
| 2 | **HIGH** | Razorpay payment signature verified with `===` (timing side-channel). | `packages/infrastructure/src/gateways/razorpay-payment.gateway.ts` |
| 3 | **MEDIUM** | API lacked security headers, production CORS restriction, body size limits, and graceful shutdown. | `apps/api/src/main.ts` |
| 4 | **MEDIUM** | Worker never called `enableShutdownHooks()` — `OnModuleDestroy` never fired on SIGTERM. No Prisma lifecycle or signal handlers. | `apps/worker/src/main.ts` |
| 5 | **MEDIUM** | Docker Compose hardcoded `postgres:postgres` and defaulted `JWT_SECRET` to `change-me-in-production`. No `CORS_ORIGINS` passthrough. | `docker-compose.yml` |
| 6 | **MEDIUM** | Worker missing `@tutor-marketplace/database` dependency for Prisma lifecycle. | `apps/worker/package.json` |

## Security Fixes Applied

1. **JWT service** — Replaced `createHash` with proper `createHmac("sha256", secret)`. Added constant-time `timingSafeEqual`. Added `alg` header validation (HS256 only). Added JSON parse error handling.
2. **Razorpay gateway** — Replaced `===` with `timingSafeEqual` in `verifyPayment`.
3. **API main.ts** — Added `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `X-XSS-Protection`, `Permissions-Policy` headers. Production-restricted CORS via `CORS_ORIGINS`. 1MB body limit. SIGTERM/SIGINT graceful shutdown with `disconnectPrisma()`.
4. **Worker main.ts** — Added `enableShutdownHooks()`, explicit SIGTERM/SIGINT handlers, Prisma connect/disconnect.
5. **docker-compose.yml** — Configurable DB credentials via env vars. `JWT_SECRET` mandatory (`${JWT_SECRET:?...}`). `CORS_ORIGINS` passthrough.
6. **.env.example** — Added `CORS_ORIGINS`, strengthened JWT secret guidance (32+ chars, `openssl rand -base64 48`).
7. **worker package.json** — Added `@tutor-marketplace/database` workspace dependency.

## Performance Review

**No changes required.** Prisma schema already has comprehensive indexes:
- `Notification @@index([status, nextAttemptAt])` — worker polling.
- `Booking @@index([parentId, status])`, `@@index([tutorId, startAt])`, `@@index([studentId, startAt])`.
- `Payment @@index([provider, status])`, `@@index([createdAt])`.
- `TutorAvailabilitySlot @@index([tutorId, startAt, endAt])`, `@@index([status, startAt])`.

All list endpoints use cursor/offset pagination. No N+1 patterns found. Prisma provides SQL injection protection.

## Docker Improvements

- `JWT_SECRET` now fails-fast if unset.
- DB credentials configurable via `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB`.
- `CORS_ORIGINS` passed to API container.

## API Improvements

- Global security headers middleware.
- Production-restricted CORS.
- 1MB request body limit.
- Graceful shutdown with Prisma disconnect.
- NestJS logger bound to `LOG_LEVEL` env.

## Frontend Review

**No changes required.** Frontend already has loading/error/empty state components per feature, global error boundary, route guards, and API error handling in all hooks.

## Worker Improvements

- `enableShutdownHooks()` ensures `NotificationWorkerService.stop()` fires.
- Explicit SIGTERM/SIGINT handlers with Prisma disconnect.
- Prisma connected at bootstrap.

## Dependency Changes

| Package | Change | Reason |
|---|---|---|
| `@tutor-marketplace/database` (worker) | Added `workspace:*` | Prisma lifecycle import |

No major upgrades — current pins are stable. Major upgrades (NestJS 11, Prisma 6.6, Next.js 15) should be scheduled separately.

## Documentation Updated

- `README.md` — Rewritten from stale placeholder: milestone table through M17, accurate workspace shape, dev setup, env var reference, Docker deployment, CI/CD.
- `.env.example` — Added `CORS_ORIGINS`, strengthened secret guidance.

## Verification Results

| Check | Result |
|---|---|
| `packages/infrastructure` tsc | ✅ Pass |
| `apps/worker` tsc | ✅ Pass |
| `apps/api` tsc | ⚠️ 1 pre-existing test assertion error (`totalUsers`), unrelated |
| Infrastructure unit tests (auth + gateways) | ✅ 33/33 passed |
| Full vitest | ✅ 499 unit tests passed. 127 integration failures require PostgreSQL at `localhost:5432` (environmental) |
| `pnpm install` | ✅ Lockfile updated |

## Production Readiness Score

**8.5 / 10** — Ready for limited production deployment. All critical/high security issues fixed and verified.

## Remaining Risks

1. **Rate limiting** — No app-level rate limiting. Use reverse proxy (Nginx/Cloudflare) on auth endpoints.
2. **`start` endpoint** — `POST /bookings/:bookingId/start` re-uses `AcceptBookingUseCase`; needs dedicated start-state use case.
3. **Redis unused** — `REDIS_URL` configured but no caching or distributed rate limiting.
4. **Sentry not wired** — `SENTRY_DSN` validated but not connected to exception filter.
5. **Pre-existing typecheck failures** — `apps/mobile` tsconfig invalid; stale admin test assertion.
6. **pnpm v11 deprecation** — `pnpm.onlyBuiltDependencies` in root package.json should move to `pnpm-workspace.yaml`.

## Recommendation for Milestone 18

1. Add rate limiting (reverse proxy or `@nestjs/throttler`).
2. Wire Sentry into the exception filter.
3. Add Redis caching for tutor search/availability.
4. Create dedicated `StartBookingUseCase`.
5. Fix pre-existing typecheck failures.
6. Set up staging environment mirroring production.