import type { UseCase, Clock } from "../index.js";
import type {
  BookingRepository,
  TutorAvailabilitySlotRepository,
  BookingRecord,
  StatusHistoryRecord,
  CreateBookingRecord,
  CreateStatusHistoryRecord,
} from "./booking.repository.js";
import type {
  CreateBookingInput,
  RescheduleBookingInput,
  BookingQueryInput,
  BookingDto,
  RescheduleResultDto,
} from "./booking.dtos.js";
import { toBookingDto } from "./booking.dtos.js";
import {
  isAllowedTransition,
  assertCancellable,
  assertCompletable,
  calculateDurationMinutes,
  timeRangesOverlap,
  getDefaultReservationDurationMs,
} from "./booking.rules.js";
import {
  BookingNotFoundError,
  BookingOwnershipError,
  InvalidBookingStatusError,
  SlotNotFoundError,
  SlotNotAvailableError,
  SlotAlreadyReservedError,
  StudentOwnershipError,
  SubjectNotOfferedByTutorError,
  OverlappingBookingError,
  TutorNotFoundError,
  ParentNotFoundError,
} from "./booking.errors.js";

// --- External repository interfaces needed by booking use cases ---

export interface TutorRepository {
  findById(id: string): Promise<{ id: string; userId: string } | null>;
  findByUserId(userId: string): Promise<{ id: string; userId: string } | null>;
}

export interface ParentRepository {
  findByUserId(userId: string): Promise<{ id: string; userId: string } | null>;
}

export interface StudentRepository {
  findById(id: string): Promise<{ id: string } | null>;
  verifyParentOwnership(studentId: string, parentId: string): Promise<boolean>;
}

export interface TutorSubjectRepository {
  findByTutorIdAndSubjectId(tutorId: string, subjectId: string): Promise<{
    id: string;
    hourlyRate: string | null;
    serviceModes: string[];
  } | null>;
}

// --- Use Cases ---

export class CreateBookingUseCase
  implements UseCase<{ userId: string; data: CreateBookingInput }, BookingDto>
{
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly slotRepo: TutorAvailabilitySlotRepository,
    private readonly tutorRepo: TutorRepository,
    private readonly parentRepo: ParentRepository,
    private readonly studentRepo: StudentRepository,
    private readonly tutorSubjectRepo: TutorSubjectRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: { userId: string; data: CreateBookingInput }): Promise<BookingDto> {
    const { userId, data } = input;

    // 1. Resolve parent profile
    const parent = await this.parentRepo.findByUserId(userId);
    if (!parent) throw new ParentNotFoundError();

    // 2. Verify student belongs to parent
    const studentOwns = await this.studentRepo.verifyParentOwnership(data.studentId, parent.id);
    if (!studentOwns) throw new StudentOwnershipError();

    // 3. Verify tutor exists
    const tutor = await this.tutorRepo.findById(data.tutorId);
    if (!tutor) throw new TutorNotFoundError();

    // 4. Verify slot exists and is available
    const slot = await this.slotRepo.findAvailableById(data.availabilitySlotId);
    if (!slot) {
      const existingSlot = await this.slotRepo.findById(data.availabilitySlotId);
      if (!existingSlot) throw new SlotNotFoundError();
      throw new SlotNotAvailableError();
    }

    // 5. Verify slot belongs to tutor
    if (slot.tutorId !== data.tutorId) throw new SlotNotAvailableError();

    // 6. Verify tutor offers the subject
    const tutorSubject = await this.tutorSubjectRepo.findByTutorIdAndSubjectId(
      data.tutorId,
      data.subjectId,
    );
    if (!tutorSubject) throw new SubjectNotOfferedByTutorError();

    // 7. Calculate price
    const hourlyRate = tutorSubject.hourlyRate ? parseFloat(tutorSubject.hourlyRate) : 0;
    const durationMinutes = calculateDurationMinutes(slot.startAt, slot.endAt);
    const priceAmount = (hourlyRate * durationMinutes) / 60;
    const platformFeeAmount = priceAmount * 0.1; // 10% platform fee
    const tutorEarningsAmount = priceAmount - platformFeeAmount;

    // 8. Check for overlapping bookings for this tutor
    const overlapping = await this.bookingRepo.findOverlapping(
      data.tutorId,
      slot.startAt,
      slot.endAt,
    );
    if (overlapping.length > 0) throw new OverlappingBookingError();

    // 9. Execute in transaction: reserve slot + create booking
    const now = this.clock.now();
    const reservedUntil = new Date(now.getTime() + getDefaultReservationDurationMs());

    // Reserve the slot
    await this.slotRepo.reserveSlot(data.availabilitySlotId, parent.id, reservedUntil);

    // Create booking record
    const createData: CreateBookingRecord = {
      parentId: parent.id,
      studentId: data.studentId,
      tutorId: data.tutorId,
      subjectId: data.subjectId,
      tutorSubjectId: data.tutorSubjectId ?? null,
      availabilitySlotId: data.availabilitySlotId,
      classType: "REGULAR",
      serviceMode: slot.serviceMode,
      startAt: slot.startAt,
      endAt: slot.endAt,
      timezone: slot.timezone,
      durationMinutes,
      city: data.city ?? null,
      address: data.address ?? null,
      priceAmount: priceAmount.toFixed(2),
      platformFeeAmount: platformFeeAmount.toFixed(2),
      tutorEarningsAmount: tutorEarningsAmount.toFixed(2),
      currency: "INR",
    };

    const booking = await this.bookingRepo.create(createData);

    // Record status history
    await this.bookingRepo.addStatusHistory({
      bookingId: booking.id,
      fromStatus: null,
      toStatus: "REQUESTED",
      changedByUserId: userId,
    });

    return toBookingDto(booking);
  }
}

