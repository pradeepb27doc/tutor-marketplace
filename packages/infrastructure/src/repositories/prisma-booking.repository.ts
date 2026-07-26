import type {
  BookingRecord,
  BookingRepository,
  CreateBookingRecord,
  StatusHistoryRecord,
  CreateStatusHistoryRecord,
  BookingQueryOptions,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaBookingRepository implements BookingRepository {
  private get db() {
    return getPrismaClient();
  }

  async findById(id: string): Promise<BookingRecord | null> {
    const record: any = await this.db.booking.findUnique({ where: { id } });
    return record ? this.toRecord(record) : null;
  }

  async findByPublicId(publicId: string): Promise<BookingRecord | null> {
    const record: any = await this.db.booking.findUnique({ where: { publicId } });
    return record ? this.toRecord(record) : null;
  }

  async findByParentId(parentId: string, opts?: BookingQueryOptions): Promise<BookingRecord[]> {
    const where: any = { parentId };
    if (opts?.status) where.status = opts.status;
    if (opts?.from || opts?.to) {
      where.startAt = {};
      if (opts?.from) where.startAt.gte = opts.from;
      if (opts?.to) where.startAt.lte = opts.to;
    }
    const records: any[] = await this.db.booking.findMany({
      where,
      orderBy: { startAt: "desc" },
      take: opts?.limit,
      skip: opts?.offset,
    });
    return records.map((r: any) => this.toRecord(r));
  }

  async findByTutorId(tutorId: string, opts?: BookingQueryOptions): Promise<BookingRecord[]> {
    const where: any = { tutorId };
    if (opts?.status) where.status = opts.status;
    if (opts?.from || opts?.to) {
      where.startAt = {};
      if (opts?.from) where.startAt.gte = opts.from;
      if (opts?.to) where.startAt.lte = opts.to;
    }
    const records: any[] = await this.db.booking.findMany({
      where,
      orderBy: { startAt: "desc" },
      take: opts?.limit,
      skip: opts?.offset,
    });
    return records.map((r: any) => this.toRecord(r));
  }

  async findByTutorIdAndTimeRange(tutorId: string, startAt: Date, endAt: Date): Promise<BookingRecord[]> {
    const records: any[] = await this.db.booking.findMany({
      where: {
        tutorId,
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        status: { in: ["REQUESTED", "ACCEPTED"] },
      },
    });
    return records.map((r: any) => this.toRecord(r));
  }

  async findBySlotId(slotId: string): Promise<BookingRecord | null> {
    const record: any = await this.db.booking.findUnique({ where: { availabilitySlotId: slotId } });
    return record ? this.toRecord(record) : null;
  }

  async findOverlapping(
    tutorId: string,
    startAt: Date,
    endAt: Date,
    excludeBookingId?: string,
  ): Promise<BookingRecord[]> {
    const where: any = {
      tutorId,
      startAt: { lt: endAt },
      endAt: { gt: startAt },
      status: { in: ["REQUESTED", "ACCEPTED"] },
    };
    if (excludeBookingId) {
      where.id = { not: excludeBookingId };
    }
    const records: any[] = await this.db.booking.findMany({ where });
    return records.map((r: any) => this.toRecord(r));
  }

  async create(data: CreateBookingRecord): Promise<BookingRecord> {
    const record: any = await this.db.booking.create({
      data: {
        parentId: data.parentId,
        studentId: data.studentId,
        tutorId: data.tutorId,
        subjectId: data.subjectId,
        tutorSubjectId: data.tutorSubjectId ?? null,
        availabilitySlotId: data.availabilitySlotId ?? null,
        classType: (data.classType ?? "REGULAR") as any,
        serviceMode: data.serviceMode as any,
        startAt: data.startAt,
        endAt: data.endAt,
        timezone: data.timezone ?? "Asia/Kolkata",
        durationMinutes: data.durationMinutes,
        city: data.city ?? null,
        address: data.address ?? undefined,
        priceAmount: data.priceAmount,
        platformFeeAmount: data.platformFeeAmount ?? "0",
        tutorEarningsAmount: data.tutorEarningsAmount ?? "0",
        currency: data.currency ?? "INR",
        rescheduledFromBookingId: data.rescheduledFromBookingId ?? null,
        status: "REQUESTED" as any,
      },
    });
    return this.toRecord(record);
  }

  async updateStatus(
    id: string,
    status: string,
    changedByUserId?: string | null,
    reason?: string | null,
  ): Promise<BookingRecord> {
    const updateData: any = {
      status: status as any,
      cancellationReason: reason ?? null,
    };

    // Set timestamp fields based on status
    if (status === "ACCEPTED") updateData.acceptedAt = new Date();
    if (status === "REJECTED") updateData.rejectedAt = new Date();
    if (status === "CANCELLED_BY_PARENT" || status === "CANCELLED_BY_TUTOR") updateData.cancelledAt = new Date();
    if (status === "COMPLETED") updateData.completedAt = new Date();

    const record: any = await this.db.booking.update({
      where: { id },
      data: updateData,
    });
    return this.toRecord(record);
  }

  async addStatusHistory(entry: CreateStatusHistoryRecord): Promise<void> {
    await this.db.bookingStatusHistory.create({
      data: {
        bookingId: entry.bookingId,
        fromStatus: entry.fromStatus as any,
        toStatus: entry.toStatus as any,
        changedByUserId: entry.changedByUserId ?? null,
        reason: entry.reason ?? null,
        metadata: entry.metadata ?? undefined,
      },
    });
  }

  async countByTutorIdAndStatus(tutorId: string, status: string): Promise<number> {
    return this.db.booking.count({
      where: { tutorId, status: status as any },
    });
  }

  private toRecord(record: any): BookingRecord {
    return {
      id: record.id,
      publicId: record.publicId,
      parentId: record.parentId,
      studentId: record.studentId,
      tutorId: record.tutorId,
      subjectId: record.subjectId,
      tutorSubjectId: record.tutorSubjectId,
      availabilitySlotId: record.availabilitySlotId,
      classType: record.classType,
      serviceMode: record.serviceMode,
      status: record.status,
      startAt: record.startAt,
      endAt: record.endAt,
      timezone: record.timezone,
      durationMinutes: record.durationMinutes,
      city: record.city,
      address: record.address ?? null,
      meetingUrl: record.meetingUrl ?? null,
      priceAmount: record.priceAmount?.toString() ?? "0",
      platformFeeAmount: record.platformFeeAmount?.toString() ?? "0",
      tutorEarningsAmount: record.tutorEarningsAmount?.toString() ?? "0",
      currency: record.currency,
      cancellationReason: record.cancellationReason ?? null,
      rescheduledFromBookingId: record.rescheduledFromBookingId ?? null,
      acceptedAt: record.acceptedAt ?? null,
      rejectedAt: record.rejectedAt ?? null,
      cancelledAt: record.cancelledAt ?? null,
      completedAt: record.completedAt ?? null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}