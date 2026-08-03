# Milestone 15 — Production CI/CD Pipeline

## Overview

This document describes the production-grade GitHub Actions CI/CD pipeline implemented for the Tutor Marketplace monorepo. The pipeline consists of three workflows that cover code quality checks, Docker integration testing, security scanning, and release publishing.

---

## Workflow Explanation

### 1. `ci.yml` — Continuous Integration

**Triggers:** `push` (to `main`/`develop`), `pull_request` (any branch)

**Jobs:**

#### `verify` job
Runs on `ubuntu-latest` with PostgreSQL 16 and Redis 7 service containers.

| Step | Description |
|------|-------------|
| Checkout | `actions/checkout@v4` |
| Setup Node.js 22 | `actions/setup-node@v4` with `node-version: "22"` |
| Enable Corepack | `corepack enable && corepack prepare pnpm@11.7.0 --activate` |
| Cache pnpm store | `actions/cache@v4` keyed on `pnpm-lock.yaml` hash |
| Install dependencies | `pnpm install --frozen-lockfile` |
| Generate Prisma Client | `pnpm --filter @tutor-marketplace/database prisma generate` |
| Lint | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Run unit tests | `pnpm test:coverage` with JUnit + coverage reporters |
| Build all packages | `pnpm build` (API, worker, web, admin) |
| Upload coverage | Artifact `coverage/` (14-day retention) |
| Upload junit | Artifact `test-results/` (14-day retention) |

#### `workspace-verify` job
Depends on `verify`. Runs structural/schema/API-spec verification (`pnpm verify`).

---

### 2. `docker.yml` — Docker Build & Integration Test

**Triggers:** `push` (to `main`/`develop`), `pull_request`

**Jobs:**

#### `build-and-test` job
Runs on `ubuntu-latest` with a 30-minute timeout.

| Step | Description |
|------|-------------|
| Checkout | `actions/checkout@v4` |
| Set up Docker Buildx | `docker/setup-buildx-action@v3` (BuildKit enabled) |
| Cache Docker layers | `actions/cache@v4` at `/tmp/.buildx-cache` |
| `docker compose build` | Builds all 4 service images with BuildKit |
| `docker compose up -d` | Starts full stack with `--wait` for healthchecks |
| Wait for healthy services | Polls `docker compose ps` until all 5 services healthy (120s max) |
| Verify `GET /v1/health` | `curl http://localhost:4000/v1/health` — checks `.status` field |
| Verify `GET localhost:3000` | `curl http://localhost:3000` — checks HTTP 2xx-4xx |
| Verify `GET localhost:3001` | `curl http://localhost:3001` — checks HTTP 2xx-4xx |
| Collect logs if failure | `if: always()` — saves per-service logs to `logs/` |
| `docker compose down` | `if: always()` — tears down with `--volumes --remove-orphans` |
| Upload logs artifact | Artifact `docker-logs/` (14-day retention) |

#### `trivy-scan` job
Depends on `build-and-test`. Rebuilds images from cache and scans each with Trivy.

| Image | Trivy Scan |
|-------|------------|
| `tutor-marketplace-api` | SARIF output, CRITICAL+HIGH severity |
| `tutor-marketplace-worker` | SARIF output, CRITICAL+HIGH severity |
| `tutor-marketplace-web` | SARIF output, CRITICAL+HIGH severity |
| `tutor-marketplace-admin` | SARIF output, CRITICAL+HIGH severity |

SARIF results uploaded as artifact `trivy-sarif` (30-day retention). Scan uses `exit-code: "0"` (advisory) in CI; `exit-code: "1"` (blocking) in release.

---

### 3. `release.yml` — Release Publishing

**Triggers:** `push` of tags matching `v*.*.*`, plus `workflow_dispatch` for manual runs.

**Permissions:** `contents: read`, `packages: write`

**Job:**

| Step | Description |
|------|-------------|
| Checkout | Full history (`fetch-depth: 0`) |
| Determine version | Extracts version from tag or manual input; strips leading `v` |
| Set up Docker Buildx | BuildKit enabled |
| Cache Docker layers | Separate release cache key |
| Log in to GHCR | `docker/login-action@v3` using `GITHUB_TOKEN` |
| Build Docker images | `docker compose build` |
| Tag images | Tags each image with `vX.Y.Z`, `X.Y.Z`, and `latest` |
| Trivy scan (blocking) | `exit-code: "1"` — fails release on CRITICAL/HIGH vulns |
| Push to GHCR | Pushes all 3 tags per image to `ghcr.io` |
| Upload SARIF | Trivy scan results artifact (30-day retention) |
| Create GitHub Release | `softprops/action-gh-release@v2` with auto-generated notes |

**Image naming convention:**
```
ghcr.io/<owner>/tutor-marketplace-api:v1.0.0
ghcr.io/<owner>/tutor-marketplace-api:1.0.0
ghcr.io/<owner>/tutor-marketplace-api:latest
```

---

## Caching Strategy

### pnpm Store Cache
- **Key:** `${{ runner.os }}-pnpm-11.7.0-${{ hashFiles('**/pnpm-lock.yaml') }}`
- **Restore keys:** `${{ runner.os }}-pnpm-11.7.0-`
- **Path:** pnpm store directory (resolved at runtime)

