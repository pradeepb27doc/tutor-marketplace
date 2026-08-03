-- ============================================================================
-- Milestone 18: Performance Indexes
-- Based on static code analysis of Prisma queries.
-- Only indexes that directly support existing query patterns.
-- ============================================================================

-- 1. Tutor Search: Composite index for filtered search with sorting
-- Supports: prisma-tutor-search.repository.ts - search() method
-- Query filters: status, deletedAt, city, gender, averageRating, experienceYears, baseHourlyRate
-- Query sorts: averageRating, experienceYears, baseHourlyRate, createdAt, completedClassesCount
-- Creates index for the most common filter + sort combination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tutor_search_active
  ON "Tutor" ("status", "deletedAt", "city", "averageRating" DESC)
  WHERE "status" = 'ACTIVE' AND "deletedAt" IS NULL;

-- 2. Tutor Search: Support city-only filter with rating sort
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tutor_city_rating
  ON "Tutor" ("city", "averageRating" DESC)
  WHERE "status" = 'ACTIVE' AND "deletedAt" IS NULL;

-- 3. Booking overlap detection queries (prisma-booking.repository.ts)
-- findOverlapping() and findByTutorIdAndTimeRange() use:
-- WHERE tutorId AND startAt < endAt AND endAt > startAt AND status IN (REQUESTED, ACCEPTED)
-- Current index (tutorId, startAt) is insufficient for overlap detection
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_overlap
  ON "Booking" ("tutorId", "startAt", "endAt")
  WHERE "status" IN ('REQUESTED', 'ACCEPTED');

-- 4. Admin search on users (prisma-admin.repository.ts - listUsers)
-- Uses contains/insensitive search on displayName, email, phone
-- PostgreSQL GIN trigram index supports ILIKE/contains operations
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_displayname_trgm
  ON "User" USING gin ("displayName" gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email_trgm
  ON "User" USING gin ("email" gin_trgm_ops);

-- 5. Payment listing sorted by createdAt (prisma-admin.repository.ts - listPayments)
-- existing (createdAt) index is fine but add composite with status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_status_created
  ON "Payment" ("status", "createdAt" DESC);

-- 6. Refund listing sorted by createdAt
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refund_status_created
  ON "Refund" ("status", "createdAt" DESC);

-- 7. Booking list by status sorted by startAt (admin list)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_status_startat
  ON "Booking" ("status", "startAt" DESC);

-- 8. Notification worker polling (notification-worker.service.ts)
-- Queries: status=QUEUED + nextAttemptAt IS NULL OR < now
-- Current index (status, nextAttemptAt) already supports this well
-- Adding a partial index for queued notifications ready for processing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_ready
  ON "Notification" ("status", "nextAttemptAt")
  WHERE "status" = 'QUEUED';

-- 9. Review listing by tutor status (prisma-review.repository queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_review_tutor_published
  ON "Review" ("tutorId", "status", "submittedAt" DESC)
  WHERE "status" = 'PUBLISHED';

-- ============================================================================
-- Notes:
-- 1. All indexes use CONCURRENTLY to avoid locking in production.
-- 2. Partial indexes reduce index size for large tables.
-- 3. Only indexes that map to existing query patterns were created.
-- 4. No speculative/guess-based indexes were added.
-- ============================================================================