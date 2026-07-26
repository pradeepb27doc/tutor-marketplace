import { describe, expect, it } from "vitest";
import {
  AcceptBookingUseCase,
  assertCancellable,
  assertCompletable,
  BookingCannotBeCompletedError,
  BookingNotFoundError,
  BookingOwnershipError,
  calculateDurationMinutes,
  CancelBookingByParentUseCase,
  CancelBookingByTutorUseCase,
  CancellationWindowExceededError,
  CompleteBookingUseCase,
  CreateBookingUseCase,
  GetBookingUseCase,
  GetBookingHistoryUseCase,
  ExpireStaleBookingsUseCase,
  InvalidBookingStatusError,
  isAllowedTransition,
  ListParentBookingsUseCase,
  ListTutorBookingsUseCase,
  OverlappingBookingError,
  ParentNotFoundError,
  RejectBookingUseCase,
  RescheduleBookingUseCase,
  SlotNotAvailableError,
  SlotNotFoundError,
  StudentOwnershipError,
  SubjectNotOfferedByTutorError,
  timeRangesOverlap,
  TutorNotFoundError,
} from "./index.js";
import {
  FakeBookingRepository,
  FakeClock,
  FakeParentProfileRepository,
  FakeStudentOwnershipRepository,
  FakeSubjectRepository,
  FakeTutorAvailabilitySlotRepository,
  FakeTutorRepository,
  FakeTutorSubjectRepository,
  buildBookingRecord,
  buildParentRecord,
  buildSubjectRecord,
  buildTutorRecord,
} from "@tutor-marketplace/testing";

function setup() {
  const clock = new FakeClock(new Date("2026-07-14T00:00:00.000Z"));
  const bookingRepo = new FakeBookingRepository();
  const slotRepo = new FakeTutorAvailabilitySlotRepository();
  const tutorRepo = new FakeTutorRepository();
  const parentRepo = new FakeParentProfileRepository();
  const studentRepo = new FakeStudentOwnershipRepository();
  const subjectRepo = new FakeSubjectRepository();
  const tutorSubjectRepo = new FakeTutorSubjectRepository(subjectRepo);

  const parent = buildParentRecord({ id: "parent-1", userId: "parent-user-1" });
  const tutor = buildTutorRecord({ id: "tutor-1", userId: "tutor-user-1" });
  const subject = buildSubjectRecord({ name: "Mathematics" });
  parentRepo.parents.push(parent);
  tutorRepo.tutors.push(tutor);
  subjectRepo.subjects.push(subject);
  studentRepo.students.push({ id: "student-1", parentId: parent.id });

  return { clock, bookingRepo, slotRepo, tutorRepo, parentRepo, studentRepo, subjectRepo, tutorSubjectRepo, parent, tutor, subject };
}

describe("booking business rules", () => {
  it("allows only valid lifecycle transitions", () => {
    expect(isAllowedTransition("REQUESTED", "ACCEPTED")).toBe(true);
    expect(isAllowedTransition("ACCEPTED", "COMPLETED")).toBe(true);
    expect(isAllowedTransition("COMPLETED", "CANCELLED_BY_PARENT")).toBe(false);
  });

  it("validates cancellation and completion windows", () => {
    expect(() => assertCancellable(new Date("2026-07-20T10:00:00Z"), new Date("2026-07-20T09:59:00Z"))).not.toThrow();
    expect(() => assertCancellable(new Date("2026-07-20T10:00:00Z"), new Date("2026-07-20T10:00:00Z"))).toThrow(CancellationWindowExceededError);
    expect(() => assertCompletable(new Date("2026-07-20T11:00:00Z"), new Date("2026-07-20T10:59:00Z"))).toThrow(BookingCannotBeCompletedError);
    expect(() => assertCompletable(new Date("2026-07-20T11:00:00Z"), new Date("2026-07-20T11:00:00Z"))).not.toThrow();
  });

  it("calculates duration and detects overlaps", () => {
    expect(calculateDurationMinutes(new Date("2026-07-20T10:00:00Z"), new Date("2026-07-20T11:30:00Z"))).toBe(90);
    expect(timeRangesOverlap(new Date("2026-07-20T10:00:00Z"), new Date("2026-07-20T11:00:00Z"), new Date("2026-07-20T10:30:00Z"), new Date("2026-07-20T11:30:00Z"))).toBe(true);
    expect(timeRangesOverlap(new Date("2026-07-20T10:00:00Z"), new Date("2026-07-20T11:00:00Z"), new Date("2026-07-20T11:00:00Z"), new Date("2026-07-20T12:00:00Z"))).toBe(false);
  });
});

