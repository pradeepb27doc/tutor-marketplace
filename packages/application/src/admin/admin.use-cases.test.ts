import { describe, expect, it, beforeEach } from "vitest";
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
  AdminResourceNotFoundError,
  InvalidUserStatusTransitionError,
} from "./admin.use-cases.js";
import type {
  AdminRepository,
  AdminUserSummary,
  AdminTutorSummary,
  AdminBookingSummary,
  AdminPaymentSummary,
  AdminRefundSummary,
  AuditLogRecord,
  CursorPage,
  AdminOverview,
  AdminListQuery,
  AdminAuditLogQuery,
  CreateAuditLogInput,
} from "./admin.repository.js";
import type { UserRepository, UserRecord, CreateUserRecord } from "../index.js";
import type { BookingRepository, TutorAvailabilitySlotRepository } from "../bookings/index.js";
import { FakeClock } from "@tutor-marketplace/testing";

// --- Fakes ---

let _seq = 0;
function nextId(prefix: string): string {
  _seq += 1;
  return `${prefix}-${_seq}`;
}

class FakeAdminRepository implements AdminRepository {
  public users: AdminUserSummary[] = [];
  public tutors: AdminTutorSummary[] = [];
  public bookings: AdminBookingSummary[] = [];
  public payments: AdminPaymentSummary[] = [];
  public refunds: AdminRefundSummary[] = [];
  public auditLogs: AuditLogRecord[] = [];
  public overview: AdminOverview = {
    users: { total: 0, byStatus: {} },
    tutors: { total: 0, byStatus: {} },
    bookings: { total: 0, byStatus: {} },
    payments: { total: 0, totalCapturedAmount: 0 },
    refunds: { total: 0 },
  };

  async listUsers(query: AdminListQuery): Promise<CursorPage<AdminUserSummary>> {
    let result = [...this.users];
    if (query.status) result = result.filter((u) => u.status === query.status);
    if (query.role) result = result.filter((u) => u.primaryRole === query.role);
    if (query.search) {
      const s = query.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.displayName?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s) ||
          u.phone?.toLowerCase().includes(s),
      );
    }
    const limit = query.limit ?? 50;
    const page = result.slice(0, limit);
    return {
      data: page,
      page: { nextCursor: page.length === limit ? "cursor-next" : null, limit, hasMore: page.length === limit },
    };
  }

  async getUserById(id: string): Promise<AdminUserSummary | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async listTutors(query: AdminListQuery): Promise<CursorPage<AdminTutorSummary>> {
    let result = [...this.tutors];
    if (query.status) result = result.filter((t) => t.status === query.status);
    const limit = query.limit ?? 50;
    const page = result.slice(0, limit);
    return {
      data: page,
      page: { nextCursor: page.length === limit ? "cursor-next" : null, limit, hasMore: page.length === limit },
    };
  }

  async listBookings(query: AdminListQuery): Promise<CursorPage<AdminBookingSummary>> {
    let result = [...this.bookings];
    if (query.status) result = result.filter((b) => b.status === query.status);
    const limit = query.limit ?? 50;
    const page = result.slice(0, limit);
    return {
      data: page,
      page: { nextCursor: page.length === limit ? "cursor-next" : null, limit, hasMore: page.length === limit },
    };
  }

  async getBookingById(id: string): Promise<AdminBookingSummary | null> {
    return this.bookings.find((b) => b.id === id) ?? null;
  }

  async listPayments(query: AdminListQuery): Promise<CursorPage<AdminPaymentSummary>> {
    let result = [...this.payments];
    if (query.status) result = result.filter((p) => p.status === query.status);
    const limit = query.limit ?? 50;
    const page = result.slice(0, limit);
    return {
      data: page,
      page: { nextCursor: page.length === limit ? "cursor-next" : null, limit, hasMore: page.length === limit },
    };
  }

  async listRefunds(query: AdminListQuery): Promise<CursorPage<AdminRefundSummary>> {
    let result = [...this.refunds];
    if (query.status) result = result.filter((r) => r.status === query.status);
    const limit = query.limit ?? 50;
    const page = result.slice(0, limit);
    return {
      data: page,
      page: { nextCursor: page.length === limit ? "cursor-next" : null, limit, hasMore: page.length === limit },
    };
  }

  async getOverview(): Promise<AdminOverview> {
    return this.overview;
  }

  async listAuditLogs(query: AdminAuditLogQuery): Promise<CursorPage<AuditLogRecord>> {
    let result = [...this.auditLogs];
    if (query.entityType) result = result.filter((l) => l.entityType === query.entityType);
    if (query.action) result = result.filter((l) => l.action === query.action);
    const limit = query.limit ?? 50;
    const page = result.slice(0, limit);
    return {
      data: page,
      page: { nextCursor: page.length === limit ? "cursor-next" : null, limit, hasMore: page.length === limit },
    };
  }

  async createAuditLog(input: CreateAuditLogInput): Promise<AuditLogRecord> {
    const now = new Date();
    const record: AuditLogRecord = {
      id: nextId("audit"),
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      metadata: input.metadata ?? null,
      createdAt: now,
    };
    this.auditLogs.push(record);
    return record;
  }
}

