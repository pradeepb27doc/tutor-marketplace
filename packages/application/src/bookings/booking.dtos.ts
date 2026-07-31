import type { BookingRecord, StatusHistoryRecord } from "./booking.repository.js";

export interface CreateBookingInput {
  studentId: string;
  tutorId: string;
  subjectId: string;
  tutorSubjectId?: string;
  availabilitySlotId: string;
  city?: string;
  address?: Record<string, any>;
}

export interface RescheduleBookingInput {
  newAvailabilitySlotId: string;
  reason?: string;
}

export interface BookingQueryInput {
  status?: string;
  from?: string; // ISO date string
  to?: string;   // ISO date string
  limit?: number;
  offset?: number;
}

export interface BookingDto {
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
  status: string;
  startAt: string;
  endAt: string;
  timezone: string;
  durationMinutes: number;
  city: string | null;
  address: Record<string, any> | null;
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
  statusHistory?: StatusHistoryEntryDto[];
}

export interface StatusHistoryEntryDto {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedByUserId: string | null;
  reason: string | null;
  createdAt: string;
}

export interface RescheduleResultDto {
  oldBooking: BookingDto;
  newBooking: BookingDto;
}

export type BookingListDto = BookingDto[];

/** Mapper functions */

export function toBookingDto(
  record: BookingRecord,
  history?: StatusHistoryRecord[],
): BookingDto {
  return {
    id: record.id,
    publicId: record.publicId,
    parentId: record.parentId,
    studentId: record.studentId,
    tutorId: record.tutorId,
    subjectId: record.subjectId,
    tutorSubjectId: record.tutorSubjectId,
    availabilitySlotId: record.availabilitySlotId,
    classType: record.classType,
    serviceMode: record.serviceMode,
    status: record.status,
    startAt: record.startAt.toISOString(),
    endAt: record.endAt.toISOString(),
    timezone: record.timezone,
    durationMinutes: record.durationMinutes,
    city: record.city,
    address: record.address,
    priceAmount: record.priceAmount,
    platformFeeAmount: record.platformFeeAmount,
    tutorEarningsAmount: record.tutorEarningsAmount,
    currency: record.currency,
    cancellationReason: record.cancellationReason,
    rescheduledFromBookingId: record.rescheduledFromBookingId,
    acceptedAt: record.acceptedAt?.toISOString() ?? null,
    rejectedAt: record.rejectedAt?.toISOString() ?? null,
    cancelledAt: record.cancelledAt?.toISOString() ?? null,
    completedAt: record.completedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    statusHistory: history?.map(toStatusHistoryEntryDto),
  };
}

export function toStatusHistoryEntryDto(
  record: StatusHistoryRecord,
): StatusHistoryEntryDto {
  return {
    id: record.id,
    fromStatus: record.fromStatus,
    toStatus: record.toStatus,
    changedByUserId: record.changedByUserId,
    reason: record.reason,
    createdAt: record.createdAt.toISOString(),
  };
}