describe("CreateBookingUseCase", () => {
  it("creates a requested booking, reserves availability, prices it, and records history", async () => {
    const s = setup();
    const slot = await s.slotRepo.createConcreteSlot({ tutorId: s.tutor.id, startAt: new Date("2026-07-20T10:00:00Z"), endAt: new Date("2026-07-20T11:30:00Z"), serviceMode: "ONLINE" });
    await s.tutorSubjectRepo.create({ tutorId: s.tutor.id, subjectId: s.subject.id, hourlyRate: "600.00" });

    const useCase = new CreateBookingUseCase(s.bookingRepo, s.slotRepo, s.tutorRepo, s.parentRepo, s.studentRepo, s.tutorSubjectRepo, s.clock);
    const result = await useCase.execute({ userId: s.parent.userId, data: { studentId: "student-1", tutorId: s.tutor.id, subjectId: s.subject.id, availabilitySlotId: slot.id, city: "Mumbai" } });

    expect(result.status).toBe("REQUESTED");
    expect(result.durationMinutes).toBe(90);
    expect(result.priceAmount).toBe("900.00");
    expect(result.platformFeeAmount).toBe("90.00");
    expect(s.slotRepo.slots[0]).toMatchObject({ status: "RESERVED", reservedByParentId: s.parent.id });
    expect(s.bookingRepo.history.at(-1)).toMatchObject({ toStatus: "REQUESTED", changedByUserId: s.parent.userId });
  });

  it("rejects missing parent, unowned student, missing tutor, missing/unavailable slot, unsupported subject, and conflicts", async () => {
    const s = setup();
    const slot = await s.slotRepo.createConcreteSlot({ tutorId: s.tutor.id, startAt: new Date("2026-07-20T10:00:00Z"), endAt: new Date("2026-07-20T11:00:00Z"), serviceMode: "ONLINE" });
    const base = { studentId: "student-1", tutorId: s.tutor.id, subjectId: s.subject.id, availabilitySlotId: slot.id };
    const useCase = new CreateBookingUseCase(s.bookingRepo, s.slotRepo, s.tutorRepo, s.parentRepo, s.studentRepo, s.tutorSubjectRepo, s.clock);

    await expect(useCase.execute({ userId: "missing-parent", data: base })).rejects.toThrow(ParentNotFoundError);
    await expect(useCase.execute({ userId: s.parent.userId, data: { ...base, studentId: "other-student" } })).rejects.toThrow(StudentOwnershipError);
    await expect(useCase.execute({ userId: s.parent.userId, data: { ...base, tutorId: "missing-tutor" } })).rejects.toThrow(TutorNotFoundError);
    await expect(useCase.execute({ userId: s.parent.userId, data: { ...base, availabilitySlotId: "missing-slot" } })).rejects.toThrow(SlotNotFoundError);
    slot.status = "BOOKED";
    await expect(useCase.execute({ userId: s.parent.userId, data: base })).rejects.toThrow(SlotNotAvailableError);
    slot.status = "AVAILABLE";
    await expect(useCase.execute({ userId: s.parent.userId, data: base })).rejects.toThrow(SubjectNotOfferedByTutorError);

    await s.tutorSubjectRepo.create({ tutorId: s.tutor.id, subjectId: s.subject.id, hourlyRate: "500.00" });
    s.bookingRepo.bookings.push(buildBookingRecord({ id: "existing-booking", tutorId: s.tutor.id, parentId: s.parent.id, studentId: "student-1", subjectId: s.subject.id, availabilitySlotId: "other-slot" } as any));
    await expect(useCase.execute({ userId: s.parent.userId, data: base })).rejects.toThrow(OverlappingBookingError);
  });
});

