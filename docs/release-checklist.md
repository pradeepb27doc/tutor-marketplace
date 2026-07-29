# Release Checklist

Use this checklist before every production release.

## Pre-Release

### Code Quality

- [ ] All code changes reviewed and approved
- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm typecheck` passes with no errors
- [ ] `pnpm format:check` passes
- [ ] `pnpm verify` passes (workspace structure verification)

### Build

- [ ] `pnpm build` completes successfully for all packages
- [ ] Docker images build without errors:
  ```bash
  docker compose build --no-cache
  ```

### Tests

- [ ] `pnpm test` passes (all unit and integration tests)
- [ ] Playwright smoke tests pass (if browser available):
  ```bash
  cd apps/web && npx playwright test
  ```

### Environment

- [ ] `.env.example` is up to date with all required variables
- [ ] All required environment variables are configured in the target environment
- [ ] `DATABASE_URL` points to the correct database
- [ ] `JWT_SECRET` is a strong, unique value (not the default)
- [ ] `NODE_ENV` is set to `production`
- [ ] `LOG_LEVEL` is set to `info` or `warn` (not `debug`)

### Database

- [ ] Prisma migrations are up to date:
  ```bash
  pnpm --filter @tutor-marketplace/database prisma migrate status
  ```
- [ ] Database backup has been taken
- [ ] Migration plan reviewed for backward compatibility
- [ ] Rollback migration is available if needed

### Security

- [ ] No secrets committed to the repository
- [ ] API keys and tokens are stored in environment variables or secrets manager
- [ ] CORS settings are configured for production domains
- [ ] Rate limiting is enabled on API endpoints

---

## Release

### Deployment Steps

1. [ ] Tag the release:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

2. [ ] Build and push Docker images to container registry

3. [ ] Run database migrations:
   ```bash
   pnpm --filter @tutor-marketplace/database prisma migrate deploy
   ```

4. [ ] Deploy services in order:
   - [ ] Deploy API service
   - [ ] Deploy Worker service
   - [ ] Deploy Web frontend
   - [ ] Deploy Admin frontend

5. [ ] Verify health endpoints respond:
   - [ ] API: `GET /health` returns `200 OK`
   - [ ] Worker: Health logged on startup
   - [ ] Web: Homepage loads successfully
   - [ ] Admin: Dashboard loads successfully

---

## Post-Release

### Monitoring

- [ ] Application logs show no errors
- [ ] Sentry (if configured) shows no new issues
- [ ] Database connection pool is stable
- [ ] API response times are within normal range
- [ ] No increase in 4xx/5xx error rates

### Verification

- [ ] User registration and login works
- [ ] Tutor search returns results
- [ ] Booking flow completes end-to-end
- [ ] Payment flow completes (test mode)
- [ ] Dashboard pages load for all user roles
- [ ] Notifications are delivered

### Rollback Plan

If issues are detected:

1. **Revert database migration**:
   ```bash
   pnpm --filter @tutor-marketplace/database prisma migrate resolve --rolled-back <migration-name>
   ```

2. **Roll back Docker images** to previous tag:
   ```bash
   docker compose up -d api:previous-tag
   ```

3. **Revert code** via `git revert` and redeploy

---

## Quick Reference

```bash
# Pre-release checks
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm verify

# Database
pnpm --filter @tutor-marketplace/database prisma migrate status
pnpm --filter @tutor-marketplace/database prisma migrate deploy

# Docker
docker compose build --no-cache
docker compose up -d

# Health check
curl http://localhost:4000/health