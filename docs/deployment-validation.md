# Deployment Validation

## Purpose

This document defines the deployment validation procedure for the Tutor Marketplace staging environment. It ensures all services start correctly, pass health checks, and work together as expected.

---

## 1. Startup Sequence

Services must start in dependency order. The `docker-compose.yml` defines the dependency graph automatically via `depends_on` with `condition: service_healthy`.

### Order

```
1. PostgreSQL  ─┐
                 ├──> API ──> Web
2. Redis ────────┘           │
                             └──> Admin
3. Worker (depends on PostgreSQL + Redis)
```

### Manual Startup (if not using docker-compose)

```bash
# 1. Start infrastructure
docker compose up -d postgres redis

# 2. Wait for database to be ready
docker compose exec postgres pg_isready -U postgres

# 3. Start API
docker compose up -d api

# 4. Wait for API health
curl -f http://localhost:4000/health

# 5. Start Worker
docker compose up -d worker

# 6. Start Web
docker compose up -d web

# 7. Start Admin
docker compose up -d admin
```

### Using docker-compose (all at once)

```bash
docker compose up --build -d
```

---

## 2. Health Checks

### Service Health Endpoints

| Service   | Endpoint                        | Expected Response                                      |
|-----------|----------------------------------|--------------------------------------------------------|
| API       | `GET http://localhost:4000/health` | `{ "status": "ok", "service": "api", "checkedAt": "..." }` |
| Worker    | Container logs on startup        | Logs: `Worker health check passed`                     |
| Web       | `GET http://localhost:3000/`     | HTTP 200, HTML page loads                              |
| Admin     | `GET http://localhost:3001/`     | HTTP 200, HTML page loads                              |
| PostgreSQL| Container healthcheck            | `pg_isready` returns `ok`                              |
| Redis     | Container healthcheck            | `redis-cli ping` returns `PONG`                        |

### Automated Health Check Script

```bash
#!/bin/bash
# health-check.sh

echo "=== Tutor Marketplace Health Check ==="

echo -n "PostgreSQL: "
docker compose exec postgres pg_isready -U postgres && echo "OK" || echo "FAIL"

echo -n "Redis: "
docker compose exec redis redis-cli ping && echo "OK" || echo "FAIL"

echo -n "API: "
curl -sf http://localhost:4000/health && echo "OK" || echo "FAIL"

echo -n "Web: "
curl -sf -o /dev/null http://localhost:3000/ && echo "OK" || echo "FAIL"

echo -n "Admin: "
curl -sf -o /dev/null http://localhost:3001/ && echo "OK" || echo "FAIL"

echo -n "Worker: "
docker compose logs worker --tail=5 | grep -q "Worker" && echo "OK (check logs)" || echo "NOT VERIFIED"

echo "=== Health Check Complete ==="
```

---

## 3. Smoke Test Checklist

Run these checks after all services are healthy.

### Infrastructure

- [ ] PostgreSQL is accepting connections
- [ ] Redis responds to `PING`
- [ ] All Docker containers show `Up` status (`docker compose ps`)
- [ ] No container is restarting in a loop

### API

- [ ] `GET /health` returns 200 with `"status": "ok"`
- [ ] `GET /api/v1/catalog/tutors` returns valid JSON
- [ ] `POST /api/v1/auth/register` returns validation errors with proper messages
- [ ] Authentication endpoints respond without 500 errors

### Web Frontend

- [ ] Homepage loads without JavaScript errors
- [ ] Search page renders
- [ ] Tutor profile page loads
- [ ] Login page displays
- [ ] Signup page displays

### Admin Frontend

- [ ] Admin login page loads
- [ ] Dashboard page renders (if authenticated)
- [ ] Admin tables load data

### Worker

- [ ] Worker starts successfully (check logs)
- [ ] No unhandled exceptions on startup

### Integration

- [ ] API is reachable from Web container
- [ ] API is reachable from Admin container
- [ ] Web frontend can make API requests

---

## 4. Rollback Procedure

### Prerequisites

- Previous Docker images tagged with version (e.g., `v1.0.0`)
- Database backup taken before deployment
- Rollback migration script available

### Rollback Steps

```bash
# 1. Stop all services
docker compose down

# 2. Restore database from backup (if schema changed)
#    psql DATABASE_URL < backup_before_deploy.sql

# 3. Roll back Docker images to previous tag
docker compose -f docker-compose.rollback.yml up -d
# Or manually:
docker pull registry.example.com/tutor-marketplace/api:previous-tag
docker compose up -d api

# 4. Run database rollback migration (if schema changed)
docker compose run --rm api pnpm --filter @tutor-marketplace/database prisma migrate resolve --rolled-back <migration-name>

# 5. Verify health
curl -f http://localhost:4000/health

# 6. Run smoke tests
```

### Database Rollback

```bash
# Check migration status
docker compose run --rm api pnpm --filter @tutor-marketplace/database prisma migrate status

# Roll back if needed
docker compose run --rm api pnpm --filter @tutor-marketplace/database prisma migrate resolve --rolled-back <problematic-migration>
```

### Quick Rollback (single command)

```bash
# Tag: latest → previous-tag
docker compose down && \
  docker compose pull && \
  docker compose up -d
```

---

## 5. Logging and Monitoring Validation

- [ ] Application logs are visible via `docker compose logs`
- [ ] Log level is set to `info` or `warn` (not `debug` in staging/production)
- [ ] Sentry DSN is configured (if using Sentry)
- [ ] No `console.log` statements in production code paths

---

## 6. Environment Configuration Validation

- [ ] `.env` file exists in project root
- [ ] `DATABASE_URL` points to the correct database
- [ ] `REDIS_URL` points to the correct Redis instance
- [ ] `JWT_SECRET` is at least 16 characters
- [ ] `NODE_ENV` is set to `production` or `staging`
- [ ] `NEXT_PUBLIC_API_URL` is the correct API URL
- [ ] `NEXT_PUBLIC_ADMIN_URL` is the correct Admin URL