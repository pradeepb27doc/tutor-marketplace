-- ============================================================================
-- Milestone 18: Performance Indexes
-- Based on static code analysis of Prisma queries.
-- Only indexes that directly support existing query patterns.
--
-- NOTE: These indexes use PostgreSQL features (partial predicates, DESC sort,
-- GIN trigram, extensions) that cannot be expressed in the Prisma schema DSL,
-- so they are defined as a raw SQL Prisma migration. `prisma migrate deploy`
-- records this in the _prisma_migrations table.
--
-- CONCURRENTLY is intentionally omitted: Prisma runs migrations inside a
-- transaction, and CREATE INDEX CONCURRENTLY cannot run inside a transaction.
-- ============================================================================

-- 1. Tutor Search: Composite index for filtered search with sorting
CREATE INDEX IF NOT EXISTS idx_tutor_search_active
  ON "Tutor" ("status", "deletedAt", "city", "averageRating" DESC)
  WHERE "status" = 'ACTIVE' AND "deletedAt" IS NULL;

-- 2. Tutor Search: Support city-only filter with rating sort
CREATE INDEX IF NOT EXISTS idx_tutor_city_rating
  ON "Tutor" ("city", "averageRating" DESC)
  WHERE "status" = 'ACTIVE' AND "deletedAt" IS NULL;

-- 3. Booking overlap detection queries (prisma-booking.repository.ts)
CREATE INDEX IF NOT EXISTS idx_booking_overlap
  ON "Booking" ("tutorId", "startAt", "endAt")
  WHERE "status" IN ('REQUESTED', 'ACCEPTED');

-- 4. Admin search on users (prisma-admin.repository.ts - listUsers)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_user_displayname_trgm
  ON "User" USING gin ("displayName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_user_email_trgm
  ON "User" USING gin ("email" gin_trgm_ops);

-- 5. Payment listing sorted by createdAt (prisma-admin.repository.ts - listPayments)
CREATE INDEX IF NOT EXISTS idx_payment_status_created
  ON "Payment" ("status", "createdAt" DESC);

-- 6. Refund listing sorted by createdAt
CREATE INDEX IF NOT EXISTS idx_refund_status_created
  ON "Refund" ("status", "createdAt" DESC);

-- 7. Booking list by status sorted by startAt (admin list)
CREATE INDEX IF NOT EXISTS idx_booking_status_startat
  ON "Booking" ("status", "startAt" DESC);

-- 8. Notification worker polling (notification-worker.service.ts)
CREATE INDEX IF NOT EXISTS idx_notification_ready
  ON "Notification" ("status", "nextAttemptAt")
  WHERE "status" = 'QUEUED';

-- 9. Review listing by tutor status (prisma-review.repository queries)
CREATE INDEX IF NOT EXISTS idx_review_tutor_published
  ON "Review" ("tutorId", "status", "submittedAt" DESC)
  WHERE "status" = 'PUBLISHED';
