-- AlterEnum
-- Add value 'RESCHEDULED' to BookingStatus (between 'CANCELLED_BY_ADMIN' and 'EXPIRED')
ALTER TYPE "BookingStatus" ADD VALUE 'RESCHEDULED';

-- AlterEnum
-- Add value 'DEAD_LETTER' to NotificationStatus
ALTER TYPE "NotificationStatus" ADD VALUE 'DEAD_LETTER';

-- AlterTable: Add missing columns to Notification
ALTER TABLE "Notification"
  ADD COLUMN "provider" TEXT,
  ADD COLUMN "eventName" TEXT,
  ADD COLUMN "templateId" TEXT,
  ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en-IN',
  ADD COLUMN "recipient" TEXT,
  ADD COLUMN "idempotencyKey" TEXT,
  ADD COLUMN "correlationId" TEXT,
  ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "nextAttemptAt" TIMESTAMP(3),
  ADD COLUMN "lastError" TEXT;

-- CreateIndex for idempotencyKey uniqueness on Notification
CREATE UNIQUE INDEX "Notification_idempotencyKey_key" ON "Notification"("idempotencyKey");

-- CreateIndex for status & nextAttemptAt
CREATE INDEX "Notification_status_nextAttemptAt_idx" ON "Notification"("status", "nextAttemptAt");

-- CreateIndex for eventName & correlationId
CREATE INDEX "Notification_eventName_correlationId_idx" ON "Notification"("eventName", "correlationId");

-- AlterTable: Add rescheduledFromBookingId to Booking
ALTER TABLE "Booking"
  ADD COLUMN "rescheduledFromBookingId" TEXT;

-- AddForeignKey for Booking.rescheduledFromBookingId -> Booking.id
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_rescheduledFromBookingId_fkey" FOREIGN KEY ("rescheduledFromBookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: NotificationPreference
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "category" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for NotificationPreference
CREATE UNIQUE INDEX "NotificationPreference_userId_channel_category_key" ON "NotificationPreference"("userId", "channel", "category");
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");

-- AddForeignKey for NotificationPreference.userId -> User.id
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: NotificationTemplate
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en-IN',
    "titleTemplate" TEXT NOT NULL,
    "bodyTemplate" TEXT NOT NULL,
    "variables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for NotificationTemplate
CREATE UNIQUE INDEX "NotificationTemplate_eventName_channel_locale_version_key" ON "NotificationTemplate"("eventName", "channel", "locale", "version");
CREATE INDEX "NotificationTemplate_eventName_channel_locale_idx" ON "NotificationTemplate"("eventName", "channel", "locale");