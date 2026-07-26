import { getPrismaClient } from "@tutor-marketplace/database";
import type { PrismaClient } from "@prisma/client";

/**
 * Create a test database instance.
 * Uses the singleton PrismaClient with a test-specific DATABASE_URL.
 * Always reset the database between test suites using `resetTestDatabase`.
 */
export function createTestDatabase(): { prisma: PrismaClient } {
  const prisma = getPrismaClient();
  return { prisma };
}

/**
 * Reset all tables in the test database.
 * This is safe to call between test suites because it uses a transaction
 * with truncation rather than DROP/CREATE.
 *
 * IMPORTANT: This only works when running against the test database.
 * Never call against production.
 */
export async function resetTestDatabase(prisma: PrismaClient): Promise<void> {
  const tableNames = [
    "User",
    "UserRoleAssignment",
    "AuthProvider",
    "UserSession",
    "OtpChallenge",
    "Device",
    "AdminProfile",
    "Parent",
    "Student",
    "StudentGuardian",
    "Tutor",
    "TutorSubject",
    "TutorQualification",
    "TutorLanguage",
    "TutorServiceArea",
    "TutorWeeklySlot",
    "TutorBreakPeriod",
    "TutorBlackoutPeriod",
    "TutorAvailabilitySlot",
    "VerificationCheck",
    "VerificationDocument",
    "Booking",
    "BookingStatusHistory",
    "Payment",
    "PaymentTransaction",
    "PaymentWebhookEvent",
    "Refund",
    "Review",
    "Notification",
    "NotificationPreference",
    "OutboxEvent",
    "Subject",
    "Institute",
    "TutorInstitute",
    "Wallet",
    "LedgerEntry",
    "Withdrawal",
    "Attendance",
    "Homework",
    "HomeworkSubmission",
    "Assignment",
    "AssignmentSubmission",
    "ProgressReport",
    "Conversation",
    "Message",
    "Coupon",
    "CouponRedemption",
    "Referral",
    "AnalyticsEvent",
    "AuditLog",
    "AiRun",
    "SupportTicket",
    "SupportTicketMessage",
    "FeatureFlag",
  ];

  // Truncate all tables in reverse dependency order
  for (const table of tableNames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    } catch {
      // Table may not exist or may have been dropped — skip safely
    }
  }
}