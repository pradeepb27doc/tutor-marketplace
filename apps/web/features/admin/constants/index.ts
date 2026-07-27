export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export const ADMIN_PAGE_SIZE = 20;
export const ADMIN_MAX_PAGE_SIZE = 100;

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", value: "dashboard", path: "/admin/dashboard" },
  { label: "Users", value: "users", path: "/admin/users" },
  { label: "Tutors", value: "tutors", path: "/admin/tutors" },
  { label: "Bookings", value: "bookings", path: "/admin/bookings" },
  { label: "Payments", value: "payments", path: "/admin/payments" },
  { label: "Reviews", value: "reviews", path: "/admin/reviews" },
  { label: "Verifications", value: "verifications", path: "/admin/verifications" },
  { label: "Audit Logs", value: "audit-logs", path: "/admin/audit-logs" },
] as const;

export const USER_STATUS_FILTERS = ["ACTIVE", "SUSPENDED", "PENDING"] as const;
export const USER_ROLE_FILTERS = ["ADMIN", "SUPPORT", "FINANCE", "TUTOR", "PARENT"] as const;

export const TUTOR_STATUS_FILTERS = [
  "ACTIVE",
  "SUSPENDED",
  "PENDING",
  "NOT_VERIFIED",
  "VERIFIED",
  "REJECTED",
] as const;

export const BOOKING_STATUS_FILTERS = [
  "REQUESTED",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED_BY_PARENT",
  "CANCELLED_BY_TUTOR",
  "COMPLETED",
  "RESCHEDULED",
  "EXPIRED",
] as const;

export const PAYMENT_STATUS_FILTERS = [
  "CREATED",
  "AUTHORIZED",
  "CAPTURED",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
  "CANCELLED",
] as const;

export const REFUND_STATUS_FILTERS = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "PROCESSED",
  "FAILED",
] as const;

export const REVIEW_STATUS_FILTERS = ["PUBLISHED", "HIDDEN", "FLAGGED"] as const;

export const VERIFICATION_STATUS_FILTERS = [
  "NOT_SUBMITTED",
  "SUBMITTED",
  "UNDER_REVIEW",
  "CHANGES_REQUESTED",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
] as const;

export const AUDIT_ENTITY_TYPES = [
  "USER",
  "BOOKING",
  "PAYMENT",
  "REFUND",
  "REVIEW",
  "VERIFICATION",
] as const;

export const AUDIT_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "SUSPEND",
  "ACTIVATE",
  "APPROVE",
  "REJECT",
  "CANCEL",
] as const;

export const VERIFICATION_TYPE_LABELS: Record<string, string> = {
  GOVERNMENT_ID: "Government ID",
  DEGREE: "Degree",
  EXPERIENCE: "Experience",
  POLICE: "Police Check",
  BACKGROUND_CHECK: "Background Check",
  ADDRESS: "Address",
  REFERENCE: "Reference",
};

export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  NOT_SUBMITTED: "Not Submitted",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  CHANGES_REQUESTED: "Changes Requested",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  UPLOADED: "Uploaded",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};