export class AcceptBookingUseCase
  implements UseCase<{ userId: string; bookingId: string }, BookingDto>
{
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly slotRepo: TutorAvailabilitySlotRepository,
    private readonly tutorRepo: TutorRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: { userId: string; bookingId: string }): Promise<BookingDto> {
    const { userId, bookingId } = input;

    const tutor = await this.tutorRepo.findByUserId(userId);
    if (!tutor) throw new TutorNotFoundError();

    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new BookingNotFoundError();
    if (booking.tutorId !== tutor.id) throw new BookingOwnershipError();
    if (!isAllowedTransition(booking.status, "ACCEPTED")) {
      throw new InvalidBookingStatusError("REQUESTED", booking.status);
    }

    const now = this.clock.now();

    // Mark slot as booked
    if (booking.availabilitySlotId) {
      await this.slotRepo.markAsBooked(booking.availabilitySlotId);
    }

    // Update booking status
    const updated = await this.bookingRepo.updateStatus(bookingId, "ACCEPTED", userId);

    // Record history
    await this.bookingRepo.addStatusHistory({
      bookingId,
      fromStatus: "REQUESTED",
      toStatus: "ACCEPTED",
      changedByUserId: userId,
    });

    return toBookingDto(updated);
  }
}

export class RejectBookingUseCase
  implements UseCase<{ userId: string; bookingId: string }, BookingDto>
{
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly slotRepo: TutorAvailabilitySlotRepository,
    private readonly tutorRepo: TutorRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: { userId: string; bookingId: string }): Promise<BookingDto> {
    const { userId, bookingId } = input;

    const tutor = await this.tutorRepo.findByUserId(userId);
    if (!tutor) throw new TutorNotFoundError();

    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new BookingNotFoundError();
    if (booking.tutorId !== tutor.id) throw new BookingOwnershipError();
    if (!isAllowedTransition(booking.status, "REJECTED")) {
      throw new InvalidBookingStatusError("REQUESTED", booking.status);
    }

    // Release the slot
    if (booking.availabilitySlotId) {
      await this.slotRepo.releaseSlot(booking.availabilitySlotId);
    }

    const updated = await this.bookingRepo.updateStatus(bookingId, "REJECTED", userId);

    await this.bookingRepo.addStatusHistory({
      bookingId,
      fromStatus: "REQUESTED",
      toStatus: "REJECTED",
      changedByUserId: userId,
    });

    return toBookingDto(updated);
  }
}