### Docker BuildKit Cache
- **Key:** `${{ runner.os }}-buildx-${{ github.sha }}` (CI/Docker), `${{ runner.os }}-buildx-release-${{ github.sha }}` (Release)
- **Restore keys:** Falls back to prefix matches
- **Path:** `/tmp/.buildx-cache`
- **BuildKit inline cache:** `BUILDKIT_INLINE_CACHE=1` enables cache reuse
- **Dockerfile cache mounts:** Each Dockerfile uses `--mount=type=cache,target=/pnpm/store` for pnpm store caching during image builds

---

## Artifacts Summary

| Workflow | Artifact | Contents | Retention |
|----------|----------|----------|-----------|
| CI | `coverage` | HTML/LCOV coverage reports | 14 days |
| CI | `junit` | JUnit XML test results | 14 days |
| Docker | `docker-logs` | Per-service container logs | 14 days |
| Docker | `trivy-sarif` | Trivy SARIF security scans | 30 days |
| Release | `release-trivy-sarif` | Trivy SARIF security scans | 30 days |

---

## Changed Files

| File | Change Type | Description |
|------|-------------|-------------|
| `.github/workflows/ci.yml` | **Replaced** | Complete rewrite: Node 22, Corepack, pnpm cache, Prisma generate, lint, typecheck, coverage+junit tests, build, artifacts |
| `.github/workflows/docker.yml` | **Created** | New workflow: Docker compose build/up/verify/down, health checks, log collection, Trivy security scan |
| `.github/workflows/release.yml` | **Created** | New workflow: Tag-triggered release, GHCR push, Trivy blocking scan, GitHub Release creation |
| `docker-compose.yml` | **Modified** | Added explicit `image:` fields for `api`, `worker`, `web`, `admin` services for deterministic image naming |

---

## Verification Steps

### 1. YAML Syntax Validation
All workflow files and `docker-compose.yml` have been validated as syntactically correct YAML:

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/docker.yml'))"
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/release.yml'))"
python3 -c "import yaml; yaml.safe_load(open('docker-compose.yml'))"
```

### 2. Local Docker Compose Validation
```bash
docker compose config --quiet
```

### 3. GitHub Actions Validation
To validate workflow syntax before pushing:
```bash
# Install actionlint
go install github.com/rhysd/actionlint/cmd/actionlint@latest

# Validate all workflows
actionlint .github/workflows/*.yml
```

### 4. Manual Trigger Testing
- **CI/Docker:** Push to any branch or open a PR — both workflows trigger automatically.
- **Release:** Push a tag: `git tag v1.0.0 && git push origin v1.0.0`
- **Release (manual):** Go to Actions → Release → Run workflow → enter version.

### 5. Health Endpoint Verification
The pipeline verifies:
- `GET http://localhost:4000/v1/health` — API health (NestJS, URI versioned)
- `GET http://localhost:3000` — Web frontend (Next.js standalone)
- `GET http://localhost:3001` — Admin frontend (Next.js standalone)

---

## Assumptions

1. **Node.js 22** is the target runtime (matches `engines.node: ">=22.0.0"` in `package.json`).
2. **pnpm 11.7.0** is the package manager (matches `packageManager` field in `package.json`).
3. **Corepack** is used to enable pnpm (instead of `pnpm/action-setup`), as required by the milestone.
4. **BuildKit** is enabled via `DOCKER_BUILDKIT=1` and `docker/setup-buildx-action@v3`.
5. **Docker HEALTHCHECK** instructions are already defined in all four Dockerfiles:
   - API: `wget --spider http://localhost:4000/v1/health`
   - Web: `node -e` HTTP check on port 3000
   - Admin: `node -e` HTTP check on port 3001
   - Worker: `node -e` process-alive check via `/proc/1/comm`
6. **`docker compose up -d --wait`** blocks until all service healthchecks pass (or fail), leveraging the existing HEALTHCHECK definitions.
7. **PostgreSQL and Redis** are provided as GitHub Actions service containers in the CI workflow for unit tests that require database access.
8. **Trivy SARIF** format is used for security scan results, enabling integration with GitHub Code Scanning if desired.
9. **GHCR (GitHub Container Registry)** is the target registry for releases, using the built-in `GITHUB_TOKEN` for authentication (no additional secrets required).
10. **Image naming:** Explicit `image:` fields added to `docker-compose.yml` ensure deterministic image names (`tutor-marketplace-api`, etc.) regardless of the checkout directory name. This is a non-behavioral change — it only makes naming explicit.
11. **Concurrency groups** cancel in-flight CI/Docker runs for the same ref when new commits arrive, but release runs are never cancelled (to prevent partial pushes).
12. **No application code was changed** — only CI/CD configuration and `docker-compose.yml` image naming.
13. **Vitest coverage** uses `@vitest/coverage-v8` (implied by `test:coverage` script); the CI passes `--coverage.reporter` flags for `text`, `lcov`, and `html` output formats.
14. **JUnit reporter** is built into Vitest; the CI passes `--reporter=junit --outputFile=test-results/junit.xml` to generate the JUnit XML artifact.