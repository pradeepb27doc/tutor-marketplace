# Database Schema

## 1. Purpose

This document summarizes the Milestone 4 Prisma data model for the tutor marketplace.

The schema lives at `packages/database/prisma/schema.prisma` and is designed for PostgreSQL with Prisma ORM.

## 2. Design Principles

- Normalize core marketplace data instead of storing product state in generic JSON blobs.
- Use explicit enums for lifecycle-heavy domains such as users, verification, bookings, payments, refunds, attendance, reviews, notifications, and jobs.
- Protect child, payment, and KYC workflows with relational integrity and auditability.
- Keep money movement in payment, refund, wallet, ledger, and withdrawal records.
- Support the MVP while leaving room for subscriptions, chat, AI, institutes, referrals, coupons, and support operations.
- Favor indexes around search, booking, payment, and operations queries.

## 3. Core Areas

### Identity and Access

Models:

- `User`
- `UserRoleAssignment`
- `AuthProvider`
- `UserSession`
- `OtpChallenge`
- `Device`
- `AdminProfile`

The schema supports OTP login, provider login, role assignment, session revocation, devices, and admin profiles.

### Family and Students

Models:

- `Parent`
- `Student`
- `StudentGuardian`

Parents can manage multiple children. Students can optionally have their own user account later, but the MVP can keep student access parent-controlled.

### Tutor Supply and Institutes

Models:

- `Tutor`
- `Institute`
- `TutorInstitute`
- `TutorQualification`
- `TutorServiceArea`
- `Subject`
- `TutorSubject`

Tutor discovery can filter by subject, grade, curriculum, service mode, city, rating, completed classes, verification state, and availability.

### Verification

Models:

- `VerificationCheck`
- `VerificationDocument`

Verification is modeled as workflow state, not a single boolean. This supports government ID, degree, experience, police, background, address, and reference checks.

### Availability and Booking

Models:

- `TutorAvailabilitySlot`
- `TutorBlackoutPeriod`
- `Booking`
- `BookingStatusHistory`

Bookings reference parent, student, tutor, subject, optional tutor offering, and optional reserved availability slot. Booking status history gives operations a clear lifecycle trail.

### Payments and Ledger

Models:

- `Payment`
- `PaymentTransaction`
- `PaymentWebhookEvent`
- `Refund`
- `Wallet`
- `LedgerEntry`
- `Withdrawal`

Payment webhooks and ledger entries are designed for idempotency and reconciliation. Tutor balances are derived from wallet and ledger records rather than hidden booking mutations.

### Learning Operations

Models:

- `Attendance`
- `Homework`
- `HomeworkSubmission`
- `Assignment`
- `AssignmentSubmission`
- `ProgressReport`

These models make completed classes, student work, and parent-visible progress measurable.

### Trust, Communication, and Growth

Models:

- `Review`
- `Conversation`
- `Message`
- `Notification`
- `Coupon`
- `CouponRedemption`
- `Referral`
- `SupportTicket`
- `SupportTicketMessage`

Chat is present in the data model but can remain feature-flagged until moderation and policy rules are implemented.

### Platform Operations

Models:

- `AnalyticsEvent`
- `AuditLog`
- `OutboxEvent`
- `AiRun`
- `FeatureFlag`

The outbox table supports reliable side effects. Audit logs protect admin and financial operations. AI runs are stored separately so generated outputs remain traceable.

## 4. High-Risk Invariants

The schema supports these invariants directly:

- A tutor has exactly one user account.
- A parent can manage multiple students through guardian links.
- A booking belongs to one parent, one student, one tutor, and one subject.
- A booking can reserve at most one availability slot.
- A slot can be linked to at most one booking.
- Attendance is one-to-one with a booking.
- A parent can review a booking only once.
- Payment provider order IDs, payment IDs, refund IDs, and idempotency keys are unique.
- Wallets are one-to-one with tutors.
- Verification checks are unique by tutor and check type.
- Outbox events and audit logs are append-oriented operational records.

## 5. Known Follow-Ups

- Add database migrations once dependencies are installed and Prisma CLI validation is available.
- Add seed data for launch subjects, grades, sample tutors, parents, students, availability, bookings, and admin users.
- Add repository integration tests against PostgreSQL.
- Decide exact PII retention and anonymization rules before production.
- Add partial indexes or raw SQL migrations if PostgreSQL-specific query plans require them.

## 6. API Handoff

Milestone 5 maps the schema to REST routes in `docs/RestApiSpecification.md`.
