/**
 * Admin types — matching backend DTOs from packages/application/src/admin/*
 * and packages/application/src/tutors/verification.dtos.ts
 *
 * Backend endpoints:
 * - GET /admin/overview
 * - GET /admin/users, /admin/users/:id, POST /admin/users/:id/suspend, POST /admin/users/:id/activate
 * - GET /admin/tutors
 * - GET /admin/bookings, /admin/bookings/:id, POST /admin/bookings/:id/cancel
 * - GET /admin/payments, GET /admin/refunds
 * - GET /admin/audit-logs
 * - GET /admin/verifications, /admin/verifications/:tutorId, POST /admin/verifications/:tutorId/approve,
 *   POST /admin/verifications/:tutorId/reject, POST /admin/verifications/:tutorId/request-changes
 * - GET /admin/reviews, POST /admin/reviews/:reviewId/publish, POST /admin/reviews/:reviewId/hide,
 *   POST /admin/reviews/:reviewId/moderate
 */

// --- Overview ---

export interface AdminOverview {
  users: { total: number; byStatus: Record<string, number> };
  tutors: { total: number; byStatus: Record<string, number> };
  bookings: { total: number; byStatus: Record<string, number> };
  payments: { total: number; totalCapturedAmount: number };
  refunds: { total: number };
}

// --- Cursor Pagination ---

export interface CursorPage<T> {
  data: T[];
  page: {
    nextCursor: string | null;
    limit: number;
    hasMore: boolean;
  };
}

// --- User Management ---

export interface AdminUserSummary {
  id: string;
  publicId: string;
  displayName: string | null;
  primaryRole: string;
  status: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserSummary {
  roles: string[];
}

// --- Tutor Management ---

export interface AdminTutorSummary {
  id: string;
  userId: string;
  status: string;
  headline: string | null;
  city: string | null;
  experienceYears: number;
  averageRating: string;
  createdAt: string;
}

// --- Booking Management ---

export interface AdminBookingSummary {
  id: string;
  publicId: string;
  parentId: string;
  studentId: string;
  tutorId: string;
  classType: string;
  serviceMode: string;
  status: string;
  startAt: string;
  endAt: string;
  priceAmount: string;
  currency: string;
}

// --- Payment Management ---

export interface AdminPaymentSummary {
  id: string;
  bookingId: string;
  parentId: string;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
}

export interface AdminRefundSummary {
  id: string;
  paymentId: string;
  bookingId: string;
  status: string;
  amount: number;
  currency: string;
  reason: string | null;
  requestedByUserId: string | null;
  createdAt: string;
}

// --- Audit Logs ---

export interface AuditLogRecord {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// --- Verification Queue ---

export type VerificationTypeValue =
  | "GOVERNMENT_ID"
  | "DEGREE"
  | "EXPERIENCE"
  | "POLICE"
  | "BACKGROUND_CHECK"
  | "ADDRESS"
  | "REFERENCE";

export type VerificationStatusValue =
  | "NOT_SUBMITTED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

export type DocumentStatusValue = "UPLOADED" | "VERIFIED" | "REJECTED" | "EXPIRED";

export interface VerificationDocumentDto {
  id: string;
  verificationCheckId: string | null;
  type: VerificationTypeValue;
  status: DocumentStatusValue;
  fileKey: string;
  originalFileName: string | null;
  mimeType: string | null;
  uploadedAt: string;
  expiresAt: string | null;
}

export interface VerificationCaseCheckDto {
  type: VerificationTypeValue;
  status: VerificationStatusValue;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  documents: VerificationDocumentDto[];
}

export interface VerificationCaseSummaryDto {
  tutorId: string;
  status: string;
  city: string | null;
  headline: string | null;
  createdAt: string;
  pendingCheckTypes: VerificationTypeValue[];
}

export interface VerificationCaseDto {
  tutorId: string;
  tutorUserId: string;
  status: string;
  city: string | null;
  headline: string | null;
  createdAt: string;
  checks: VerificationCaseCheckDto[];
}

export interface ListVerificationCasesResultDto {
  data: VerificationCaseSummaryDto[];
  page: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

// --- Review Moderation ---

export interface ReviewDto {
  id: string;
  bookingId: string;
  parentId: string;
  studentId: string;
  tutorId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  status: string;
  moderatedByUserId: string | null;
  moderatedAt: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type ReviewModerationStatus = "PUBLISHED" | "HIDDEN" | "FLAGGED";

// --- Action Result ---

export interface AdminActionResult<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// --- Load Status ---

export type LoadStatus = "idle" | "loading" | "success" | "error";
