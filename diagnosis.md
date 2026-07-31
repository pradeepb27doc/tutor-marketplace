# Diagnosis: Worker Docker Build Downloads Entire Monorepo

## 1. Is @tutor-marketplace/worker depending on frontend packages?

**No.** The worker's dependency chain is entirely clean. There is no direct or transitive dependency on any frontend package.

### Worker dependency graph (from package.json files):

```
@tutor-marketplace/worker
├── @tutor-marketplace/application     → @tutor-marketplace/domain
├── @tutor-marketplace/config          → zod
├── @tutor-marketplace/domain          → (no dependencies)
├── @tutor-marketplace/infrastructure  → @tutor-marketplace/application
│                                        @tutor-marketplace/config
│                                        @tutor-marketplace/domain
│                                        @tutor-marketplace/database
│                                        razorpay
├── @nestjs/common
├── @nestjs/core
├── reflect-metadata
└── rxjs
```

None of these packages transitively depend on `next`, `react`, `playwright`, `tailwindcss`, or `react-native`.

---

## 2. Compare apps/api/package.json vs apps/worker/package.json

| Aspect | API | Worker |
|--------|-----|--------|
| Workspace deps | application, config, database, domain, infrastructure | application, config, domain, infrastructure |
| Additional deps | @nestjs/platform-express, @nestjs/swagger, class-transformer, class-validator | (none) |
| Direct deps count | 9 | 6 |
| devDependencies | @nestjs/cli, @types/express, @types/node, typescript, vitest | @nestjs/cli, @types/node, typescript, vitest |

Both use the same set of workspace packages (minus `database` which the worker doesn't need directly but gets via `infrastructure`). Neither has frontend dependencies.

---

## 3. Compare API and Worker Dockerfiles

### Install filter:

| Stage | API | Worker |
|-------|-----|--------|
| deps | (no deps stage) | `--filter @tutor-marketplace/worker` (no `...`) |
| builder | `--filter @tutor-marketplace/api...` (with `...`) | `--filter @tutor-marketplace/worker...` (with `...`) |
| deploy | `--filter @tutor-marketplace/api` | `--filter @tutor-marketplace/worker` |

The `...` suffix means "the package AND all its transitive workspace dependencies". Without `...`, only the package itself gets node_modules.

### Build filter:

Both use `--filter @tutor-marketplace/<name>` (no `...`).

### Deploy filter:

Both use `--filter @tutor-marketplace/<name>` (no `...`) with `--legacy --prod`.

### Key structural difference:

**Worker Dockerfile** has a redundant `deps` stage:
- Copies `packages/` (ALL packages source code) + `apps/worker/package.json`
- Runs `pnpm install --filter @tutor-marketplace/worker` (without `...`)
- **This stage copies ALL package source code but only the worker's package.json**

**API Dockerfile** has no `deps` stage:
- Single `builder` stage copies everything and runs `pnpm install --filter @tutor-marketplace/api...` (with `...`)

---

## 4. Why pnpm downloads next, react, playwright, tailwind, react-native

The root cause is **expected pnpm workspace behavior**:

> In pnpm v11 workspaces, the lockfile (`pnpm-lock.yaml`) is a single shared file that covers **every workspace package**. `pnpm install --filter <pkg>` only limits **which workspace packages get a `node_modules` directory** — it does **NOT** limit which packages are fetched from the registry. All packages listed in the lockfile (Next.js, React, Playwright, Tailwind, React Native, etc.) are downloaded into the store regardless of the filter.

**Source of the frontend packages in the lockfile:**

| Package | Source workspace | Declared in |
|---------|-----------------|-------------|
| `next` | `@tutor-marketplace/web` | apps/web/package.json |
| `react` | `@tutor-marketplace/web` | apps/web/package.json |
| `react-dom` | `@tutor-marketplace/web` | apps/web/package.json |
| `@playwright/test` | `@tutor-marketplace/web` | apps/web/package.json (devDeps) |
| `tailwindcss` | `@tutor-marketplace/web` | apps/web/package.json (devDeps) |
| `react-native` | `@tutor-marketplace/mobile` | apps/mobile/package.json |
| `expo` | `@tutor-marketplace/mobile` | apps/mobile/package.json |

The lockfile contains **3,365 package specifiers** across all 10+ workspaces in the monorepo (apps/web, apps/api, apps/worker, apps/admin, apps/mobile, packages/application, packages/config, packages/database, packages/domain, packages/infrastructure, packages/testing).

---

## 5. Root Cause Classification

**This is: expected pnpm workspace behavior.**

Specifically:
- The `--filter` flag does **not** limit registry downloads, only node_modules creation.
- pnpm's shared lockfile forces downloading all packages to the store.
- The API Dockerfile explicitly documents this behavior (lines 22-27) and accepts it.
- The worker Dockerfile has the same behavior but without the explanatory comment.

The worker Dockerfile has a **secondary issue**: a redundant `deps` stage that:
1. Copies `packages/` (all source code) unnecessarily
2. Runs `pnpm install` with `--filter @tutor-marketplace/worker` (without `...`), which doesn't install workspace dependencies' node_modules
3. Forces the builder stage to run `pnpm install` again (with `...`)

This means the worker build runs `pnpm install` **twice**, each time downloading all 3,365 packages. On a cold cache, this doubles the download time and risk of timeout.

---

## 6. Proposed Fix

### Minimal production-safe fix: Remove the redundant `deps` stage

The worker Dockerfile should be restructured from a 3-stage build (deps → builder → runner) to a 2-stage build (builder → runner), matching the API Dockerfile pattern.

**Current deps stage** (lines 2-17):
```dockerfile
FROM node:22-alpine AS deps
RUN npm install -g pnpm@11.7.0
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/ ./packages/
RUN echo "store-dir=/pnpm/store" >> .npmrc
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @tutor-marketplace/worker ...
```

**What this fix does:**
1. Eliminates one redundant `pnpm install` cycle (was downloading all 3,365 packages twice)
2. Removes the wasteful `COPY packages/ ./packages/` from the deps stage (was copying all package source code only to be discarded)
3. Simplifies the build to match the API Dockerfile pattern
4. Does NOT change the fundamental pnpm behavior (downloading all packages is expected)

**What this fix does NOT do:**
- It does NOT prevent pnpm from downloading frontend packages (this is expected behavior)
- The cache mount (`--mount=type=cache,target=/pnpm/store`) ensures subsequent builds reuse the store

### Additional improvement (optional): Document the expected behavior

Add a comment in the worker Dockerfile explaining why pnpm downloads all packages, matching the API Dockerfile's documentation.

### Why not other fixes?

| Fix | Issue |
|-----|-------|
| Separate lockfile | Complex, error-prone, requires tooling changes |
| Copy only needed packages | Partially addresses source copy but not the registry download |
| Increase timeouts | Only masks the symptom, doesn't fix the root cause |
| Use `--filter` differently | Filter doesn't control registry downloads |