# Architecture Overview

## Overall Architecture

Tutor Marketplace follows a **modular monolith** architecture, organized as a monorepo with clearly defined domain boundaries. The system is designed for eventual extraction into microservices should scaling requirements demand it.

---

## Folder Structure

```
├── apps/
│   ├── api/              # NestJS REST API server
│   ├── web/              # Next.js frontend (student/parent/tutor portal)
│   ├── admin/            # Next.js admin dashboard (separate app)
│   ├── worker/           # Background job worker (NestJS)
│   └── mobile/           # React Native mobile app (placeholder)
├── packages/
│   ├── application/      # Use cases, ports, DTOs (core business logic)
│   ├── domain/           # Domain entities, value objects, domain services
│   ├── infrastructure/   # Adapters (database, email, payment, notifications)
│   ├── database/         # Prisma schema, migrations, DB client
│   ├── config/           # Environment configuration, env loading
│   └── testing/          # Shared test utilities, fixtures
├── docs/                 # Documentation
├── infra/                # Infrastructure as Code (Docker, Terraform)
├── tools/                # Build/verification tooling
└── .github/workflows/    # CI/CD pipelines
```

---

## Technology Stack

### Frontend
- **Next.js 15** (React, App Router)
- **Tailwind CSS** v4 for styling
- **Lucide React** for icons
- **Playwright** for E2E testing

### Backend
- **NestJS 11** (Node.js framework)
- **Prisma ORM** for database access
- **PostgreSQL** as primary database
- **JWT** for stateless authentication

### Infrastructure
- **Docker** containerization
- **Docker Compose** for local development
- **GitHub Actions** for CI/CD
- **pnpm** workspaces for monorepo management

---

## Design Decisions

### 1. Modular Monolith over Microservices
- **Context**: The application has multiple bounded contexts (auth, profiles, bookings, payments, reviews, notifications)
- **Decision**: Start as a modular monolith within a single NestJS application, organized by domain modules
- **Rationale**: Simplifies development, deployment, and debugging. Domain boundaries are respected through package structure, making future extraction simpler
- **Trade-off**: Single deployment unit; scaling requires replicating the entire API

### 2. Clean Architecture / Hexagonal Architecture
- **Context**: Business logic needs to be testable and framework-independent
- **Decision**: Use ports and adapters pattern
  - `packages/application` contains use cases and port interfaces
  - `packages/infrastructure` contains adapters (Prisma, email, payment gateways)
  - `apps/api` contains NestJS-specific wiring (controllers, modules)
- **Rationale**: Business logic is decoupled from frameworks, databases, and external services
- **Benefit**: Use cases can be tested without database or HTTP

### 3. TypeScript Everywhere
- **Context**: Multiple packages need to share types
- **Decision**: TypeScript throughout the stack
- **Rationale**: Shared type safety between frontend and backend, better developer experience

### 4. Prisma as ORM
- **Context**: Need database access with type safety and migrations
- **Decision**: Prisma ORM with PostgreSQL
- **Rationale**: Type-safe queries, auto-generated client, schema-first approach

### 5. Next.js App Router
- **Context**: Frontend needs routing, SSR, and API integration
- **Decision**: Next.js App Router with Server Components where possible
- **Rationale**: Better performance, smaller client bundles, progressive enhancement

### 6. Monorepo with pnpm Workspaces
- **Context**: Multiple shared packages across apps
- **Decision**: pnpm workspaces with shared packages
- **Rationale**: Single version of dependencies, shared types, easier refactoring

---

## Key Architectural Patterns

### Use Case Pattern
```
Controller -> Use Case (in application package) -> Repository (interface)
                                                      |
                                            Infrastructure Adapter (Prisma)
```

### Repository Pattern
- Interfaces defined in `packages/application`
- Implementations in `packages/infrastructure/src/repositories/`
- Prisma client injected via dependency injection

### Feature-Based Frontend Organization
```
features/
  auth/
    components/   # React components
    hooks/        # Custom hooks
    services/     # API clients
    types/        # TypeScript types
    constants/    # Configuration
```

---

## Deployment Architecture

```
                       ┌─────────────┐
                       │   CDN / LB   │
                       └──────┬──────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
        │  Next.js  │  │ Next.js   │  │           │
        │   Web     │  │  Admin    │  │  Nginx    │
        └───────────┘  └───────────┘  └─────┬─────┘
                                            │
                                      ┌─────▼─────┐
                                      │  NestJS   │
                                      │   API     │
                                      └─────┬─────┘
                                            │
                                      ┌─────▼─────┐
                                      │PostgreSQL │
                                      └───────────┘
```

### Docker Services
- **api**: NestJS application server
- **web**: Next.js frontend
- **admin**: Next.js admin panel
- **worker**: Background job processor
- **postgres**: Database

---

## Security Model

See [security.md](./security.md) for detailed security documentation.

---

## Performance Considerations

See [performance.md](./performance.md) for detailed performance documentation.

---

## API Versioning

- URI-based versioning (`/v1/auth/login`, `/v1/me`)
- Default version set to `1`
- Public endpoints marked with `@Public()` decorator

---

## Error Handling

- Global exception filter catches all unhandled errors
- Consistent response format: `{ error: { code, message, requestId } }`
- Validation errors from class-validator are automatically formatted
- 500 errors never expose stack traces

---

## Database

- PostgreSQL via Prisma ORM
- Migrations managed by Prisma Migrate
- Connection management via `@tutor-marketplace/database` package
- Schema defined in `packages/database/prisma/schema.prisma`

---

## Observability

- Structured logger abstraction in `packages/application/src/observability/logger.ts`
- Supports custom transports for Sentry, OpenTelemetry, etc.
- Request ID tracking via `x-request-id` header
- Admin audit logging for sensitive operations

---

## CI/CD

- GitHub Actions for lint, typecheck, and test
- Docker multi-stage builds
- Automated deployment pipeline (configurable per environment)
- See `.github/workflows/ci.yml` for details