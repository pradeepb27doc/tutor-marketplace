// Backend API response types for booking endpoints

export interface AvailabilitySlot {
  id: string;
  tutorId: string;
  startAt: string;
  endAt: string;
  timezone: string;
  serviceMode: string;
  isBooked: boolean;
  isReserved: boolean;
}

export interface PublicAvailabilityResponse {
  slots: AvailabilitySlot[];
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
}

export interface CreateBookingRequest {
  studentId: string;
  tutorId: string;
  subjectId: string;
  tutorSubjectId?: string;
  availabilitySlotId: string;
  city?: string;
  address?: Record<string, unknown>;
}

export interface BookingApiResponse {
  data: BookingDto;
}

export interface AvailabilityApiResponse {
  slots: AvailabilitySlot[];
}

export interface BookingFormData {
  tutorId: string;
  subjectId: string;
  subjectName: string;
  tutorSubjectId?: string;
  availabilitySlotId: string;
  startAt: string;
  endAt: string;
  timezone: string;
  serviceMode: string;
  hourlyRate: string | null;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
}