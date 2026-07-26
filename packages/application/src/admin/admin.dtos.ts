import type {
  AdminUserSummary,
  AdminTutorSummary,
  AdminBookingSummary,
  AdminPaymentSummary,
  AdminRefundSummary,
  AuditLogRecord,
  CursorPage,
  AdminOverview,
} from "./admin.repository.js";

// --- Query / input DTOs ---

export interface AdminListUsersQuery {
  cursor?: string | null;
  limit?: number;
  status?: string;
  role?: string;
  search?: string;
}

export interface AdminListTutorsQuery {
  cursor?: string | null;
  limit?: number;
  status?: string;
  search?: string;
}

export interface AdminListBookingsQuery {
  cursor?: string | null;
  limit?: number;
  status?: string;
}

export interface AdminListPaymentsQuery {
  cursor?: string | null;
  limit?: number;
  status?: string;
}

export interface AdminListRefundsQuery {
  cursor?: string | null;
  limit?: number;
  status?: string;
}

export interface AdminListAuditLogsQuery {
  cursor?: string | null;
  limit?: number;
  entityType?: string;
  action?: string;
}

// --- Response DTOs ---

export type AdminUserListDto = CursorPage<AdminUserSummary>;
export type AdminTutorListDto = CursorPage<AdminTutorSummary>;
export type AdminBookingListDto = CursorPage<AdminBookingSummary>;
export type AdminPaymentListDto = CursorPage<AdminPaymentSummary>;
export type AdminRefundListDto = CursorPage<AdminRefundSummary>;
export type AdminAuditLogListDto = CursorPage<AuditLogRecord>;

export type { AdminUserSummary, AdminTutorSummary, AdminBookingSummary, AdminPaymentSummary, AdminRefundSummary, AuditLogRecord, AdminOverview };