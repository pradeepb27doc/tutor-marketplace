export type BookingManagementStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED_BY_PARENT"
  | "CANCELLED_BY_TUTOR"
  | "COMPLETED"
  | "RESCHEDULED"
  | "EXPIRED";

export type BookingManagementStatusVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface StatusHistoryEntryResponse {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedByUserId: string | null;
  reason: string | null;
  createdAt: string;
}

export interface BookingManagementResponse {
  id: string;
  publicId: string;
  parentId: string;
  studentId: string;
  tutorId: string;
  subjectId: string;
  tutorSubjectId: string | null;
  availabilitySlotId: string | null;
  classType: string;
  serviceMode: string;
  status: BookingManagementStatus;
  startAt: string;
  endAt: string;
  timezone: string;
  durationMinutes: number;
  city: string | null;
  address: Record<string, unknown> | null;
  priceAmount: string;
  platformFeeAmount: string;
  tutorEarningsAmount: string;
  currency: string;
  cancellationReason: string | null;
  rescheduledFromBookingId: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory?: StatusHistoryEntryResponse[];
}

export interface ListResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  limit?: number;
}

export interface BookingQueryParams {
  status?: string;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
  offset?: number;
}

export function bookingStatusToVariant(
  status: BookingManagementStatus,
): BookingManagementStatusVariant {
  switch (status) {
    case "REQUESTED":
    case "ACCEPTED":
      return "info";
    case "COMPLETED":
      return "success";
    case "CANCELLED_BY_PARENT":
    case "CANCELLED_BY_TUTOR":
    case "REJECTED":
      return "danger";
    case "RESCHEDULED":
      return "warning";
    case "EXPIRED":
      return "default";
    default:
      return "default";
  }
}

export function formatBookingStatus(status: BookingManagementStatus): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}