# ADR 0001: Modular Monolith for MVP

## Status

Accepted.

## Context

The marketplace needs strong consistency across booking, availability, payment, verification, child data, and audit logs. The product is also early enough that operational learning matters more than distributed-system complexity.

## Decision

Use a modular monolith for the MVP, implemented as a TypeScript monorepo with clear bounded contexts and package boundaries.

## Consequences

- Faster iteration for early product-market fit.
- Easier transactional integrity for booking and payment flows.
- Lower infrastructure overhead during MVP.
- Clear module boundaries preserve future service extraction options.
- Engineering discipline is required to prevent cross-module leakage.