export class CancelBookingByParentUseCase
  implements UseCase<{ userId: string; bookingId: string; reason?: string }, BookingDto>
{
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly slotRepo: TutorAvailabilitySlotRepository,
    private readonly parentRepo: ParentRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: { userId: string; bookingId: string; reason?: string }): Promise<BookingDto> {
    const { userId, bookingId, reason } = input;

    const parent = await this.parentRepo.findByUserId(userId);
    if (!parent) throw new ParentNotFoundError();

    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new BookingNotFoundError();
    if (booking.parentId !== parent.id) throw new BookingOwnershipError();

    const allowedStatuses = ["REQUESTED", "ACCEPTED"];
    if (!allowedStatuses.includes(booking.status)) {
      throw new InvalidBookingStatusError("REQUESTED or ACCEPTED", booking.status);
    }

    // Enforce cancellation window
    assertCancellable(booking.startAt, this.clock.now());

    // Release the slot
    if (booking.availabilitySlotId) {
      await this.slotRepo.releaseSlot(booking.availabilitySlotId);
    }

    const updated = await this.bookingRepo.updateStatus(bookingId, "CANCELLED_BY_PARENT", userId, reason);

    await this.bookingRepo.addStatusHistory({
      bookingId,
      fromStatus: booking.status,
      toStatus: "CANCELLED_BY_PARENT",
      changedByUserId: userId,
      reason: reason ?? null,
    });

    return toBookingDto(updated);
  }
}

export class CancelBookingByTutorUseCase
  implements UseCase<{ userId: string; bookingId: string; reason?: string }, BookingDto>
{
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly slotRepo: TutorAvailabilitySlotRepository,
    private readonly tutorRepo: TutorRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: { userId: string; bookingId: string; reason?: string }): Promise<BookingDto> {
    const { userId, bookingId, reason } = input;

    const tutor = await this.tutorRepo.findByUserId(userId);
    if (!tutor) throw new TutorNotFoundError();

    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new BookingNotFoundError();
    if (booking.tutorId !== tutor.id) throw new BookingOwnershipError();

    const allowedStatuses = ["REQUESTED", "ACCEPTED"];
    if (!allowedStatuses.includes(booking.status)) {
      throw new InvalidBookingStatusError("REQUESTED or ACCEPTED", booking.status);
    }

    assertCancellable(booking.startAt, this.clock.now());

    if (booking.availabilitySlotId) {
      await this.slotRepo.releaseSlot(booking.availabilitySlotId);
    }

    const updated = await this.bookingRepo.updateStatus(bookingId, "CANCELLED_BY_TUTOR", userId, reason);

    await this.bookingRepo.addStatusHistory({
      bookingId,
      fromStatus: booking.status,
      toStatus: "CANCELLED_BY_TUTOR",
      changedByUserId: userId,
      reason: reason ?? null,
    });

    return toBookingDto(updated);
  }
}