class FakeUserRepo implements UserRepository {
  public users: UserRecord[] = [];

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async findByPhone(phone: string): Promise<UserRecord | null> {
    return this.users.find((u) => u.phone === phone) ?? null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async create(data: CreateUserRecord): Promise<UserRecord> {
    const now = new Date();
    const record: UserRecord = {
      id: nextId("user"),
      publicId: `pub-${nextId("user")}`,
      email: data.email ?? null,
      phone: data.phone ?? null,
      passwordHash: data.passwordHash ?? null,
      displayName: data.displayName ?? "Test User",
      avatarUrl: null,
      status: "ACTIVE",
      primaryRole: data.primaryRole,
      locale: data.locale ?? "en-IN",
      timezone: data.timezone ?? "Asia/Kolkata",
      emailVerifiedAt: data.email ? new Date() : null,
      phoneVerifiedAt: data.phone ? new Date() : null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    this.users.push(record);
    return record;
  }

  async update(id: string, data: Partial<UserRecord>): Promise<UserRecord> {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error("User not found");
    this.users[idx] = { ...this.users[idx], ...data, updatedAt: new Date() };
    return this.users[idx];
  }
}

class FakeBookingRepo implements BookingRepository {
  public bookings: Array<{
    id: string;
    publicId: string;
    parentId: string;
    studentId: string;
    tutorId: string;
    classType: string;
    serviceMode: string;
    status: string;
    startAt: Date;
    endAt: Date;
    timezone: string;
    durationMinutes: number;
    city: string | null;
    address: string | null;
    meetingUrl: string | null;
    priceAmount: string;
    platformFeeAmount: string;
    tutorEarningsAmount: string;
    currency: string;
    availabilitySlotId: string | null;
    rescheduledFromBookingId: string | null;
    cancellationReason: string | null;
    acceptedAt: Date | null;
    rejectedAt: Date | null;
    cancelledAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  async findById(id: string): Promise<any> {
    return this.bookings.find((b) => b.id === id) ?? null;
  }

  async updateStatus(id: string, status: string, changedByUserId?: string | null, reason?: string | null): Promise<any> {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) throw new Error("Booking not found");
    booking.status = status;
    booking.updatedAt = new Date();
    return booking;
  }

  async addStatusHistory(entry: { bookingId: string; fromStatus: string; toStatus: string; changedByUserId: string | null; reason: string | null }): Promise<void> {
    // no-op for testing
  }

  async findByPublicId(publicId: string): Promise<any> { return null; }
  async findByParentId(parentId: string): Promise<any[]> { return []; }
  async findByTutorId(tutorId: string): Promise<any[]> { return []; }
  async findByTutorIdAndTimeRange(tutorId: string, startAt: Date, endAt: Date): Promise<any[]> { return []; }
  async findBySlotId(slotId: string): Promise<any> { return null; }
  async findOverlapping(tutorId: string, startAt: Date, endAt: Date, excludeBookingId?: string): Promise<any[]> { return []; }
  async create(data: any): Promise<any> { return data; }
  async countByTutorIdAndStatus(tutorId: string, status: string): Promise<number> { return 0; }
}

class FakeSlotRepo implements TutorAvailabilitySlotRepository {
  async findById(id: string): Promise<any> { return null; }
  async findAvailableById(id: string): Promise<any> { return null; }
  async reserveSlot(id: string, reservedByParentId: string, reservedUntil: Date): Promise<void> {}
  async markAsBooked(id: string): Promise<void> {}
  async releaseSlot(id: string): Promise<void> {}
  async markAsExpired(id: string): Promise<void> {}
  async createConcreteSlot(data: any): Promise<any> { return data; }
}

function makeUserSummary(overrides?: Partial<AdminUserSummary>): AdminUserSummary {
  const id = nextId("user");
  return {
    id,
    publicId: `pub-${id}`,
    displayName: "Test User",
    primaryRole: "PARENT",
    status: "ACTIVE",
    email: "test@example.com",
    phone: "+919999999999",
    createdAt: new Date(),
    ...overrides,
  };
}

function makeTutorSummary(overrides?: Partial<AdminTutorSummary>): AdminTutorSummary {
  return {
    id: nextId("tutor"),
    userId: nextId("user"),
    status: "ACTIVE",
    headline: "Expert Tutor",
    city: "Mumbai",
    experienceYears: 5,
    averageRating: "4.50",
    createdAt: new Date(),
    ...overrides,
  };
}

function makeBookingSummary(overrides?: Partial<AdminBookingSummary>): AdminBookingSummary {
  return {
    id: nextId("booking"),
    publicId: `pub-${nextId("booking")}`,
    parentId: nextId("parent"),
    studentId: nextId("student"),
    tutorId: nextId("tutor"),
    classType: "REGULAR",
    serviceMode: "ONLINE",
    status: "REQUESTED",
    startAt: new Date("2026-07-20T10:00:00Z"),
    endAt: new Date("2026-07-20T11:00:00Z"),
    priceAmount: "500.00",
    currency: "INR",
    ...overrides,
  };
}

function setup() {
  const clock = new FakeClock(new Date("2026-07-14T00:00:00Z"));
  const adminRepo = new FakeAdminRepository();
  const userRepo = new FakeUserRepo();
  const bookingRepo = new FakeBookingRepo();
  const slotRepo = new FakeSlotRepo();
  return { clock, adminRepo, userRepo, bookingRepo, slotRepo };
}

// ===== Tests =====

describe("Admin Overview Use Cases", () => {
  it("returns admin overview", async () => {
    const s = setup();
    s.adminRepo.overview = {
      users: { total: 100, byStatus: { ACTIVE: 80, SUSPENDED: 20 } },
      tutors: { total: 50, byStatus: { ACTIVE: 40, PENDING_VERIFICATION: 10 } },
      bookings: { total: 200, byStatus: { COMPLETED: 150, REQUESTED: 50 } },
      payments: { total: 180, totalCapturedAmount: 500000 },
      refunds: { total: 10 },
    };

    const useCase = new GetAdminOverviewUseCase(s.adminRepo);
    const overview = await useCase.execute({ actorUserId: "admin-user" });

    expect(overview.users.total).toBe(100);
    expect(overview.tutors.total).toBe(50);
    expect(overview.bookings.total).toBe(200);
    expect(overview.payments.totalCapturedAmount).toBe(500000);
    expect(overview.refunds.total).toBe(10);
  });
});

describe("User Listing & Moderation Use Cases", () => {
  it("lists users with filters", async () => {
    const s = setup();
    s.adminRepo.users.push(
      makeUserSummary({ id: "u1", primaryRole: "PARENT", status: "ACTIVE", displayName: "Alice" }),
      makeUserSummary({ id: "u2", primaryRole: "TUTOR", status: "ACTIVE", displayName: "Bob" }),
      makeUserSummary({ id: "u3", primaryRole: "PARENT", status: "SUSPENDED", displayName: "Charlie" }),
    );

    const useCase = new ListUsersUseCase(s.adminRepo);
    const all = await useCase.execute({ actorUserId: "admin", query: {} });
    expect(all.data).toHaveLength(3);

    const parents = await useCase.execute({ actorUserId: "admin", query: { role: "PARENT" } });
    expect(parents.data).toHaveLength(2);

    const active = await useCase.execute({ actorUserId: "admin", query: { status: "ACTIVE" } });
    expect(active.data).toHaveLength(2);

    const searched = await useCase.execute({ actorUserId: "admin", query: { search: "alice" } });
    expect(searched.data).toHaveLength(1);
    expect(searched.data[0].id).toBe("u1");

    // Verify audit log was created
    expect(s.adminRepo.auditLogs.length).toBe(4);
    expect(s.adminRepo.auditLogs[0].action).toBe("ADMIN_LIST_USERS");
  });

  it("gets user by id", async () => {
    const s = setup();
    s.adminRepo.users.push(makeUserSummary({ id: "user-1", displayName: "Alice" }));

    const useCase = new GetUserUseCase(s.adminRepo);
    const user = await useCase.execute({ actorUserId: "admin", userId: "user-1" });
    expect(user.displayName).toBe("Alice");
  });

  it("throws AdminResourceNotFoundError for missing user", async () => {
    const s = setup();
    const useCase = new GetUserUseCase(s.adminRepo);
    await expect(useCase.execute({ actorUserId: "admin", userId: "non-existent" })).rejects.toThrow(AdminResourceNotFoundError);
  });

  it("suspends an active user and creates audit log", async () => {
    const s = setup();
    const user = await s.userRepo.create({ primaryRole: "PARENT", email: "test@example.com" });

    const useCase = new SuspendUserUseCase(s.userRepo, s.adminRepo);
    const result = await useCase.execute({ actorUserId: "admin", userId: user.id, reason: "Violation of terms" });

    expect(result.status).toBe("SUSPENDED");

    const updated = await s.userRepo.findById(user.id);
    expect(updated?.status).toBe("SUSPENDED");

    expect(s.adminRepo.auditLogs).toHaveLength(1);
    expect(s.adminRepo.auditLogs[0].action).toBe("ADMIN_SUSPEND_USER");
    expect(s.adminRepo.auditLogs[0].metadata).toMatchObject({ reason: "Violation of terms", previousStatus: "ACTIVE" });
  });

  it("throws error when suspending a deleted user", async () => {
    const s = setup();
    const user = await s.userRepo.create({ primaryRole: "PARENT", email: "test@example.com" });
    await s.userRepo.update(user.id, { status: "DELETED" } as any);

    const useCase = new SuspendUserUseCase(s.userRepo, s.adminRepo);
    await expect(useCase.execute({ actorUserId: "admin", userId: user.id })).rejects.toThrow(InvalidUserStatusTransitionError);
  });

  it("returns existing user when already suspended", async () => {
    const s = setup();
    const user = await s.userRepo.create({ primaryRole: "PARENT", email: "test@example.com" });
    await s.userRepo.update(user.id, { status: "SUSPENDED" } as any);

    const useCase = new SuspendUserUseCase(s.userRepo, s.adminRepo);
    const result = await useCase.execute({ actorUserId: "admin", userId: user.id });

    expect(result.status).toBe("SUSPENDED");
    // No new audit log since no transition
    expect(s.adminRepo.auditLogs).toHaveLength(0);
  });

  it("activates a suspended user", async () => {
    const s = setup();
    const user = await s.userRepo.create({ primaryRole: "PARENT", email: "test@example.com" });
    await s.userRepo.update(user.id, { status: "SUSPENDED" } as any);

    const useCase = new ActivateUserUseCase(s.userRepo, s.adminRepo);
    const result = await useCase.execute({ actorUserId: "admin", userId: user.id });

    expect(result.status).toBe("ACTIVE");
    expect(s.adminRepo.auditLogs).toHaveLength(1);
    expect(s.adminRepo.auditLogs[0].action).toBe("ADMIN_ACTIVATE_USER");
  });

  it("throws AdminResourceNotFoundError when activating non-existent user", async () => {
    const s = setup();
    const useCase = new ActivateUserUseCase(s.userRepo, s.adminRepo);
    await expect(useCase.execute({ actorUserId: "admin", userId: "non-existent" })).rejects.toThrow(AdminResourceNotFoundError);
  });
});

describe("Tutor Listing", () => {
  it("lists tutors with status filter", async () => {
    const s = setup();
    s.adminRepo.tutors.push(
      makeTutorSummary({ id: "t1", status: "ACTIVE" }),
      makeTutorSummary({ id: "t2", status: "PENDING_VERIFICATION" }),
    );

    const useCase = new ListTutorsUseCase(s.adminRepo);
    const all = await useCase.execute({ actorUserId: "admin", query: {} });
    expect(all.data).toHaveLength(2);

    const pending = await useCase.execute({ actorUserId: "admin", query: { status: "PENDING_VERIFICATION" } });
    expect(pending.data).toHaveLength(1);
  });
});

describe("Booking Administration", () => {
  it("lists bookings with filters", async () => {
    const s = setup();
    s.adminRepo.bookings.push(
      makeBookingSummary({ id: "b1", status: "REQUESTED" }),
      makeBookingSummary({ id: "b2", status: "COMPLETED" }),
    );

    const useCase = new ListBookingsUseCase(s.adminRepo);
    const all = await useCase.execute({ actorUserId: "admin", query: {} });
    expect(all.data).toHaveLength(2);

    const completed = await useCase.execute({ actorUserId: "admin", query: { status: "COMPLETED" } });
    expect(completed.data).toHaveLength(1);
  });

  it("gets booking by id", async () => {
    const s = setup();
    s.adminRepo.bookings.push(makeBookingSummary({ id: "booking-1" }));

    const useCase = new AdminGetBookingUseCase(s.adminRepo);
    const booking = await useCase.execute({ actorUserId: "admin", bookingId: "booking-1" });
    expect(booking.id).toBe("booking-1");
  });

  it("throws AdminResourceNotFoundError for missing booking", async () => {
    const s = setup();
    const useCase = new AdminGetBookingUseCase(s.adminRepo);
    await expect(useCase.execute({ actorUserId: "admin", bookingId: "non-existent" })).rejects.toThrow(AdminResourceNotFoundError);
  });

  it("cancels a booking and creates audit log", async () => {
    const s = setup();
    s.bookingRepo.bookings.push({
      id: "booking-1",
      publicId: "pub-booking-1",
      parentId: "parent-1",
      studentId: "student-1",
      tutorId: "tutor-1",
      classType: "REGULAR",
      serviceMode: "ONLINE",
      status: "REQUESTED",
      startAt: new Date("2026-07-20T10:00:00Z"),
      endAt: new Date("2026-07-20T11:00:00Z"),
      timezone: "Asia/Kolkata",
      durationMinutes: 60,
      city: "Mumbai",
      address: null,
      meetingUrl: null,
      priceAmount: "500.00",
      platformFeeAmount: "50.00",
      tutorEarningsAmount: "450.00",
      currency: "INR",
      availabilitySlotId: "slot-1",
      rescheduledFromBookingId: null,
      cancellationReason: null,
      acceptedAt: null,
      rejectedAt: null,
      cancelledAt: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const useCase = new AdminCancelBookingUseCase(s.bookingRepo, s.slotRepo, s.adminRepo, s.clock);
    const result = await useCase.execute({ actorUserId: "admin", bookingId: "booking-1", reason: "Admin override" });

    expect(result.status).toBe("CANCELLED_BY_ADMIN");

    expect(s.adminRepo.auditLogs).toHaveLength(1);
    expect(s.adminRepo.auditLogs[0].action).toBe("ADMIN_CANCEL_BOOKING");
    expect(s.adminRepo.auditLogs[0].metadata?.reason).toBe("Admin override");
    expect(s.adminRepo.auditLogs[0].metadata?.previousStatus).toBe("REQUESTED");
  });

  it("throws error when cancelling a non-cancellable booking", async () => {
    const s = setup();
    const booking = {
      id: "booking-completed",
      status: "COMPLETED",
      parentId: "parent-1",
      tutorId: "tutor-1",
      studentId: "student-1",
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date(),
      endAt: new Date(),
      priceAmount: "500",
      currency: "INR",
      timezone: "Asia/Kolkata",
      durationMinutes: 60,
      publicId: "pub-booking-completed",
      platformFeeAmount: "50",
      tutorEarningsAmount: "450",
      availabilitySlotId: null,
      rescheduledFromBookingId: null,
      cancellationReason: null,
      acceptedAt: null,
      rejectedAt: null,
      cancelledAt: null,
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      city: null,
      address: null,
      meetingUrl: null,
    };
    s.bookingRepo.bookings.push(booking as any);

    const useCase = new AdminCancelBookingUseCase(s.bookingRepo, s.slotRepo, s.adminRepo, s.clock);
    await expect(useCase.execute({ actorUserId: "admin", bookingId: "booking-completed" })).rejects.toThrow(InvalidUserStatusTransitionError);
  });
});

describe("Payment Administration", () => {
  it("lists payments with filters", async () => {
    const s = setup();
    s.adminRepo.payments.push(
      { id: "p1", bookingId: "b1", parentId: "par1", provider: "RAZORPAY", status: "CAPTURED", amount: 50000, currency: "INR", createdAt: new Date() },
      { id: "p2", bookingId: "b2", parentId: "par2", provider: "RAZORPAY", status: "PENDING", amount: 25000, currency: "INR", createdAt: new Date() },
    );

    const useCase = new ListPaymentsUseCase(s.adminRepo);
    const all = await useCase.execute({ actorUserId: "admin", query: {} });
    expect(all.data).toHaveLength(2);

    const captured = await useCase.execute({ actorUserId: "admin", query: { status: "CAPTURED" } });
    expect(captured.data).toHaveLength(1);
    expect(captured.data[0].id).toBe("p1");
  });
});

describe("Refund Administration", () => {
  it("lists refunds with filters", async () => {
    const s = setup();
    s.adminRepo.refunds.push(
      { id: "r1", paymentId: "p1", bookingId: "b1", status: "PROCESSED", amount: 50000, currency: "INR", reason: null, requestedByUserId: "admin", createdAt: new Date() },
      { id: "r2", paymentId: "p2", bookingId: "b2", status: "REQUESTED", amount: 10000, currency: "INR", reason: null, requestedByUserId: "admin", createdAt: new Date() },
    );

    const useCase = new AdminListRefundsUseCase(s.adminRepo);
    const all = await useCase.execute({ actorUserId: "admin", query: {} });
    expect(all.data).toHaveLength(2);

    const processed = await useCase.execute({ actorUserId: "admin", query: { status: "PROCESSED" } });
    expect(processed.data).toHaveLength(1);
    expect(processed.data[0].id).toBe("r1");
  });
});

describe("Audit Log Use Cases", () => {
  it("lists audit logs with filters", async () => {
    const s = setup();
    const now = new Date();
    s.adminRepo.auditLogs.push(
      { id: "a1", actorUserId: "admin-1", action: "ADMIN_SUSPEND_USER", entityType: "User", entityId: "u1", ipAddress: null, userAgent: null, metadata: null, createdAt: now },
      { id: "a2", actorUserId: "admin-1", action: "ADMIN_LIST_USERS", entityType: "User", entityId: null, ipAddress: null, userAgent: null, metadata: null, createdAt: now },
      { id: "a3", actorUserId: "admin-2", action: "ADMIN_CANCEL_BOOKING", entityType: "Booking", entityId: "b1", ipAddress: null, userAgent: null, metadata: null, createdAt: now },
    );

    const useCase = new ListAuditLogsUseCase(s.adminRepo);
    const all = await useCase.execute({ actorUserId: "admin", query: {} });
    expect(all.data).toHaveLength(3);

    const userLogs = await useCase.execute({ actorUserId: "admin", query: { entityType: "Booking" } });
    expect(userLogs.data).toHaveLength(1);

    const suspendLogs = await useCase.execute({ actorUserId: "admin", query: { action: "ADMIN_SUSPEND_USER" } });
    expect(suspendLogs.data).toHaveLength(1);
  });
});