describe("booking status use cases", () => {
  it("accepts a requested booking and marks the slot booked", async () => {
    const s = setup();
    const slot = await s.slotRepo.createConcreteSlot({ tutorId: s.tutor.id, startAt: new Date("2026-07-20T10:00:00Z"), endAt: new Date("2026-07-20T11:00:00Z"), serviceMode: "ONLINE" });
    const reqBooking = buildBookingRecord({ id: "req-1", tutorId: s.tutor.id, parentId: s.parent.id, availabilitySlotId: slot.id } as any);
    reqBooking.availabilitySlotId = slot.id;
    reqBooking.status = "REQUESTED";
    s.bookingRepo.bookings.push(reqBooking);
    const result = await new AcceptBookingUseCase(s.bookingRepo, s.slotRepo, s.tutorRepo, s.clock).execute({ userId: s.tutor.userId, bookingId: "req-1" });
    expect(result.status).toBe("ACCEPTED");
    expect(s.slotRepo.slots[0].status).toBe("BOOKED");
  });

  it("rejects a requested booking and releases the slot", async () => {
    const s = setup();
    const slot = await s.slotRepo.createConcreteSlot({ tutorId: s.tutor.id, startAt: new Date("2026-07-20T10:00:00Z"), endAt: new Date("2026-07-20T11:00:00Z"), serviceMode: "ONLINE" });
    slot.status = "RESERVED";
    const reqBooking = buildBookingRecord({ id: "req-2", tutorId: s.tutor.id, parentId: s.parent.id, availabilitySlotId: slot.id } as any);
    reqBooking.availabilitySlotId = slot.id;
    reqBooking.status = "REQUESTED";
    s.bookingRepo.bookings.push(reqBooking);
    const result = await new RejectBookingUseCase(s.bookingRepo, s.slotRepo, s.tutorRepo, s.clock).execute({ userId: s.tutor.userId, bookingId: "req-2" });
    expect(result.status).toBe("REJECTED");
    expect(s.slotRepo.slots[0].status).toBe("AVAILABLE");
  });

  it("cancels by parent and tutor before start and rejects late/invalid cancellation", async () => {
    const s = setup();
    const parentCancel = buildBookingRecord({ id: "parent-cancel", tutorId: s.tutor.id, parentId: s.parent.id, startAt: new Date("2026-07-20T10:00:00Z") } as any);
    parentCancel.status = "ACCEPTED";
    s.bookingRepo.bookings.push(parentCancel);
    const parentResult = await new CancelBookingByParentUseCase(s.bookingRepo, s.slotRepo, s.parentRepo, s.clock).execute({ userId: s.parent.userId, bookingId: "parent-cancel", reason: "plans changed" });
    expect(parentResult.status).toBe("CANCELLED_BY_PARENT");
    expect(parentResult.cancellationReason).toBe("plans changed");

    const tutorCancel = buildBookingRecord({ id: "tutor-cancel", tutorId: s.tutor.id, parentId: s.parent.id, startAt: new Date("2026-07-20T10:00:00Z") } as any);
    tutorCancel.status = "REQUESTED";
    s.bookingRepo.bookings.push(tutorCancel);
    const tutorResult = await new CancelBookingByTutorUseCase(s.bookingRepo, s.slotRepo, s.tutorRepo, s.clock).execute({ userId: s.tutor.userId, bookingId: "tutor-cancel", reason: "ill" });
    expect(tutorResult.status).toBe("CANCELLED_BY_TUTOR");

    s.clock.set(new Date("2026-07-20T10:00:00Z"));
    const lateCancel = buildBookingRecord({ id: "late-cancel", tutorId: s.tutor.id, parentId: s.parent.id, startAt: new Date("2026-07-20T10:00:00Z") } as any);
    lateCancel.status = "ACCEPTED";
    s.bookingRepo.bookings.push(lateCancel);
    await expect(new CancelBookingByParentUseCase(s.bookingRepo, s.slotRepo, s.parentRepo, s.clock).execute({ userId: s.parent.userId, bookingId: "late-cancel" })).rejects.toThrow(CancellationWindowExceededError);
    await expect(new CancelBookingByParentUseCase(s.bookingRepo, s.slotRepo, s.parentRepo, s.clock).execute({ userId: s.parent.userId, bookingId: "parent-cancel" })).rejects.toThrow(InvalidBookingStatusError);
  });

  it("reschedules accepted bookings to a new requested booking", async () => {
    const s = setup();
    await s.tutorSubjectRepo.create({ tutorId: s.tutor.id, subjectId: s.subject.id, hourlyRate: "600.00" });
    const oldSlot = await s.slotRepo.createConcreteSlot({ tutorId: s.tutor.id, startAt: new Date("2026-07-20T10:00:00Z"), endAt: new Date("2026-07-20T11:00:00Z"), serviceMode: "ONLINE" });
    const newSlot = await s.slotRepo.createConcreteSlot({ tutorId: s.tutor.id, startAt: new Date("2026-07-21T10:00:00Z"), endAt: new Date("2026-07-21T11:00:00Z"), serviceMode: "ONLINE" });
    const acceptedBooking = buildBookingRecord({ id: "resched-1", tutorId: s.tutor.id, parentId: s.parent.id, studentId: "student-1", subjectId: s.subject.id, availabilitySlotId: oldSlot.id } as any);
    acceptedBooking.status = "ACCEPTED";
    s.bookingRepo.bookings.push(acceptedBooking);
    const result = await new RescheduleBookingUseCase(s.bookingRepo, s.slotRepo, s.parentRepo, s.tutorRepo, s.studentRepo, s.tutorSubjectRepo, s.clock).execute({ userId: s.parent.userId, bookingId: "resched-1", data: { newAvailabilitySlotId: newSlot.id, reason: "new time" } });
    expect(result.oldBooking.status).toBe("RESCHEDULED");
    expect(result.newBooking.status).toBe("REQUESTED");
    expect(result.newBooking.rescheduledFromBookingId).toBe("resched-1");
    expect(s.slotRepo.slots.find((slot) => slot.id === oldSlot.id)?.status).toBe("AVAILABLE");
    expect(s.slotRepo.slots.find((slot) => slot.id === newSlot.id)?.status).toBe("RESERVED");
  });

  it("completes accepted bookings only after end and enforces tutor ownership", async () => {
    const s = setup();
    s.clock.set(new Date("2026-07-20T11:00:00Z"));
    const acceptedBooking = buildBookingRecord({ id: "complete-1", tutorId: s.tutor.id, parentId: s.parent.id, endAt: new Date("2026-07-20T11:00:00Z") } as any);
    acceptedBooking.status = "ACCEPTED";
    s.bookingRepo.bookings.push(acceptedBooking);
    const result = await new CompleteBookingUseCase(s.bookingRepo, s.tutorRepo, s.clock).execute({ userId: s.tutor.userId, bookingId: "complete-1" });
    expect(result.status).toBe("COMPLETED");

    await expect(new CompleteBookingUseCase(s.bookingRepo, s.tutorRepo, s.clock).execute({ userId: "missing-tutor-user", bookingId: "complete-1" })).rejects.toThrow(TutorNotFoundError);
    s.tutorRepo.tutors.push(buildTutorRecord({ id: "other-tutor", userId: "other-tutor-user" }));
    await expect(new CompleteBookingUseCase(s.bookingRepo, s.tutorRepo, s.clock).execute({ userId: "other-tutor-user", bookingId: "complete-1" })).rejects.toThrow(BookingOwnershipError);
  });

  it("gets booking for parent or tutor and errors for others", async () => {
    const s = setup();
    const booking = buildBookingRecord({ id: "get-1", tutorId: s.tutor.id, parentId: s.parent.id, status: "REQUESTED" } as any);
    s.bookingRepo.bookings.push(booking);
    
    const parentResult = await new GetBookingUseCase(s.bookingRepo, s.parentRepo, s.tutorRepo).execute({ userId: s.parent.userId, bookingId: "get-1" });
    expect(parentResult.id).toBe("get-1");

    const tutorResult = await new GetBookingUseCase(s.bookingRepo, s.parentRepo, s.tutorRepo).execute({ userId: s.tutor.userId, bookingId: "get-1" });
    expect(tutorResult.id).toBe("get-1");

    await expect(new GetBookingUseCase(s.bookingRepo, s.parentRepo, s.tutorRepo).execute({ userId: "stranger", bookingId: "get-1" })).rejects.toThrow(BookingOwnershipError);
    await expect(new GetBookingUseCase(s.bookingRepo, s.parentRepo, s.tutorRepo).execute({ userId: s.parent.userId, bookingId: "missing" })).rejects.toThrow(BookingNotFoundError);
  });

  it("lists parent bookings with optional query filters", async () => {
    const s = setup();
    const b1 = buildBookingRecord({ id: "b1", tutorId: s.tutor.id, parentId: s.parent.id, startAt: new Date("2026-07-20T10:00:00Z"), endAt: new Date("2026-07-20T11:00:00Z") } as any);
    b1.startAt = new Date("2026-07-20T10:00:00Z");
    b1.endAt = new Date("2026-07-20T11:00:00Z");
    b1.status = "REQUESTED";
    const b2 = buildBookingRecord({ id: "b2", tutorId: s.tutor.id, parentId: s.parent.id, startAt: new Date("2026-07-21T10:00:00Z"), endAt: new Date("2026-07-21T11:00:00Z") } as any);
    b2.startAt = new Date("2026-07-21T10:00:00Z");
    b2.endAt = new Date("2026-07-21T11:00:00Z");
    b2.status = "ACCEPTED";
    s.bookingRepo.bookings.push(b1, b2);

    const all = await new ListParentBookingsUseCase(s.bookingRepo, s.parentRepo).execute({ userId: s.parent.userId });
    expect(all).toHaveLength(2); // only b1 and b2 (setup booking has different parent)

    const filtered = await new ListParentBookingsUseCase(s.bookingRepo, s.parentRepo).execute({ userId: s.parent.userId, query: { status: "REQUESTED" } });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("b1");

    const dateFiltered = await new ListParentBookingsUseCase(s.bookingRepo, s.parentRepo).execute({ userId: s.parent.userId, query: { from: "2026-07-21T00:00:00.000Z", to: "2026-07-22T00:00:00.000Z" } });
    expect(dateFiltered).toHaveLength(1);
    expect(dateFiltered[0].id).toBe("b2");
  });

  it("lists tutor bookings with optional query filters", async () => {
    const s = setup();
    const b1 = { ...buildBookingRecord({ id: "b1", tutorId: s.tutor.id, parentId: s.parent.id, startAt: new Date("2026-07-20T10:00:00Z"), endAt: new Date("2026-07-20T11:00:00Z") } as any), status: "REQUESTED" };
    const b2 = { ...buildBookingRecord({ id: "b2", tutorId: s.tutor.id, parentId: s.parent.id, startAt: new Date("2026-07-21T10:00:00Z"), endAt: new Date("2026-07-21T11:00:00Z") } as any), status: "ACCEPTED" };
    s.bookingRepo.bookings.push(b1, b2);

    const all = await new ListTutorBookingsUseCase(s.bookingRepo, s.tutorRepo).execute({ userId: s.tutor.userId });
    expect(all).toHaveLength(2); // only b1 and b2

    const filtered = await new ListTutorBookingsUseCase(s.bookingRepo, s.tutorRepo).execute({ userId: s.tutor.userId, query: { status: "ACCEPTED" } });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("b2");
  });

  it("gets booking history for parent or tutor and errors for others", async () => {
    const s = setup();
    const booking = buildBookingRecord({ id: "hist-1", tutorId: s.tutor.id, parentId: s.parent.id, status: "REQUESTED" } as any);
    s.bookingRepo.bookings.push(booking);
    s.bookingRepo.history.push({ bookingId: "hist-1", fromStatus: null, toStatus: "REQUESTED", changedByUserId: s.parent.userId, reason: null });

    const parentResult = await new GetBookingHistoryUseCase(s.bookingRepo, s.parentRepo, s.tutorRepo).execute({ userId: s.parent.userId, bookingId: "hist-1" });
    expect(parentResult.id).toBe("hist-1");

    const tutorResult = await new GetBookingHistoryUseCase(s.bookingRepo, s.parentRepo, s.tutorRepo).execute({ userId: s.tutor.userId, bookingId: "hist-1" });
    expect(tutorResult.id).toBe("hist-1");

    await expect(new GetBookingHistoryUseCase(s.bookingRepo, s.parentRepo, s.tutorRepo).execute({ userId: "stranger", bookingId: "hist-1" })).rejects.toThrow(BookingOwnershipError);
    await expect(new GetBookingHistoryUseCase(s.bookingRepo, s.parentRepo, s.tutorRepo).execute({ userId: s.parent.userId, bookingId: "missing" })).rejects.toThrow(BookingNotFoundError);
  });

  it("expires stale requested bookings and returns the count", async () => {
    const s = setup();
    const expired = new ExpireStaleBookingsUseCase(s.bookingRepo, s.slotRepo, s.clock);
    const count = await expired.execute({});
    expect(count).toBe(0);
  });
});
