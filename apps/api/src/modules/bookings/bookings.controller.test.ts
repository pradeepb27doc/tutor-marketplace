import { describe, it, expect, vi, beforeEach } from "vitest";
import { BookingsController } from "./bookings.controller.js";
import {
  CreateBookingUseCase,
  AcceptBookingUseCase,
  RejectBookingUseCase,
  CancelBookingByParentUseCase,
  CancelBookingByTutorUseCase,
  RescheduleBookingUseCase,
  CompleteBookingUseCase,
  GetBookingUseCase,
  GetBookingHistoryUseCase,
  ListParentBookingsUseCase,
  ListTutorBookingsUseCase,
} from "@tutor-marketplace/application";

describe("BookingsController", () => {
  let controller: BookingsController;
  const mocks = {
    create: { execute: vi.fn() },
    accept: { execute: vi.fn() },
    reject: { execute: vi.fn() },
    cancelByParent: { execute: vi.fn() },
    cancelByTutor: { execute: vi.fn() },
    reschedule: { execute: vi.fn() },
    complete: { execute: vi.fn() },
    get: { execute: vi.fn() },
    getHistory: { execute: vi.fn() },
    listParent: { execute: vi.fn() },
    listTutor: { execute: vi.fn() },
  };

  const validBooking = {
    id: "booking-1",
    publicId: "pub-booking-1",
    parentId: "parent-1",
    tutorId: "tutor-1",
    studentId: "student-1",
    subjectId: "subject-1",
    tutorSubjectId: null,
    availabilitySlotId: null,
    classType: "REGULAR",
    serviceMode: "ONLINE",
    status: "REQUESTED",
    startAt: new Date("2026-07-20T10:00:00.000Z"),
    endAt: new Date("2026-07-20T11:00:00.000Z"),
    timezone: "Asia/Kolkata",
    durationMinutes: 60,
    city: "Mumbai",
    address: null,
    meetingUrl: null,
    priceAmount: "500.00",
    platformFeeAmount: "50.00",
    tutorEarningsAmount: "450.00",
    currency: "INR",
    rescheduledFromBookingId: null,
    cancellationReason: null,
    acceptedAt: null,
    rejectedAt: null,
    cancelledAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new BookingsController(
      mocks.create as unknown as CreateBookingUseCase,
      mocks.accept as unknown as AcceptBookingUseCase,
      mocks.reject as unknown as RejectBookingUseCase,
      mocks.cancelByParent as unknown as CancelBookingByParentUseCase,
      mocks.cancelByTutor as unknown as CancelBookingByTutorUseCase,
      mocks.reschedule as unknown as RescheduleBookingUseCase,
      mocks.complete as unknown as CompleteBookingUseCase,
      mocks.get as unknown as GetBookingUseCase,
      mocks.getHistory as unknown as GetBookingHistoryUseCase,
      mocks.listParent as unknown as ListParentBookingsUseCase,
      mocks.listTutor as unknown as ListTutorBookingsUseCase,
    );
  });

  describe("create", () => {
    it("should create a booking", async () => {
      mocks.create.execute.mockResolvedValue(validBooking);
      const dto = {
        studentId: "student-1",
        tutorId: "tutor-1",
        subjectId: "subject-1",
        availabilitySlotId: "slot-1",
      };
      const req = { user: { id: "parent-1", role: "PARENT" } } as any;
      const result = await controller.create(req, dto as any);
      expect(result).toEqual({ data: validBooking });
      expect(mocks.create.execute).toHaveBeenCalledWith({ userId: "parent-1", data: dto });
    });

    it("should propagate slot unavailability error", async () => {
      mocks.create.execute.mockRejectedValue(new Error("Slot is not available"));
      const req = { user: { id: "parent-1", role: "PARENT" } } as any;
      await expect(controller.create(req, { availabilitySlotId: "bad" } as any)).rejects.toThrow("Slot is not available");
    });

    it("should propagate double booking error", async () => {
      mocks.create.execute.mockRejectedValue(new Error("Tutor is already booked for this time slot"));
      const req = { user: { id: "parent-1", role: "PARENT" } } as any;
      await expect(controller.create(req, {} as any)).rejects.toThrow("Tutor is already booked");
    });
  });

  describe("accept", () => {
    it("should accept a booking", async () => {
      mocks.accept.execute.mockResolvedValue({ ...validBooking, status: "ACCEPTED" });
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      const result = await controller.accept(req, "booking-1");
      expect(mocks.accept.execute).toHaveBeenCalledWith({ userId: "tutor-1", bookingId: "booking-1" });
      expect(result.data.status).toBe("ACCEPTED");
    });

    it("should throw when booking not found", async () => {
      mocks.accept.execute.mockRejectedValue(new Error("Booking not found"));
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      await expect(controller.accept(req, "non-existent")).rejects.toThrow("Booking not found");
    });
  });

  describe("reject", () => {
    it("should reject a booking", async () => {
      mocks.reject.execute.mockResolvedValue({ ...validBooking, status: "REJECTED" });
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      const result = await controller.reject(req, "booking-1");
      expect(mocks.reject.execute).toHaveBeenCalledWith({ userId: "tutor-1", bookingId: "booking-1" });
      expect(result.data.status).toBe("REJECTED");
    });
  });

  describe("cancel", () => {
    it("should cancel as parent", async () => {
      mocks.cancelByParent.execute.mockResolvedValue({ ...validBooking, status: "CANCELLED_BY_PARENT" });
      const req = { user: { id: "parent-1", role: "PARENT" } } as any;
      const result = await controller.cancelByParent(req, "booking-1", { reason: "Changed mind" });
      expect(mocks.cancelByParent.execute).toHaveBeenCalledWith({ userId: "parent-1", bookingId: "booking-1", reason: "Changed mind" });
      expect(result.data.status).toBe("CANCELLED_BY_PARENT");
    });

    it("should cancel as tutor", async () => {
      mocks.cancelByTutor.execute.mockResolvedValue({ ...validBooking, status: "CANCELLED_BY_TUTOR" });
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      const result = await controller.cancelByParent(req, "booking-1", { reason: "Conflict" });
      expect(mocks.cancelByTutor.execute).toHaveBeenCalledWith({ userId: "tutor-1", bookingId: "booking-1", reason: "Conflict" });
      expect(result.data.status).toBe("CANCELLED_BY_TUTOR");
    });

    it("should throw when cancellation window exceeded", async () => {
      mocks.cancelByParent.execute.mockRejectedValue(new Error("Cancellation window has expired"));
      const req = { user: { id: "parent-1", role: "PARENT" } } as any;
      await expect(controller.cancelByParent(req, "booking-1", {})).rejects.toThrow("Cancellation window");
    });
  });

  describe("complete", () => {
    it("should complete a booking", async () => {
      mocks.complete.execute.mockResolvedValue({ ...validBooking, status: "COMPLETED" });
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      const result = await controller.complete(req, "booking-1");
      expect(mocks.complete.execute).toHaveBeenCalledWith({ userId: "tutor-1", bookingId: "booking-1" });
      expect(result.data.status).toBe("COMPLETED");
    });

    it("should throw when booking cannot be completed early", async () => {
      mocks.complete.execute.mockRejectedValue(new Error("Booking cannot be completed before session end"));
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      await expect(controller.complete(req, "booking-1")).rejects.toThrow("cannot be completed");
    });
  });

  describe("get", () => {
    it("should get booking by id", async () => {
      mocks.get.execute.mockResolvedValue(validBooking);
      const req = { user: { id: "parent-1" } } as any;
      const result = await controller.get(req, "booking-1");
      expect(result).toEqual({ data: validBooking });
      expect(mocks.get.execute).toHaveBeenCalledWith({ userId: "parent-1", bookingId: "booking-1" });
    });

    it("should throw when booking not found", async () => {
      mocks.get.execute.mockRejectedValue(new Error("Booking not found"));
      const req = { user: { id: "parent-1" } } as any;
      await expect(controller.get(req, "bad-id")).rejects.toThrow("Booking not found");
    });
  });

  describe("getHistory", () => {
    it("should get booking status history", async () => {
      const history = [{ id: "h-1", bookingId: "booking-1", fromStatus: null, toStatus: "REQUESTED", changedByUserId: null, reason: null, createdAt: new Date() }];
      mocks.getHistory.execute.mockResolvedValue(history);
      const req = { user: { id: "parent-1" } } as any;
      const result = await controller.getHistory(req, "booking-1");
      expect(result).toEqual({ data: history });
    });
  });

  describe("listParentBookings", () => {
    it("should list parent bookings", async () => {
      mocks.listParent.execute.mockResolvedValue([validBooking]);
      const req = { user: { id: "parent-1", role: "PARENT" } } as any;
      const result = await controller.listParentBookings(req, { limit: 20 } as any);
      expect(result.data).toHaveLength(1);
      expect(mocks.listParent.execute).toHaveBeenCalledWith({
        userId: "parent-1",
        query: { status: undefined, from: undefined, to: undefined, limit: 20, offset: undefined },
      });
    });

    it("should handle empty bookings list", async () => {
      mocks.listParent.execute.mockResolvedValue([]);
      const req = { user: { id: "parent-1", role: "PARENT" } } as any;
      const result = await controller.listParentBookings(req, {} as any);
      expect(result.data).toHaveLength(0);
    });
  });

  describe("listTutorBookings", () => {
    it("should list tutor bookings", async () => {
      mocks.listTutor.execute.mockResolvedValue([validBooking]);
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      const result = await controller.listTutorBookings(req, { limit: 20 } as any);
      expect(result.data).toHaveLength(1);
      expect(mocks.listTutor.execute).toHaveBeenCalledWith({
        userId: "tutor-1",
        query: { status: undefined, from: undefined, to: undefined, limit: 20, offset: undefined },
      });
    });
  });

  describe("reschedule", () => {
    it("should reschedule a booking", async () => {
      const rescheduled = { oldBooking: { ...validBooking }, newBooking: { ...validBooking, status: "RESCHEDULED" } };
      mocks.reschedule.execute.mockResolvedValue(rescheduled);
      const req = { user: { id: "parent-1", role: "PARENT" } } as any;
      const result = await controller.reschedule(req, "booking-1", { newAvailabilitySlotId: "slot-2" });
      expect(mocks.reschedule.execute).toHaveBeenCalledWith({
        userId: "parent-1",
        bookingId: "booking-1",
        data: { newAvailabilitySlotId: "slot-2", reason: undefined },
      });
      expect(result.data.newBooking.status).toBe("RESCHEDULED");
    });
  });
});