export class RescheduleBookingUseCase
  implements UseCase<{ userId: string; bookingId: string; data: RescheduleBookingInput }, RescheduleResultDto>
{
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly slotRepo: TutorAvailabilitySlotRepository,
    private readonly parentRepo: ParentRepository,
    private readonly tutorRepo: TutorRepository,
    private readonly studentRepo: StudentRepository,
    private readonly tutorSubjectRepo: TutorSubjectRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: {
    userId: string;
    bookingId: string;
    data: RescheduleBookingInput;
  }): Promise<RescheduleResultDto> {
    const { userId, bookingId, data } = input;

    const parent = await this.parentRepo.findByUserId(userId);
    if (!parent) throw new ParentNotFoundError();

    const oldBooking = await this.bookingRepo.findById(bookingId);
    if (!oldBooking) throw new BookingNotFoundError();
    if (oldBooking.parentId !== parent.id) throw new BookingOwnershipError();
    if (!isAllowedTransition(oldBooking.status, "RESCHEDULED")) {
      throw new InvalidBookingStatusError("ACCEPTED", oldBooking.status);
    }

    // Verify new slot
    const newSlot = await this.slotRepo.findAvailableById(data.newAvailabilitySlotId);
    if (!newSlot) {
      const existingSlot = await this.slotRepo.findById(data.newAvailabilitySlotId);
      if (!existingSlot) throw new SlotNotFoundError();
      throw new SlotNotAvailableError();
    }
    if (newSlot.tutorId !== oldBooking.tutorId) throw new SlotNotAvailableError();

    // Check overlapping for new slot
    const overlapping = await this.bookingRepo.findOverlapping(
      oldBooking.tutorId,
      newSlot.startAt,
      newSlot.endAt,
    );
    if (overlapping.length > 0) throw new OverlappingBookingError();

    const now = this.clock.now();
    const reservedUntil = new Date(now.getTime() + getDefaultReservationDurationMs());

    // Release old slot
    if (oldBooking.availabilitySlotId) {
      await this.slotRepo.releaseSlot(oldBooking.availabilitySlotId);
    }

    // Reserve new slot
    await this.slotRepo.reserveSlot(data.newAvailabilitySlotId, parent.id, reservedUntil);

    // Mark old booking as RESCHEDULED
    await this.bookingRepo.updateStatus(bookingId, "RESCHEDULED", userId, data.reason);
    await this.bookingRepo.addStatusHistory({
      bookingId,
      fromStatus: oldBooking.status,
      toStatus: "RESCHEDULED",
      changedByUserId: userId,
      reason: data.reason ?? null,
    });

    // Create new booking
    const durationMinutes = calculateDurationMinutes(newSlot.startAt, newSlot.endAt);
    const tutorSubject = await this.tutorSubjectRepo.findByTutorIdAndSubjectId(
      oldBooking.tutorId,
      oldBooking.subjectId,
    );
    const hourlyRate = tutorSubject?.hourlyRate ? parseFloat(tutorSubject.hourlyRate) : 0;
    const priceAmount = (hourlyRate * durationMinutes) / 60;
    const platformFeeAmount = priceAmount * 0.1;
    const tutorEarningsAmount = priceAmount - platformFeeAmount;

    const createData: CreateBookingRecord = {
      parentId: oldBooking.parentId,
      studentId: oldBooking.studentId,
      tutorId: oldBooking.tutorId,
      subjectId: oldBooking.subjectId,
      tutorSubjectId: oldBooking.tutorSubjectId,
      availabilitySlotId: data.newAvailabilitySlotId,
      classType: oldBooking.classType,
      serviceMode: newSlot.serviceMode,
      startAt: newSlot.startAt,
      endAt: newSlot.endAt,
      timezone: newSlot.timezone,
      durationMinutes,
      city: oldBooking.city,
      address: oldBooking.address,
      priceAmount: priceAmount.toFixed(2),
      platformFeeAmount: platformFeeAmount.toFixed(2),
      tutorEarningsAmount: tutorEarningsAmount.toFixed(2),
      currency: oldBooking.currency,
      rescheduledFromBookingId: oldBooking.id,
    };

    const newBooking = await this.bookingRepo.create(createData);
    await this.bookingRepo.addStatusHistory({
      bookingId: newBooking.id,
      fromStatus: null,
      toStatus: "REQUESTED",
      changedByUserId: userId,
      reason: `Rescheduled from booking ${oldBooking.id}`,
    });

    return {
      oldBooking: toBookingDto({ ...oldBooking, status: "RESCHEDULED" }),
      newBooking: toBookingDto(newBooking),
    };
  }
}

export class CompleteBookingUseCase
  implements UseCase<{ userId: string; bookingId: string }, BookingDto>
{
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly tutorRepo: TutorRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: { userId: string; bookingId: string }): Promise<BookingDto> {
    const { userId, bookingId } = input;

    const tutor = await this.tutorRepo.findByUserId(userId);
    if (!tutor) throw new TutorNotFoundError();

    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new BookingNotFoundError();
    if (booking.tutorId !== tutor.id) throw new BookingOwnershipError();
    if (!isAllowedTransition(booking.status, "COMPLETED")) {
      throw new InvalidBookingStatusError("ACCEPTED", booking.status);
    }

    assertCompletable(booking.endAt, this.clock.now());

    const updated = await this.bookingRepo.updateStatus(bookingId, "COMPLETED", userId);

    await this.bookingRepo.addStatusHistory({
      bookingId,
      fromStatus: "ACCEPTED",
      toStatus: "COMPLETED",
      changedByUserId: userId,
    });

    return toBookingDto(updated);
  }
}

