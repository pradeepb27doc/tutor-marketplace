 import type { UseCase, Clock } from "../index.js";
import type {
  AdminRepository,
  AdminListQuery,
  AdminAuditLogQuery,
} from "./admin.repository.js";
import type {
  AdminListUsersQuery,
  AdminListTutorsQuery,
  AdminListBookingsQuery,
  AdminListPaymentsQuery,
  AdminListRefundsQuery,
  AdminListAuditLogsQuery,
} from "./admin.dtos.js";
import type { UserRepository } from "../index.js";
import type { BookingRepository, TutorAvailabilitySlotRepository } from "../bookings/index.js";

// --- Errors ---

export class AdminResourceNotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`);
    this.name = "AdminResourceNotFoundError";
  }
}

export class InvalidUserStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Cannot transition user status from ${from} to ${to}`);
    this.name = "InvalidUserStatusTransitionError";
  }
}

// --- User listing / detail ---

export class ListUsersUseCase
  implements UseCase<{ actorUserId: string; query: AdminListUsersQuery }, any>
{
  constructor(private readonly adminRepo: AdminRepository) {}

  async execute(input: { actorUserId: string; query: AdminListUsersQuery }): Promise<any> {
    const query: AdminListQuery = {
      cursor: input.query.cursor ?? null,
      limit: input.query.limit,
      status: input.query.status,
      role: input.query.role,
      search: input.query.search,
    };
    const result = await this.adminRepo.listUsers(query);
    await this.adminRepo.createAuditLog({
      actorUserId: input.actorUserId,
      action: "ADMIN_LIST_USERS",
      entityType: "User",
    });
    return result;
  }
}

export class GetUserUseCase
  implements UseCase<{ actorUserId: string; userId: string }, any>
{
  constructor(private readonly adminRepo: AdminRepository) {}

  async execute(input: { actorUserId: string; userId: string }): Promise<any> {
    const user = await this.adminRepo.getUserById(input.userId);
    if (!user) throw new AdminResourceNotFoundError("User", input.userId);
    return user;
  }
}

// --- Suspend / Activate (reuse UserRepository + audit) ---

export class SuspendUserUseCase
  implements UseCase<{ actorUserId: string; userId: string; reason?: string }, any>
{
  constructor(
    private readonly userRepo: UserRepository,
    private readonly adminRepo: AdminRepository,
  ) {}

  async execute(input: { actorUserId: string; userId: string; reason?: string }): Promise<any> {
    const user = await this.userRepo.findById(input.userId);
    if (!user) throw new AdminResourceNotFoundError("User", input.userId);
    if (user.status === "SUSPENDED") return user;
    if (user.status === "DELETED") {
      throw new InvalidUserStatusTransitionError(user.status, "SUSPENDED");
    }
    const updated = await this.userRepo.update(input.userId, { status: "SUSPENDED" });
    await this.adminRepo.createAuditLog({
      actorUserId: input.actorUserId,
      action: "ADMIN_SUSPEND_USER",
      entityType: "User",
      entityId: input.userId,
      metadata: { reason: input.reason ?? null, previousStatus: user.status },
    });
    return updated;
  }
}

export class ActivateUserUseCase
  implements UseCase<{ actorUserId: string; userId: string }, any>
{
  constructor(
    private readonly userRepo: UserRepository,
    private readonly adminRepo: AdminRepository,
  ) {}

  async execute(input: { actorUserId: string; userId: string }): Promise<any> {
    const user = await this.userRepo.findById(input.userId);
    if (!user) throw new AdminResourceNotFoundError("User", input.userId);
    if (user.status === "ACTIVE") return user;
    const updated = await this.userRepo.update(input.userId, { status: "ACTIVE" });
    await this.adminRepo.createAuditLog({
      actorUserId: input.actorUserId,
      action: "ADMIN_ACTIVATE_USER",
      entityType: "User",
      entityId: input.userId,
      metadata: { previousStatus: user.status },
    });
    return updated;
  }
}

// --- Tutor listing ---

export class ListTutorsUseCase
  implements UseCase<{ actorUserId: string; query: AdminListTutorsQuery }, any>
{
  constructor(private readonly adminRepo: AdminRepository) {}

  async execute(input: { actorUserId: string; query: AdminListTutorsQuery }): Promise<any> {
    const query: AdminListQuery = {
      cursor: input.query.cursor ?? null,
      limit: input.query.limit,
      status: input.query.status,
      search: input.query.search,
    };
    return this.adminRepo.listTutors(query);
  }
}

// --- Booking listing / detail / admin cancel ---

