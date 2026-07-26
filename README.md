# Tutor Marketplace

India-first education services marketplace for parents to discover, book, pay for, and manage verified tutors for children aged 3 to 15.

## Milestone Status

- Milestone 1: PRD - complete
- Milestone 2: System Architecture - complete
- Milestone 3: Folder Structure - complete
- Milestone 4: Database Schema - complete
- Milestone 5: REST API Specification - complete
- Milestone 6: Authentication System - pending approval

## Workspace Shape

This repository is a TypeScript monorepo managed with pnpm workspaces.

- `apps/api`: NestJS REST API
- `apps/worker`: NestJS background worker
- `apps/mobile`: Expo React Native mobile app
- `apps/admin`: Next.js admin dashboard
- `packages/domain`: framework-independent domain primitives
- `packages/application`: use-case and port definitions
- `packages/infrastructure`: adapters for external services
- `packages/config`: shared configuration helpers
- `packages/database`: Prisma schema and database package
- `infra`: deployment and infrastructure configuration placeholders
- `docs`: product, architecture, and implementation documentation

## Current Verification

Run the structural verifiers without installing dependencies:

```powershell
node tools/verify-structure.mjs
node tools/verify-prisma-schema.mjs
node tools/verify-api-spec.mjs
```

Framework dependencies are declared in package manifests but are not installed yet. The next implementation milestones will add the lockfile, migrations, concrete services, and compile/test gates module by module.
