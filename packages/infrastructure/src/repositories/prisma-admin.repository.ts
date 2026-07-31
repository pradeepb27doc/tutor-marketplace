import type {
  AdminRepository,
  AdminUserSummary,
  AdminTutorSummary,
  AdminBookingSummary,
  AdminPaymentSummary,
  AdminRefundSummary,
  AuditLogRecord,
  AdminListQuery,
  AdminAuditLogQuery,
  CursorPage,
  CreateAuditLogInput,
  AdminOverview,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

type PrismaTransaction = ReturnType<typeof getPrismaClient>;

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class PrismaAdminRepository implements AdminRepository {
  private get db(): PrismaTransaction {
    return getPrismaClient();
  }

  private parseLimit(limit?: number): number {
    const l = limit ?? DEFAULT_LIMIT;
    return Math.min(Math.max(l, 1), MAX_LIMIT);
  }

  // --- Users ---

  async listUsers(query: AdminListQuery): Promise<CursorPage<AdminUserSummary>> {
    return this.paginate<AdminUserSummary>(query, async (cursor) => {
      const where: any = {};
      if (query.status) where.status = query.status as any;
      if (query.role) where.primaryRole = query.role as any;
      if (query.search) {
        where.OR = [
          { displayName: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
          { phone: { contains: query.search } },
        ];
      }
      const records: any[] = await this.db.user.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: this.parseLimit(query.limit) + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      return records.map((r) => this.toUserSummary(r));
    });
  }

  async getUserById(id: string): Promise<AdminUserSummary | null> {
    const user: any = await this.db.user.findUnique({ where: { id } });
    return user ? this.toUserSummary(user) : null;
  }

  // --- Tutors ---

  async listTutors(query: AdminListQuery): Promise<CursorPage<AdminTutorSummary>> {
    return this.paginate<AdminTutorSummary>(query, async (cursor) => {
      const where: any = {};
      if (query.status) where.status = query.status as any;
      if (query.search) {
        where.OR = [
          { headline: { contains: query.search, mode: "insensitive" } },
          { city: { contains: query.search, mode: "insensitive" } },
        ];
      }
      const records: any[] = await this.db.tutor.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: this.parseLimit(query.limit) + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      return records.map((r) => this.toTutorSummary(r));
    });
  }

  // --- Bookings ---

  async listBookings(query: AdminListQuery): Promise<CursorPage<AdminBookingSummary>> {
    return this.paginate<AdminBookingSummary>(query, async (cursor) => {
      const where: any = {};
      if (query.status) where.status = query.status as any;
      const records: any[] = await this.db.booking.findMany({
        where,
        orderBy: [{ startAt: "desc" }, { id: "desc" }],
        take: this.parseLimit(query.limit) + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      return records.map((r) => this.toBookingSummary(r));
    });
  }

  async getBookingById(id: string): Promise<AdminBookingSummary | null> {
    const booking: any = await this.db.booking.findUnique({ where: { id } });
    return booking ? this.toBookingSummary(booking) : null;
  }

  // --- Payments ---

  async listPayments(query: AdminListQuery): Promise<CursorPage<AdminPaymentSummary>> {
    return this.paginate<AdminPaymentSummary>(query, async (cursor) => {
      const where: any = {};
      if (query.status) where.status = query.status as any;
      const records: any[] = await this.db.payment.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: this.parseLimit(query.limit) + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      return records.map((r) => this.toPaymentSummary(r));
    });
  }

  // --- Refunds ---

  async listRefunds(query: AdminListQuery): Promise<CursorPage<AdminRefundSummary>> {
    return this.paginate<AdminRefundSummary>(query, async (cursor) => {
      const where: any = {};
      if (query.status) where.status = query.status as any;
      const records: any[] = await this.db.refund.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: this.parseLimit(query.limit) + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      return records.map((r) => this.toRefundSummary(r));
    });
  }

  // --- Overview ---

  async getOverview(): Promise<AdminOverview> {
    const [userStatuses, tutorStatuses, bookingStatuses, payments, refunds, usersTotal, tutorsTotal] =
      await Promise.all([
        this.groupByStatus("user"),
        this.groupByStatus("tutor"),
        this.groupByStatus("booking"),
        this.db.payment.aggregate({ _sum: { amount: true }, where: { status: "CAPTURED" as any } }),
        this.db.refund.count(),
        this.db.user.count(),
        this.db.tutor.count(),
      ]);

    return {
      users: { total: usersTotal, byStatus: userStatuses },
      tutors: { total: tutorsTotal, byStatus: tutorStatuses },
      bookings: { total: 0, byStatus: bookingStatuses },
      payments: {
        total: 0,
        totalCapturedAmount: payments._sum.amount != null ? Number(payments._sum.amount) : 0,
      },
      refunds: { total: refunds },
    };
  }

  // --- Audit logs ---

  async listAuditLogs(query: AdminAuditLogQuery): Promise<CursorPage<AuditLogRecord>> {
    return this.paginate<AuditLogRecord>(query, async (cursor) => {
      const where: any = {};
      if (query.entityType) where.entityType = query.entityType;
      if (query.action) where.action = query.action;
      const records: any[] = await this.db.auditLog.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: this.parseLimit(query.limit) + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      return records.map((r) => this.toAuditLog(r));
    });
  }

  async createAuditLog(input: CreateAuditLogInput): Promise<AuditLogRecord> {
    const record: any = await this.db.auditLog.create({
      data: {
        actorUserId: input.actorUserId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        metadata: input.metadata ?? undefined,
      },
    });
    return this.toAuditLog(record);
  }

  // --- Internal helpers ---

  private async paginate<T>(
    query: AdminListQuery,
    fetcher: (cursor: string | null) => Promise<T[]>,
  ): Promise<CursorPage<T>> {
    const limit = this.parseLimit(query.limit);
    const records = await fetcher(query.cursor ?? null);
    const hasMore = records.length > limit;
    const data = hasMore ? records.slice(0, limit) : records;
    const nextCursor = hasMore && data.length > 0 ? (data[data.length - 1] as any).id : null;
    return {
      data,
      page: { nextCursor, limit, hasMore },
    };
  }

  private async groupByStatus(model: "user" | "tutor" | "booking"): Promise<Record<string, number>> {
    const db: any = this.db;
    const result: any[] =
      model === "user"
        ? await db.user.groupBy({ by: ["status"], _count: { _all: true } })
        : model === "tutor"
          ? await db.tutor.groupBy({ by: ["status"], _count: { _all: true } })
          : await db.booking.groupBy({ by: ["status"], _count: { _all: true } });
    const map: Record<string, number> = {};
    for (const row of result) {
      map[row.status as string] = row._count._all;
    }
    return map;
  }

  private toUserSummary(r: any): AdminUserSummary {
    return {
      id: r.id,
      publicId: r.publicId,
      displayName: r.displayName ?? null,
      primaryRole: r.primaryRole,
      status: r.status,
      email: r.email ?? null,
      phone: r.phone ?? null,
      createdAt: r.createdAt,
    };
  }

  private toTutorSummary(r: any): AdminTutorSummary {
    return {
      id: r.id,
      userId: r.userId,
      status: r.status,
      headline: r.headline ?? null,
      city: r.city ?? null,
      experienceYears: r.experienceYears,
      averageRating: String(r.averageRating ?? "0"),
      createdAt: r.createdAt,
    };
  }

  private toBookingSummary(r: any): AdminBookingSummary {
    return {
      id: r.id,
      publicId: r.publicId,
      parentId: r.parentId,
      studentId: r.studentId,
      tutorId: r.tutorId,
      classType: r.classType,
      serviceMode: r.serviceMode,
      status: r.status,
      startAt: r.startAt,
      endAt: r.endAt,
      priceAmount: String(r.priceAmount ?? "0"),
      currency: r.currency,
    };
  }

  private toPaymentSummary(r: any): AdminPaymentSummary {
    return {
      id: r.id,
      bookingId: r.bookingId,
      parentId: r.parentId,
      provider: r.provider,
      status: r.status,
      amount: r.amount != null ? Number(r.amount) : 0,
      currency: r.currency,
      createdAt: r.createdAt,
    };
  }

  private toRefundSummary(r: any): AdminRefundSummary {
    return {
      id: r.id,
      paymentId: r.paymentId,
      bookingId: r.bookingId,
      status: r.status,
      amount: r.amount != null ? Number(r.amount) : 0,
      currency: r.currency,
      reason: r.reason ?? null,
      requestedByUserId: r.requestedByUserId ?? null,
      createdAt: r.createdAt,
    };
  }

  private toAuditLog(r: any): AuditLogRecord {
    return {
      id: r.id,
      actorUserId: r.actorUserId ?? null,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId ?? null,
      ipAddress: r.ipAddress ?? null,
      userAgent: r.userAgent ?? null,
      metadata: r.metadata ?? null,
      createdAt: r.createdAt,
    };
  }
}