import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminController } from "./admin.controller.js";
import {
  ListUsersUseCase,
  GetUserUseCase,
  SuspendUserUseCase,
  ActivateUserUseCase,
  ListTutorsUseCase,
  ListBookingsUseCase,
  AdminGetBookingUseCase,
  AdminCancelBookingUseCase,
  ListPaymentsUseCase,
  AdminListRefundsUseCase,
  GetAdminOverviewUseCase,
  ListAuditLogsUseCase,
} from "@tutor-marketplace/application";

describe("AdminController", () => {
  let controller: AdminController;
  const mocks = {
    listUsers: { execute: vi.fn() },
    getUser: { execute: vi.fn() },
    suspendUser: { execute: vi.fn() },
    activateUser: { execute: vi.fn() },
    listTutors: { execute: vi.fn() },
    listBookings: { execute: vi.fn() },
    getBooking: { execute: vi.fn() },
    cancelBooking: { execute: vi.fn() },
    listPayments: { execute: vi.fn() },
    listRefunds: { execute: vi.fn() },
    getOverview: { execute: vi.fn() },
    listAuditLogs: { execute: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AdminController(
      mocks.listUsers as unknown as ListUsersUseCase,
      mocks.getUser as unknown as GetUserUseCase,
      mocks.suspendUser as unknown as SuspendUserUseCase,
      mocks.activateUser as unknown as ActivateUserUseCase,
      mocks.listTutors as unknown as ListTutorsUseCase,
      mocks.listBookings as unknown as ListBookingsUseCase,
      mocks.getBooking as unknown as AdminGetBookingUseCase,
      mocks.cancelBooking as unknown as AdminCancelBookingUseCase,
      mocks.listPayments as unknown as ListPaymentsUseCase,
      mocks.listRefunds as unknown as AdminListRefundsUseCase,
      mocks.getOverview as unknown as GetAdminOverviewUseCase,
      mocks.listAuditLogs as unknown as ListAuditLogsUseCase,
    );
  });

  describe("getOverview", () => {
    it("should return admin overview", async () => {
      const overview = {
        users: { total: 100, byStatus: { ACTIVE: 90, SUSPENDED: 5, PENDING: 5 } },
        tutors: { total: 20, byStatus: { ACTIVE: 20 } },
        bookings: { total: 200, byStatus: { COMPLETED: 200 } },
        payments: { total: 150, totalCapturedAmount: 50000000 },
        refunds: { total: 5 },
      };
      mocks.getOverview.execute.mockResolvedValue(overview);
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.getOverview(req);
      expect(result.data.users.total).toBe(100);
      expect(mocks.getOverview.execute).toHaveBeenCalledWith({ actorUserId: "admin-1" });
    });

    it("should propagate unauthorized error for non-admin", async () => {
      mocks.getOverview.execute.mockRejectedValue(new Error("Insufficient permissions"));
      const req = { user: { id: "user-1", role: "PARENT" } } as any;
      await expect(controller.getOverview(req)).rejects.toThrow("Insufficient permissions");
    });
  });

  describe("listUsers", () => {
    it("should list users", async () => {
      const user = { id: "user-1", displayName: "Test", primaryRole: "PARENT", status: "ACTIVE", email: "test@example.com", phone: null, createdAt: new Date().toISOString(), roles: ["PARENT"] };
      mocks.listUsers.execute.mockResolvedValue({ data: [user], page: { nextCursor: null, hasMore: false, limit: 20 } });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.listUsers(req, undefined, 20, undefined, undefined, undefined);
      expect(result.data).toHaveLength(1);
      expect(mocks.listUsers.execute).toHaveBeenCalledWith({
        actorUserId: "admin-1",
        query: { cursor: null, limit: 20, status: undefined, role: undefined, search: undefined },
      });
    });
  });

  describe("suspendUser", () => {
    it("should suspend a user", async () => {
      mocks.suspendUser.execute.mockResolvedValue({
        id: "user-1",
        status: "SUSPENDED",
        suspendedAt: new Date().toISOString(),
        suspensionReason: "Violation",
      });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.suspendUser(req, "user-1", { reason: "Violation" } as any);
      expect(result.data.status).toBe("SUSPENDED");
      expect(mocks.suspendUser.execute).toHaveBeenCalledWith({
        actorUserId: "admin-1",
        userId: "user-1",
        reason: "Violation",
      });
    });

    it("should propagate invalid transition error", async () => {
      mocks.suspendUser.execute.mockRejectedValue(new Error("Invalid user status transition"));
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await expect(controller.suspendUser(req, "user-1", {} as any)).rejects.toThrow("Invalid user status");
    });
  });

  describe("activateUser", () => {
    it("should activate a user", async () => {
      mocks.activateUser.execute.mockResolvedValue({ id: "user-1", status: "ACTIVE" });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.activateUser(req, "user-1");
      expect(result.data.status).toBe("ACTIVE");
      expect(mocks.activateUser.execute).toHaveBeenCalledWith({ actorUserId: "admin-1", userId: "user-1" });
    });
  });

  describe("getUser", () => {
    it("should get user detail", async () => {
      const user = { id: "user-1", displayName: "Test", primaryRole: "PARENT", status: "ACTIVE", email: "test@example.com", phone: null, createdAt: new Date().toISOString() };
      mocks.getUser.execute.mockResolvedValue(user);
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.getUser(req, "user-1");
      expect(result.data.id).toBe("user-1");
    });

    it("should propagate user not found", async () => {
      mocks.getUser.execute.mockRejectedValue(new Error("User not found"));
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await expect(controller.getUser(req, "bad-id")).rejects.toThrow("User not found");
    });
  });

  describe("listTutors", () => {
    it("should list tutors", async () => {
      const tutor = { id: "tutor-1", displayName: "Dr. Sharma", status: "ACTIVE", headline: "Math Expert", city: "Mumbai" };
      mocks.listTutors.execute.mockResolvedValue({ data: [tutor], page: { nextCursor: null, hasMore: false, limit: 20 } });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.listTutors(req, undefined, 20, undefined, undefined);
      expect(result.data).toHaveLength(1);
    });
  });

  describe("listBookings", () => {
    it("should list bookings", async () => {
      const booking = { id: "booking-1", publicId: "pub-booking-1", status: "REQUESTED", startAt: new Date().toISOString(), endAt: new Date().toISOString(), parentId: "parent-1", tutorId: "tutor-1" };
      mocks.listBookings.execute.mockResolvedValue({ data: [booking], page: { nextCursor: null, hasMore: false, limit: 20 } });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.listBookings(req, undefined, 20, undefined);
      expect(result.data).toHaveLength(1);
    });
  });

  describe("getBooking", () => {
    it("should get booking detail", async () => {
      const booking = { id: "booking-1", publicId: "pub-booking-1", status: "REQUESTED" };
      mocks.getBooking.execute.mockResolvedValue(booking);
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.getBooking(req, "booking-1");
      expect(result.data.id).toBe("booking-1");
    });
  });

  describe("cancelBooking", () => {
    it("should cancel a booking", async () => {
      mocks.cancelBooking.execute.mockResolvedValue({ id: "booking-1", status: "CANCELLED_BY_ADMIN" });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.cancelBooking(req, "booking-1", { reason: "Policy violation" } as any);
      expect(result.data.status).toBe("CANCELLED_BY_ADMIN");
      expect(mocks.cancelBooking.execute).toHaveBeenCalledWith({
        actorUserId: "admin-1",
        bookingId: "booking-1",
        reason: "Policy violation",
      });
    });
  });

  describe("listPayments", () => {
    it("should list payments", async () => {
      const payment = { id: "payment-1", bookingId: "booking-1", parentId: "parent-1", provider: "RAZORPAY", status: "CAPTURED", amount: 50000, currency: "INR", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mocks.listPayments.execute.mockResolvedValue({ data: [payment], page: { nextCursor: null, hasMore: false, limit: 20 } });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.listPayments(req, undefined, 20, undefined);
      expect(result.data).toHaveLength(1);
    });
  });

  describe("listRefunds", () => {
    it("should list refunds", async () => {
      const refund = { id: "refund-1", paymentId: "payment-1", bookingId: "booking-1", status: "REQUESTED", amount: 50000, currency: "INR", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mocks.listRefunds.execute.mockResolvedValue({ data: [refund], page: { nextCursor: null, hasMore: false, limit: 20 } });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.listRefunds(req, undefined, 20, undefined);
      expect(result.data).toHaveLength(1);
    });
  });

  describe("listAuditLogs", () => {
    it("should list audit logs", async () => {
      const log = { id: "log-1", actorUserId: "admin-1", entityType: "USER", entityId: "user-1", action: "SUSPEND", metadata: null, createdAt: new Date().toISOString() };
      mocks.listAuditLogs.execute.mockResolvedValue({ data: [log], page: { nextCursor: null, hasMore: false, limit: 20 } });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.listAuditLogs(req, undefined, 20, undefined, undefined);
      expect(result.data).toHaveLength(1);
    });
  });

  describe("permission checks", () => {
    it("should reject non-admin access to suspend endpoint via controller propagation", async () => {
      mocks.suspendUser.execute.mockRejectedValue(new Error("Insufficient permissions"));
      const req = { user: { id: "user-1", role: "PARENT" } } as any;
      await expect(controller.suspendUser(req, "user-1", {} as any)).rejects.toThrow("Insufficient permissions");
    });

    it("should reject non-admin access to overview", async () => {
      mocks.getOverview.execute.mockRejectedValue(new Error("Forbidden"));
      const req = { user: { id: "user-1", role: "PARENT" } } as any;
      await expect(controller.getOverview(req)).rejects.toThrow("Forbidden");
    });

    it("should reject non-admin access to activateUser", async () => {
      mocks.activateUser.execute.mockRejectedValue(new Error("Insufficient permissions"));
      const req = { user: { id: "user-1", role: "SUPPORT" } } as any;
      await expect(controller.activateUser(req, "user-1")).rejects.toThrow("Insufficient permissions");
    });

    it("should reject non-admin access to cancelBooking", async () => {
      mocks.cancelBooking.execute.mockRejectedValue(new Error("Insufficient permissions"));
      const req = { user: { id: "user-1", role: "SUPPORT" } } as any;
      await expect(controller.cancelBooking(req, "booking-1", {} as any)).rejects.toThrow("Insufficient permissions");
    });

    it("should reject non-finance access to listPayments", async () => {
      mocks.listPayments.execute.mockRejectedValue(new Error("Forbidden"));
      const req = { user: { id: "user-1", role: "PARENT" } } as any;
      await expect(controller.listPayments(req, undefined, 20, undefined)).rejects.toThrow("Forbidden");
    });
  });

  // ---- Error handling & invalid IDs ----

  describe("error handling", () => {
    it("should propagate listUsers error", async () => {
      mocks.listUsers.execute.mockRejectedValue(new Error("Database query failed"));
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await expect(
        controller.listUsers(req, undefined, 20, undefined, undefined, undefined),
      ).rejects.toThrow("Database query failed");
    });

    it("should propagate listTutors error", async () => {
      mocks.listTutors.execute.mockRejectedValue(new Error("Database unavailable"));
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await expect(controller.listTutors(req, undefined, 20, undefined, undefined)).rejects.toThrow("Database unavailable");
    });

    it("should propagate listBookings error", async () => {
      mocks.listBookings.execute.mockRejectedValue(new Error("Booking service error"));
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await expect(controller.listBookings(req, undefined, 20, undefined)).rejects.toThrow("Booking service error");
    });

    it("should propagate listPayments error", async () => {
      mocks.listPayments.execute.mockRejectedValue(new Error("Payment service unavailable"));
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await expect(controller.listPayments(req, undefined, 20, undefined)).rejects.toThrow("Payment service unavailable");
    });

    it("should propagate listRefunds error", async () => {
      mocks.listRefunds.execute.mockRejectedValue(new Error("Refund service unavailable"));
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await expect(controller.listRefunds(req, undefined, 20, undefined)).rejects.toThrow("Refund service unavailable");
    });

    it("should propagate listAuditLogs error", async () => {
      mocks.listAuditLogs.execute.mockRejectedValue(new Error("Audit log query failed"));
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await expect(controller.listAuditLogs(req, undefined, 20, undefined, undefined)).rejects.toThrow("Audit log query failed");
    });

    it("should propagate getBooking error for invalid id", async () => {
      mocks.getBooking.execute.mockRejectedValue(new Error("Booking not found"));
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await expect(controller.getBooking(req, "invalid-booking-id")).rejects.toThrow("Booking not found");
    });

    it("should propagate cancelBooking error for invalid id", async () => {
      mocks.cancelBooking.execute.mockRejectedValue(new Error("Booking not found"));
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await expect(
        controller.cancelBooking(req, "invalid-booking-id", { reason: "test" } as any),
      ).rejects.toThrow("Booking not found");
    });
  });

  // ---- Empty results ----

  describe("empty results", () => {
    it("should handle empty user list", async () => {
      mocks.listUsers.execute.mockResolvedValue({ data: [], page: { nextCursor: null, hasMore: false, limit: 20 } });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.listUsers(req, undefined, 20, undefined, undefined, undefined);
      expect(result.data).toHaveLength(0);
    });

    it("should handle empty tutor list", async () => {
      mocks.listTutors.execute.mockResolvedValue({ data: [], page: { nextCursor: null, hasMore: false, limit: 20 } });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.listTutors(req, undefined, 20, undefined, undefined);
      expect(result.data).toHaveLength(0);
    });

    it("should handle empty booking list", async () => {
      mocks.listBookings.execute.mockResolvedValue({ data: [], page: { nextCursor: null, hasMore: false, limit: 20 } });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.listBookings(req, undefined, 20, undefined);
      expect(result.data).toHaveLength(0);
    });

    it("should handle empty payment list", async () => {
      mocks.listPayments.execute.mockResolvedValue({ data: [], page: { nextCursor: null, hasMore: false, limit: 20 } });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.listPayments(req, undefined, 20, undefined);
      expect(result.data).toHaveLength(0);
    });
  });
});

