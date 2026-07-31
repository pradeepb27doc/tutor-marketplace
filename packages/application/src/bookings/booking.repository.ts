export interface BookingRecord {
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
  startAt: Date;
  endAt: Date;
  timezone: string;
  durationMinutes: number;
  city: string | null;
  address: Record<string, any> | null;
  meetingUrl: string | null;
  priceAmount: string;
  platformFeeAmount: string;
  tutorEarningsAmount: string;
  currency: string;
  cancellationReason: string | null;
  rescheduledFromBookingId: string | null;
  acceptedAt: Date | null;
  rejectedAt: Date | null;
  cancelledAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingRecord {
  parentId: string;
  studentId: string;
  tutorId: string;
  subjectId: string;
  tutorSubjectId?: string | null;
  availabilitySlotId?: string | null;
  classType?: string;
  serviceMode: string;
  startAt: Date;
  endAt: Date;
  timezone?: string;
  durationMinutes: number;
  city?: string | null;
  address?: Record<string, any> | null;
  priceAmount: string;
  platformFeeAmount?: string;
  tutorEarningsAmount?: string;
  currency?: string;
  rescheduledFromBookingId?: string | null;
}

export interface StatusHistoryRecord {
  id: string;
  bookingId: string;
  fromStatus: string | null;
  toStatus: string;
  changedByUserId: string | null;
  reason: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

export interface CreateStatusHistoryRecord {
  bookingId: string;
  fromStatus: string | null;
  toStatus: string;
  changedByUserId?: string | null;
  reason?: string | null;
  metadata?: Record<string, any> | null;
}

export interface BookingQueryOptions {
  status?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export interface BookingRepository {
  findById(id: string): Promise<BookingRecord | null>;
  findByPublicId(publicId: string): Promise<BookingRecord | null>;
  findByParentId(parentId: string, opts?: BookingQueryOptions): Promise<BookingRecord[]>;
  findByTutorId(tutorId: string, opts?: BookingQueryOptions): Promise<BookingRecord[]>;
  findByTutorIdAndTimeRange(tutorId: string, startAt: Date, endAt: Date): Promise<BookingRecord[]>;
  findBySlotId(slotId: string): Promise<BookingRecord | null>;
  findOverlapping(tutorId: string, startAt: Date, endAt: Date, excludeBookingId?: string): Promise<BookingRecord[]>;
  create(data: CreateBookingRecord): Promise<BookingRecord>;
  updateStatus(id: string, status: string, changedByUserId?: string | null, reason?: string | null): Promise<BookingRecord>;
  addStatusHistory(entry: CreateStatusHistoryRecord): Promise<void>;
  countByTutorIdAndStatus(tutorId: string, status: string): Promise<number>;
}

// --- TutorAvailabilitySlot repository for booking workflow ---

export interface TutorAvailabilitySlotRecord {
  id: string;
  tutorId: string;
  startAt: Date;
  endAt: Date;
  timezone: string;
  status: string;
  serviceMode: string;
  capacity: number;
  reservedUntil: Date | null;
  reservedByParentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConcreteSlotRecord {
  tutorId: string;
  startAt: Date;
  endAt: Date;
  timezone?: string;
  serviceMode: string;
  capacity?: number;
}

export interface TutorAvailabilitySlotRepository {
  findById(id: string): Promise<TutorAvailabilitySlotRecord | null>;
  findAvailableById(id: string): Promise<TutorAvailabilitySlotRecord | null>;
  reserveSlot(id: string, reservedByParentId: string, reservedUntil: Date): Promise<void>;
  markAsBooked(id: string): Promise<void>;
  releaseSlot(id: string): Promise<void>;
  markAsExpired(id: string): Promise<void>;
  createConcreteSlot(data: CreateConcreteSlotRecord): Promise<TutorAvailabilitySlotRecord>;
}