export class ListBookingsUseCase
  implements UseCase<{ actorUserId: string; query: AdminListBookingsQuery }, any>
{
  constructor(private readonly adminRepo: AdminRepository) {}

  async execute(input: { actorUserId: string; query: AdminListBookingsQuery }): Promise<any> {
    const query: AdminListQuery = {
      cursor: input.query.cursor ?? null,
      limit: input.query.limit,
      status: input.query.status,
    };
    return this.adminRepo.listBookings(query);
  }
}

export class AdminGetBookingUseCase
  implements UseCase<{ actorUserId: string; bookingId: string }, any>
{
  constructor(private readonly adminRepo: AdminRepository) {}

  async execute(input: { actorUserId: string; bookingId: string }): Promise<any> {
    const booking = await this.adminRepo.getBookingById(input.bookingId);
    if (!booking) throw new AdminResourceNotFoundError("Booking", input.bookingId);
    return booking;
  }
}

export class AdminCancelBookingUseCase
  implements UseCase<{ actorUserId: string; bookingId: string; reason?: string }, any>
{
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly slotRepo: TutorAvailabilitySlotRepository,
    private readonly adminRepo: AdminRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: { actorUserId: string; bookingId: string; reason?: string }): Promise<any> {
    const booking = await this.bookingRepo.findById(input.bookingId);
    if (!booking) throw new AdminResourceNotFoundError("Booking", input.bookingId);

    const cancellableStatuses = ["REQUESTED", "ACCEPTED", "SCHEDULED", "IN_PROGRESS"];
    if (!cancellableStatuses.includes(booking.status)) {
      throw new InvalidUserStatusTransitionError(booking.status, "CANCELLED_BY_ADMIN");
    }

    const previousStatus = booking.status;

    // Release slot if applicable
    if (booking.availabilitySlotId) {
      await this.slotRepo.releaseSlot(booking.availabilitySlotId);
    }

    const updated = await this.bookingRepo.updateStatus(
      input.bookingId,
      "CANCELLED_BY_ADMIN",
      input.actorUserId,
      input.reason,
    );

    await this.bookingRepo.addStatusHistory({
      bookingId: input.bookingId,
      fromStatus: previousStatus,
      toStatus: "CANCELLED_BY_ADMIN",
      changedByUserId: input.actorUserId,
      reason: input.reason ?? null,
    });

    await this.adminRepo.createAuditLog({
      actorUserId: input.actorUserId,
      action: "ADMIN_CANCEL_BOOKING",
      entityType: "Booking",
      entityId: input.bookingId,
      metadata: { reason: input.reason ?? null, previousStatus },
    });

    return updated;
  }
}

// --- Payments / refunds / overview / audit ---

export class ListPaymentsUseCase
  implements UseCase<{ actorUserId: string; query: AdminListPaymentsQuery }, any>
{
  constructor(private readonly adminRepo: AdminRepository) {}

  async execute(input: { actorUserId: string; query: AdminListPaymentsQuery }): Promise<any> {
    const query: AdminListQuery = {
      cursor: input.query.cursor ?? null,
      limit: input.query.limit,
      status: input.query.status,
    };
    return this.adminRepo.listPayments(query);
  }
}

export class AdminListRefundsUseCase
  implements UseCase<{ actorUserId: string; query: AdminListRefundsQuery }, any>
{
  constructor(private readonly adminRepo: AdminRepository) {}

  async execute(input: { actorUserId: string; query: AdminListRefundsQuery }): Promise<any> {
    const query: AdminListQuery = {
      cursor: input.query.cursor ?? null,
      limit: input.query.limit,
      status: input.query.status,
    };
    return this.adminRepo.listRefunds(query);
  }
}

export class GetAdminOverviewUseCase
  implements UseCase<{ actorUserId: string }, any>
{
  constructor(private readonly adminRepo: AdminRepository) {}

  async execute(input: { actorUserId: string }): Promise<any> {
    return this.adminRepo.getOverview();
  }
}

export class ListAuditLogsUseCase
  implements UseCase<{ actorUserId: string; query: AdminListAuditLogsQuery }, any>
{
  constructor(private readonly adminRepo: AdminRepository) {}

  async execute(input: { actorUserId: string; query: AdminListAuditLogsQuery }): Promise<any> {
    const query: AdminAuditLogQuery = {
      cursor: input.query.cursor ?? null,
      limit: input.query.limit,
      entityType: input.query.entityType,
      action: input.query.action,
    };
    return this.adminRepo.listAuditLogs(query);
  }
}