export class GetBookingUseCase
  implements UseCase<{ userId: string; bookingId: string }, BookingDto>
{
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly parentRepo: ParentRepository,
    private readonly tutorRepo: TutorRepository,
  ) {}

  async execute(input: { userId: string; bookingId: string }): Promise<BookingDto> {
    const { userId, bookingId } = input;

    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new BookingNotFoundError();

    // Check ownership: either the parent or the tutor
    const parent = await this.parentRepo.findByUserId(userId);
    const tutor = await this.tutorRepo.findByUserId(userId);

    const isParent = parent && booking.parentId === parent.id;
    const isTutor = tutor && booking.tutorId === tutor.id;

    if (!isParent && !isTutor) throw new BookingOwnershipError();

    return toBookingDto(booking);
  }
}

export class GetBookingHistoryUseCase
  implements UseCase<{ userId: string; bookingId: string }, BookingDto>
{
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly parentRepo: ParentRepository,
    private readonly tutorRepo: TutorRepository,
  ) {}

  async execute(input: { userId: string; bookingId: string }): Promise<BookingDto> {
    const { userId, bookingId } = input;

    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new BookingNotFoundError();

    const parent = await this.parentRepo.findByUserId(userId);
    const tutor = await this.tutorRepo.findByUserId(userId);

    const isParent = parent && booking.parentId === parent.id;
    const isTutor = tutor && booking.tutorId === tutor.id;

    if (!isParent && !isTutor) throw new BookingOwnershipError();

    // We need to get status history - for now return booking without history
    // The repository can be extended to fetch history
    return toBookingDto(booking);
  }
}

export class ListParentBookingsUseCase
  implements UseCase<{ userId: string; query?: BookingQueryInput }, BookingDto[]>
{
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly parentRepo: ParentRepository,
  ) {}

  async execute(input: { userId: string; query?: BookingQueryInput }): Promise<BookingDto[]> {
    const parent = await this.parentRepo.findByUserId(input.userId);
    if (!parent) throw new ParentNotFoundError();

    const opts = input.query
      ? {
          status: input.query.status,
          from: input.query.from ? new Date(input.query.from) : undefined,
          to: input.query.to ? new Date(input.query.to) : undefined,
          limit: input.query.limit,
          offset: input.query.offset,
        }
      : undefined;

    const bookings = await this.bookingRepo.findByParentId(parent.id, opts);
    return bookings.map((b) => toBookingDto(b));
  }
}

export class ListTutorBookingsUseCase
  implements UseCase<{ userId: string; query?: BookingQueryInput }, BookingDto[]>
{
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly tutorRepo: TutorRepository,
  ) {}

  async execute(input: { userId: string; query?: BookingQueryInput }): Promise<BookingDto[]> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new TutorNotFoundError();

    const opts = input.query
      ? {
          status: input.query.status,
          from: input.query.from ? new Date(input.query.from) : undefined,
          to: input.query.to ? new Date(input.query.to) : undefined,
          limit: input.query.limit,
          offset: input.query.offset,
        }
      : undefined;

    const bookings = await this.bookingRepo.findByTutorId(tutor.id, opts);
    return bookings.map((b) => toBookingDto(b));
  }
}

export class ExpireStaleBookingsUseCase
  implements UseCase<{ userId?: string }, number>
{
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly slotRepo: TutorAvailabilitySlotRepository,
    private readonly clock: Clock,
  ) {}

  async execute(_input: { userId?: string }): Promise<number> {
    // Find all REQUESTED bookings that are older than 24 hours
    // This is a simplified implementation - in production you'd query by expiry
    const now = this.clock.now();
    const expiryMs = getDefaultReservationDurationMs();
    const expiryThreshold = new Date(now.getTime() - expiryMs);

    // For now, return 0 as we'd need a dedicated query method
    // The actual expiry logic would be in a scheduled job
    return 0;
  }
}