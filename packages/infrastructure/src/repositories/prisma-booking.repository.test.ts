import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaBookingRepository } from "./prisma-booking.repository";
import type { BookingRepository, CreateBookingRecord, CreateStatusHistoryRecord, BookingQueryOptions } from "@tutor-marketplace/application";

// Mock the database module
vi.mock("@tutor-marketplace/database", () => ({
  getPrismaClient: vi.fn(),
}));

import { getPrismaClient } from "@tutor-marketplace/database";

describe("PrismaBookingRepository", () => {
  let repository: PrismaBookingRepository;
  let mockPrisma: any;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      booking: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      bookingStatusHistory: {
        create: vi.fn(),
      },
    };

    mockPrisma = {
      booking: mockDb.booking,
      bookingStatusHistory: mockDb.bookingStatusHistory,
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    repository = new PrismaBookingRepository();
  });

  describe("findById", () => {
    it("should return a booking record when found", async () => {
      const mockRecord = {
        id: "booking-1",
        publicId: "public-1",
        parentId: "parent-1",
        studentId: "student-1",
        tutorId: "tutor-1",
        subjectId: "subject-1",
        tutorSubjectId: null,
        availabilitySlotId: null,
        classType: "REGULAR",
        serviceMode: "ONLINE",
        status: "REQUESTED",
        startAt: new Date("2024-01-01T10:00:00Z"),
        endAt: new Date("2024-01-01T11:00:00Z"),
        timezone: "Asia/Kolkata",
        durationMinutes: 60,
        city: "Mumbai",
        address: "Address 1",
        meetingUrl: null,
        priceAmount: "1000",
        platformFeeAmount: "100",
        tutorEarningsAmount: "900",
        currency: "INR",
        cancellationReason: null,
        rescheduledFromBookingId: null,
        acceptedAt: null,
        rejectedAt: null,
        cancelledAt: null,
        completedAt: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:00:00Z"),
      };

      mockDb.booking.findUnique.mockResolvedValue(mockRecord);

      const result = await repository.findById("booking-1");

      expect(result).toEqual({
        id: "booking-1",
        publicId: "public-1",
        parentId: "parent-1",
        studentId: "student-1",
        tutorId: "tutor-1",
        subjectId: "subject-1",
        tutorSubjectId: null,
        availabilitySlotId: null,
        classType: "REGULAR",
        serviceMode: "ONLINE",
        status: "REQUESTED",
        startAt: new Date("2024-01-01T10:00:00Z"),
        endAt: new Date("2024-01-01T11:00:00Z"),
        timezone: "Asia/Kolkata",
        durationMinutes: 60,
        city: "Mumbai",
        address: "Address 1",
        meetingUrl: null,
        priceAmount: "1000",
        platformFeeAmount: "100",
        tutorEarningsAmount: "900",
        currency: "INR",
        cancellationReason: null,
        rescheduledFromBookingId: null,
        acceptedAt: null,
        rejectedAt: null,
        cancelledAt: null,
        completedAt: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:00:00Z"),
      });
      expect(mockDb.booking.findUnique).toHaveBeenCalledWith({ where: { id: "booking-1" } });
    });

    it("should return null when booking not found", async () => {
      mockDb.booking.findUnique.mockResolvedValue(null);

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      mockDb.booking.findUnique.mockRejectedValue(new Error("Database connection error"));

      await expect(repository.findById("booking-1")).rejects.toThrow("Database connection error");
    });
  });

  describe("findByPublicId", () => {
    it("should return a booking record when found by public ID", async () => {
      const mockRecord = {
        id: "booking-1",
        publicId: "public-123",
        parentId: "parent-1",
        studentId: "student-1",
        tutorId: "tutor-1",
        subjectId: "subject-1",
        tutorSubjectId: null,
        availabilitySlotId: null,
        classType: "REGULAR",
        serviceMode: "ONLINE",
        status: "REQUESTED",
        startAt: new Date("2024-01-01T10:00:00Z"),
        endAt: new Date("2024-01-01T11:00:00Z"),
        timezone: "Asia/Kolkata",
        durationMinutes: 60,
        city: "Mumbai",
        address: null,
        meetingUrl: null,
        priceAmount: "1000",
        platformFeeAmount: "100",
        tutorEarningsAmount: "900",
        currency: "INR",
        cancellationReason: null,
        rescheduledFromBookingId: null,
        acceptedAt: null,
        rejectedAt: null,
        cancelledAt: null,
        completedAt: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:00:00Z"),
      };

      mockDb.booking.findUnique.mockResolvedValue(mockRecord);

      const result = await repository.findByPublicId("public-123");

      expect(result).not.toBeNull();
      expect(result?.publicId).toBe("public-123");
      expect(mockDb.booking.findUnique).toHaveBeenCalledWith({ where: { publicId: "public-123" } });
    });

    it("should return null when public ID not found", async () => {
      mockDb.booking.findUnique.mockResolvedValue(null);

      const result = await repository.findByPublicId("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("findByParentId", () => {
    it("should return bookings for a parent with options", async () => {
      const mockRecords = [
        {
          id: "booking-1",
          publicId: "public-1",
          parentId: "parent-1",
          studentId: "student-1",
          tutorId: "tutor-1",
          subjectId: "subject-1",
          tutorSubjectId: null,
          availabilitySlotId: null,
          classType: "REGULAR",
          serviceMode: "ONLINE",
          status: "REQUESTED",
          startAt: new Date("2024-01-01T10:00:00Z"),
          endAt: new Date("2024-01-01T11:00:00Z"),
          timezone: "Asia/Kolkata",
          durationMinutes: 60,
          city: "Mumbai",
          address: null,
          meetingUrl: null,
          priceAmount: "1000",
          platformFeeAmount: "100",
          tutorEarningsAmount: "900",
          currency: "INR",
          cancellationReason: null,
          rescheduledFromBookingId: null,
          acceptedAt: null,
          rejectedAt: null,
          cancelledAt: null,
          completedAt: null,
          createdAt: new Date("2024-01-01T09:00:00Z"),
          updatedAt: new Date("2024-01-01T09:00:00Z"),
        },
      ];

      mockDb.booking.findMany.mockResolvedValue(mockRecords);

      const opts: BookingQueryOptions = {
        status: "REQUESTED",
        from: new Date("2024-01-01"),
        to: new Date("2024-01-31"),
        limit: 10,
        offset: 0,
      };

      const result = await repository.findByParentId("parent-1", opts);

      expect(result).toHaveLength(1);
      expect(result[0].parentId).toBe("parent-1");
      expect(mockDb.booking.findMany).toHaveBeenCalledWith({
        where: {
          parentId: "parent-1",
          status: "REQUESTED",
          startAt: { gte: new Date("2024-01-01"), lte: new Date("2024-01-31") },
        },
        orderBy: { startAt: "desc" },
        take: 10,
        skip: 0,
      });
    });

    it("should return empty array when no bookings found", async () => {
      mockDb.booking.findMany.mockResolvedValue([]);

      const result = await repository.findByParentId("parent-1");

      expect(result).toEqual([]);
    });

    it("should handle date range filtering", async () => {
      mockDb.booking.findMany.mockResolvedValue([]);

      const opts: BookingQueryOptions = {
        from: new Date("2024-01-01"),
        to: new Date("2024-01-31"),
      };

      await repository.findByParentId("parent-1", opts);

      expect(mockDb.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startAt: {
              gte: new Date("2024-01-01"),
              lte: new Date("2024-01-31"),
            },
          }),
        })
      );
    });
  });

  describe("findByTutorId", () => {
    it("should return bookings for a tutor", async () => {
      const mockRecords = [
        {
          id: "booking-1",
          publicId: "public-1",
          parentId: "parent-1",
          studentId: "student-1",
          tutorId: "tutor-1",
          subjectId: "subject-1",
          tutorSubjectId: null,
          availabilitySlotId: null,
          classType: "REGULAR",
          serviceMode: "ONLINE",
          status: "ACCEPTED",
          startAt: new Date("2024-01-01T10:00:00Z"),
          endAt: new Date("2024-01-01T11:00:00Z"),
          timezone: "Asia/Kolkata",
          durationMinutes: 60,
          city: "Mumbai",
          address: null,
          meetingUrl: null,
          priceAmount: "1000",
          platformFeeAmount: "100",
          tutorEarningsAmount: "900",
          currency: "INR",
          cancellationReason: null,
          rescheduledFromBookingId: null,
          acceptedAt: new Date("2024-01-01T09:30:00Z"),
          rejectedAt: null,
          cancelledAt: null,
          completedAt: null,
          createdAt: new Date("2024-01-01T09:00:00Z"),
          updatedAt: new Date("2024-01-01T09:30:00Z"),
        },
      ];

      mockDb.booking.findMany.mockResolvedValue(mockRecords);

      const result = await repository.findByTutorId("tutor-1", { status: "ACCEPTED" });

      expect(result).toHaveLength(1);
      expect(result[0].tutorId).toBe("tutor-1");
      expect(mockDb.booking.findMany).toHaveBeenCalledWith({
        where: { tutorId: "tutor-1", status: "ACCEPTED" },
        orderBy: { startAt: "desc" },
      });
    });
  });

  describe("findByTutorIdAndTimeRange", () => {
    it("should return bookings within a time range with specific statuses", async () => {
      const mockRecords = [
        {
          id: "booking-1",
          publicId: "public-1",
          parentId: "parent-1",
          studentId: "student-1",
          tutorId: "tutor-1",
          subjectId: "subject-1",
          tutorSubjectId: null,
          availabilitySlotId: null,
          classType: "REGULAR",
          serviceMode: "ONLINE",
          status: "REQUESTED",
          startAt: new Date("2024-01-01T10:00:00Z"),
          endAt: new Date("2024-01-01T11:00:00Z"),
          timezone: "Asia/Kolkata",
          durationMinutes: 60,
          city: "Mumbai",
          address: null,
          meetingUrl: null,
          priceAmount: "1000",
          platformFeeAmount: "100",
          tutorEarningsAmount: "900",
          currency: "INR",
          cancellationReason: null,
          rescheduledFromBookingId: null,
          acceptedAt: null,
          rejectedAt: null,
          cancelledAt: null,
          completedAt: null,
          createdAt: new Date("2024-01-01T09:00:00Z"),
          updatedAt: new Date("2024-01-01T09:00:00Z"),
        },
      ];

      mockDb.booking.findMany.mockResolvedValue(mockRecords);

      const startAt = new Date("2024-01-01T09:00:00Z");
      const endAt = new Date("2024-01-01T12:00:00Z");

      const result = await repository.findByTutorIdAndTimeRange("tutor-1", startAt, endAt);

      expect(result).toHaveLength(1);
      expect(mockDb.booking.findMany).toHaveBeenCalledWith({
        where: {
          tutorId: "tutor-1",
          startAt: { lt: endAt },
          endAt: { gt: startAt },
          status: { in: ["REQUESTED", "ACCEPTED"] },
        },
      });
    });

    it("should return empty array when no bookings in time range", async () => {
      mockDb.booking.findMany.mockResolvedValue([]);

      const result = await repository.findByTutorIdAndTimeRange(
        "tutor-1",
        new Date("2024-01-01T09:00:00Z"),
        new Date("2024-01-01T12:00:00Z")
      );

      expect(result).toEqual([]);
    });
  });

  describe("findBySlotId", () => {
    it("should return booking by slot ID", async () => {
      const mockRecord = {
        id: "booking-1",
        publicId: "public-1",
        parentId: "parent-1",
        studentId: "student-1",
        tutorId: "tutor-1",
        subjectId: "subject-1",
        tutorSubjectId: null,
        availabilitySlotId: "slot-1",
        classType: "REGULAR",
        serviceMode: "ONLINE",
        status: "REQUESTED",
        startAt: new Date("2024-01-01T10:00:00Z"),
        endAt: new Date("2024-01-01T11:00:00Z"),
        timezone: "Asia/Kolkata",
        durationMinutes: 60,
        city: "Mumbai",
        address: null,
        meetingUrl: null,
        priceAmount: "1000",
        platformFeeAmount: "100",
        tutorEarningsAmount: "900",
        currency: "INR",
        cancellationReason: null,
        rescheduledFromBookingId: null,
        acceptedAt: null,
        rejectedAt: null,
        cancelledAt: null,
        completedAt: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:00:00Z"),
      };

      mockDb.booking.findUnique.mockResolvedValue(mockRecord);

      const result = await repository.findBySlotId("slot-1");

      expect(result).not.toBeNull();
      expect(result?.availabilitySlotId).toBe("slot-1");
      expect(mockDb.booking.findUnique).toHaveBeenCalledWith({ where: { availabilitySlotId: "slot-1" } });
    });

    it("should return null when slot ID not found", async () => {
      mockDb.booking.findUnique.mockResolvedValue(null);

      const result = await repository.findBySlotId("non-existent-slot");

      expect(result).toBeNull();
    });
  });

  describe("findOverlapping", () => {
    it("should return overlapping bookings", async () => {
      const mockRecords = [
        {
          id: "booking-1",
          publicId: "public-1",
          parentId: "parent-1",
          studentId: "student-1",
          tutorId: "tutor-1",
          subjectId: "subject-1",
          tutorSubjectId: null,
          availabilitySlotId: null,
          classType: "REGULAR",
          serviceMode: "ONLINE",
          status: "REQUESTED",
          startAt: new Date("2024-01-01T10:00:00Z"),
          endAt: new Date("2024-01-01T11:00:00Z"),
          timezone: "Asia/Kolkata",
          durationMinutes: 60,
          city: "Mumbai",
          address: null,
          meetingUrl: null,
          priceAmount: "1000",
          platformFeeAmount: "100",
          tutorEarningsAmount: "900",
          currency: "INR",
          cancellationReason: null,
          rescheduledFromBookingId: null,
          acceptedAt: null,
          rejectedAt: null,
          cancelledAt: null,
          completedAt: null,
          createdAt: new Date("2024-01-01T09:00:00Z"),
          updatedAt: new Date("2024-01-01T09:00:00Z"),
        },
      ];

      mockDb.booking.findMany.mockResolvedValue(mockRecords);

      const startAt = new Date("2024-01-01T09:30:00Z");
      const endAt = new Date("2024-01-01T10:30:00Z");

      const result = await repository.findOverlapping("tutor-1", startAt, endAt);

      expect(result).toHaveLength(1);
      expect(mockDb.booking.findMany).toHaveBeenCalledWith({
        where: {
          tutorId: "tutor-1",
          startAt: { lt: endAt },
          endAt: { gt: startAt },
          status: { in: ["REQUESTED", "ACCEPTED"] },
        },
      });
    });

    it("should exclude a specific booking ID when provided", async () => {
      mockDb.booking.findMany.mockResolvedValue([]);

      await repository.findOverlapping(
        "tutor-1",
        new Date("2024-01-01T09:30:00Z"),
        new Date("2024-01-01T10:30:00Z"),
        "booking-exclude"
      );

      expect(mockDb.booking.findMany).toHaveBeenCalledWith({
        where: {
          tutorId: "tutor-1",
          startAt: { lt: new Date("2024-01-01T10:30:00Z") },
          endAt: { gt: new Date("2024-01-01T09:30:00Z") },
          status: { in: ["REQUESTED", "ACCEPTED"] },
          id: { not: "booking-exclude" },
        },
      });
    });
  });

  describe("create", () => {
    it("should create a booking with default values", async () => {
      const createData: CreateBookingRecord = {
        parentId: "parent-1",
        studentId: "student-1",
        tutorId: "tutor-1",
        subjectId: "subject-1",
        serviceMode: "ONLINE",
        startAt: new Date("2024-01-01T10:00:00Z"),
        endAt: new Date("2024-01-01T11:00:00Z"),
        durationMinutes: 60,
        priceAmount: "1000",
        platformFeeAmount: "100",
        tutorEarningsAmount: "900",
        currency: "INR",
      };

      const mockRecord = {
        id: "booking-new",
        publicId: "public-new",
        parentId: "parent-1",
        studentId: "student-1",
        tutorId: "tutor-1",
        subjectId: "subject-1",
        tutorSubjectId: null,
        availabilitySlotId: null,
        classType: "REGULAR",
        serviceMode: "ONLINE",
        status: "REQUESTED",
        startAt: new Date("2024-01-01T10:00:00Z"),
        endAt: new Date("2024-01-01T11:00:00Z"),
        timezone: "Asia/Kolkata",
        durationMinutes: 60,
        city: null,
        address: undefined,
        priceAmount: "1000",
        platformFeeAmount: "100",
        tutorEarningsAmount: "900",
        currency: "INR",
        rescheduledFromBookingId: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:00:00Z"),
      };

      mockDb.booking.create.mockResolvedValue(mockRecord);

      const result = await repository.create(createData);

      expect(result).toEqual({
        id: "booking-new",
        publicId: "public-new",
        parentId: "parent-1",
        studentId: "student-1",
        tutorId: "tutor-1",
        subjectId: "subject-1",
        tutorSubjectId: null,
        availabilitySlotId: null,
        classType: "REGULAR",
        serviceMode: "ONLINE",
        status: "REQUESTED",
        startAt: new Date("2024-01-01T10:00:00Z"),
        endAt: new Date("2024-01-01T11:00:00Z"),
        timezone: "Asia/Kolkata",
        durationMinutes: 60,
        city: null,
        address: null,
        meetingUrl: null,
        priceAmount: "1000",
        platformFeeAmount: "100",
        tutorEarningsAmount: "900",
        currency: "INR",
        cancellationReason: null,
        rescheduledFromBookingId: null,
        acceptedAt: null,
        rejectedAt: null,
        cancelledAt: null,
        completedAt: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:00:00Z"),
      });

      expect(mockDb.booking.create).toHaveBeenCalledWith({
        data: {
          parentId: "parent-1",
          studentId: "student-1",
          tutorId: "tutor-1",
          subjectId: "subject-1",
          tutorSubjectId: null,
          availabilitySlotId: null,
          classType: "REGULAR",
          serviceMode: "ONLINE",
          startAt: new Date("2024-01-01T10:00:00Z"),
          endAt: new Date("2024-01-01T11:00:00Z"),
          timezone: "Asia/Kolkata",
          durationMinutes: 60,
          city: null,
          address: undefined,
          priceAmount: "1000",
          platformFeeAmount: "100",
          tutorEarningsAmount: "900",
          currency: "INR",
          rescheduledFromBookingId: null,
          status: "REQUESTED",
        },
      });
    });

    it("should create a booking with optional fields", async () => {
      const createData: CreateBookingRecord = {
        parentId: "parent-1",
        studentId: "student-1",
        tutorId: "tutor-1",
        subjectId: "subject-1",
        tutorSubjectId: "tutor-subject-1",
        availabilitySlotId: "slot-1",
        classType: "TRIAL",
        serviceMode: "OFFLINE",
        startAt: new Date("2024-01-01T10:00:00Z"),
        endAt: new Date("2024-01-01T11:00:00Z"),
        durationMinutes: 60,
        city: "Mumbai",
        address: "Address 1",
        priceAmount: "1000",
        platformFeeAmount: "100",
        tutorEarningsAmount: "900",
        currency: "USD",
        rescheduledFromBookingId: "booking-old",
      };

      const mockRecord = {
        id: "booking-new",
        publicId: "public-new",
        parentId: "parent-1",
        studentId: "student-1",
        tutorId: "tutor-1",
        subjectId: "subject-1",
        tutorSubjectId: "tutor-subject-1",
        availabilitySlotId: "slot-1",
        classType: "TRIAL",
        serviceMode: "OFFLINE",
        status: "REQUESTED",
        startAt: new Date("2024-01-01T10:00:00Z"),
        endAt: new Date("2024-01-01T11:00:00Z"),
        timezone: "Asia/Kolkata",
        durationMinutes: 60,
        city: "Mumbai",
        address: "Address 1",
        meetingUrl: null,
        priceAmount: "1000",
        platformFeeAmount: "100",
        tutorEarningsAmount: "900",
        currency: "USD",
        rescheduledFromBookingId: "booking-old",
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:00:00Z"),
      };

      mockDb.booking.create.mockResolvedValue(mockRecord);

      const result = await repository.create(createData);

      expect(result.tutorSubjectId).toBe("tutor-subject-1");
      expect(result.availabilitySlotId).toBe("slot-1");
      expect(result.classType).toBe("TRIAL");
      expect(mockDb.booking.create).toHaveBeenCalled();
    });
  });

  describe("updateStatus", () => {
    it("should update status with ACCEPTED timestamp", async () => {
      const mockRecord = {
        id: "booking-1",
        publicId: "public-1",
        parentId: "parent-1",
        studentId: "student-1",
        tutorId: "tutor-1",
        subjectId: "subject-1",
        tutorSubjectId: null,
        availabilitySlotId: null,
        classType: "REGULAR",
        serviceMode: "ONLINE",
        status: "ACCEPTED",
        startAt: new Date("2024-01-01T10:00:00Z"),
        endAt: new Date("2024-01-01T11:00:00Z"),
        timezone: "Asia/Kolkata",
        durationMinutes: 60,
        city: "Mumbai",
        address: null,
        meetingUrl: null,
        priceAmount: "1000",
        platformFeeAmount: "100",
        tutorEarningsAmount: "900",
        currency: "INR",
        cancellationReason: null,
        rescheduledFromBookingId: null,
        acceptedAt: new Date("2024-01-01T09:30:00Z"),
        rejectedAt: null,
        cancelledAt: null,
        completedAt: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:30:00Z"),
      };

      mockDb.booking.update.mockResolvedValue(mockRecord);

      const result = await repository.updateStatus("booking-1", "ACCEPTED", "user-1");

      expect(result.status).toBe("ACCEPTED");
      expect(result.acceptedAt).not.toBeNull();
      expect(mockDb.booking.update).toHaveBeenCalledWith({
        where: { id: "booking-1" },
        data: expect.objectContaining({
          status: "ACCEPTED",
          acceptedAt: expect.any(Date),
        }),
      });
    });

    it("should update status with REJECTED timestamp", async () => {
      const mockRecord = {
        id: "booking-1",
        publicId: "public-1",
        parentId: "parent-1",
        studentId: "student-1",
        tutorId: "tutor-1",
        subjectId: "subject-1",
        tutorSubjectId: null,
        availabilitySlotId: null,
        classType: "REGULAR",
        serviceMode: "ONLINE",
        status: "REJECTED",
        startAt: new Date("2024-01-01T10:00:00Z"),
        endAt: new Date("2024-01-01T11:00:00Z"),
        timezone: "Asia/Kolkata",
        durationMinutes: 60,
        city: "Mumbai",
        address: null,
        meetingUrl: null,
        priceAmount: "1000",
        platformFeeAmount: "100",
        tutorEarningsAmount: "900",
        currency: "INR",
        cancellationReason: "Not available",
        rescheduledFromBookingId: null,
        acceptedAt: null,
        rejectedAt: new Date("2024-01-01T09:30:00Z"),
        cancelledAt: null,
        completedAt: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:30:00Z"),
      };

      mockDb.booking.update.mockResolvedValue(mockRecord);

      const result = await repository.updateStatus("booking-1", "REJECTED", "user-1", "Not available");

      expect(result.status).toBe("REJECTED");
      expect(result.rejectedAt).not.toBeNull();
      expect(result.cancellationReason).toBe("Not available");
    });

    it("should update status with CANCELLED_BY_PARENT timestamp", async () => {
      const mockRecord = {
        id: "booking-1",
        publicId: "public-1",
        parentId: "parent-1",
        studentId: "student-1",
        tutorId: "tutor-1",
        subjectId: "subject-1",
        tutorSubjectId: null,
        availabilitySlotId: null,
        classType: "REGULAR",
        serviceMode: "ONLINE",
        status: "CANCELLED_BY_PARENT",
        startAt: new Date("2024-01-01T10:00:00Z"),
        endAt: new Date("2024-01-01T11:00:00Z"),
        timezone: "Asia/Kolkata",
        durationMinutes: 60,
        city: "Mumbai",
        address: null,
        meetingUrl: null,
        priceAmount: "1000",
        platformFeeAmount: "100",
        tutorEarningsAmount: "900",
        currency: "INR",
        cancellationReason: "Change of plans",
        rescheduledFromBookingId: null,
        acceptedAt: null,
        rejectedAt: null,
        cancelledAt: new Date("2024-01-01T09:30:00Z"),
        completedAt: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:30:00Z"),
      };

      mockDb.booking.update.mockResolvedValue(mockRecord);

      const result = await repository.updateStatus("booking-1", "CANCELLED_BY_PARENT", null, "Change of plans");

      expect(result.status).toBe("CANCELLED_BY_PARENT");
      expect(result.cancelledAt).not.toBeNull();
    });

    it("should handle database errors", async () => {
      mockDb.booking.update.mockRejectedValue(new Error("Update failed"));

      await expect(repository.updateStatus("booking-1", "ACCEPTED")).rejects.toThrow("Update failed");
    });
  });

  describe("addStatusHistory", () => {
    it("should create a status history entry", async () => {
      const entry: CreateStatusHistoryRecord = {
        bookingId: "booking-1",
        fromStatus: "REQUESTED",
        toStatus: "ACCEPTED",
        changedByUserId: "user-1",
        reason: "Tutor accepted",
        metadata: { note: "First session" },
      };

      mockDb.bookingStatusHistory.create.mockResolvedValue({ id: "history-1" });

      await repository.addStatusHistory(entry);

      expect(mockDb.bookingStatusHistory.create).toHaveBeenCalledWith({
        data: {
          bookingId: "booking-1",
          fromStatus: "REQUESTED",
          toStatus: "ACCEPTED",
          changedByUserId: "user-1",
          reason: "Tutor accepted",
          metadata: { note: "First session" },
        },
      });
    });

    it("should handle null optional fields", async () => {
      const entry: CreateStatusHistoryRecord = {
        bookingId: "booking-1",
        fromStatus: "REQUESTED",
        toStatus: "ACCEPTED",
      };

      mockDb.bookingStatusHistory.create.mockResolvedValue({ id: "history-1" });

      await repository.addStatusHistory(entry);

      expect(mockDb.bookingStatusHistory.create).toHaveBeenCalledWith({
        data: {
          bookingId: "booking-1",
          fromStatus: "REQUESTED",
          toStatus: "ACCEPTED",
          changedByUserId: null,
          reason: null,
          metadata: undefined,
        },
      });
    });

    it("should handle database errors", async () => {
      mockDb.bookingStatusHistory.create.mockRejectedValue(new Error("Insert failed"));

      const entry: CreateStatusHistoryRecord = {
        bookingId: "booking-1",
        fromStatus: "REQUESTED",
        toStatus: "ACCEPTED",
      };

      await expect(repository.addStatusHistory(entry)).rejects.toThrow("Insert failed");
    });
  });

  describe("countByTutorIdAndStatus", () => {
    it("should return count of bookings", async () => {
      mockDb.booking.count.mockResolvedValue(15);

      const result = await repository.countByTutorIdAndStatus("tutor-1", "ACCEPTED");

      expect(result).toBe(15);
      expect(mockDb.booking.count).toHaveBeenCalledWith({
        where: { tutorId: "tutor-1", status: "ACCEPTED" },
      });
    });

    it("should return zero when no bookings match", async () => {
      mockDb.booking.count.mockResolvedValue(0);

      const result = await repository.countByTutorIdAndStatus("tutor-1", "CANCELLED");

      expect(result).toBe(0);
    });
  });
});