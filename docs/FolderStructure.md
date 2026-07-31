# Folder Structure

## 1. Purpose

This document defines the monorepo scaffold for the tutor marketplace. It is Milestone 3 and establishes where code should live before implementation begins.

The goal is to make future modules easy to place without mixing concerns across API controllers, domain rules, infrastructure adapters, mobile UI, admin operations, and documentation.

## 2. Architecture Decision

Use a pnpm TypeScript monorepo with four runtime apps and five shared packages.

This structure supports the modular monolith decision from the system architecture while keeping future service extraction practical.

## 3. Top-Level Structure

```text
.
|-- apps
|   |-- api
|   |-- worker
|   |-- mobile
|   `-- admin
|-- packages
|   |-- domain
|   |-- application
|   |-- infrastructure
|   |-- config
|   `-- database
|-- infra
|   |-- docker
|   `-- terraform
|-- docs
|   `-- adr
|-- tools
|-- package.json
|-- pnpm-workspace.yaml
`-- tsconfig.base.json
```

## 4. Runtime Apps

### `apps/api`

NestJS REST API.

Owns:

- HTTP controllers
- DTO validation
- API versioning
- Guards and interceptors
- Module composition

Does not own:

- Domain rules
- Direct provider SDK logic
- Raw Prisma access outside repositories

### `apps/worker`

NestJS worker process.

Owns:

- Queue consumers
- Outbox dispatch
- Payment reconciliation jobs
- Notification jobs
- Reminder jobs
- Report jobs
- Future AI jobs

### `apps/mobile`

Expo React Native app.

Owns:

- Parent experience
- Tutor experience
- Student dashboard where appropriate
- Mobile navigation
- Mobile API clients
- Offline-aware mobile state

### `apps/admin`

Next.js admin dashboard.

Owns:

- Tutor verification workflows
- Booking operations
- Payment and refund operations
- Support workflows
- Fraud review
- Audit log inspection
- Admin analytics

## 5. Shared Packages

### `packages/domain`

Framework-independent business rules.

Examples:

- Booking state machine
- Cancellation policy
- Tutor verification status rules
- Payment ledger invariants
- Review eligibility rules

### `packages/application`

Use cases and ports.

Examples:

- `CreateBooking`
- `AcceptBooking`
- `SubmitTutorVerification`
- `CapturePaymentWebhook`
- `MarkAttendance`

### `packages/infrastructure`

External adapters.

Examples:

- Prisma repositories
- Redis cache
- BullMQ queues
- Razorpay adapter
- Firebase Cloud Messaging adapter
- Object storage adapter
- PostHog adapter
- Sentry adapter

### `packages/config`

Shared configuration and environment helpers.

### `packages/database`

Prisma schema, migrations, seed data, and database utilities.

The actual marketplace data model is intentionally deferred to Milestone 4.

## 6. Supporting Folders

### `infra`

Infrastructure assets. Docker and Terraform are placeholders until their dedicated milestones.

### `docs`

Product and engineering documentation.

### `tools`

Repository scripts that must run without framework dependencies when possible.

## 7. Boundary Rules

- API controllers call application use cases.
- Application use cases depend on ports, not provider SDKs.
- Domain code imports no frameworks.
- Infrastructure implements ports.
- Worker jobs must be idempotent.
- Database schema changes live in `packages/database`.
- Mobile and admin clients do not bypass the API.
- Admin actions must eventually write audit logs.

## 8. Current Verification

The scaffold includes dependency-free checks:

```powershell
node tools/verify-structure.mjs
node tools/verify-prisma-schema.mjs
```

These verify the monorepo contract and required schema coverage without installing external packages.

Compile and full test gates will be enabled after dependencies are installed with the first implementation modules.

## 9. Next Milestone Handoff

Milestone 4 implemented `packages/database/prisma/schema.prisma` with the normalized PostgreSQL data model from the PRD and architecture documents.

The schema includes enums, relations, indexes, auditability fields, and seed-data readiness.
