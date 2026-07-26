import type {
  TutorAvailabilitySlotRecord,
  TutorAvailabilitySlotRepository,
  CreateConcreteSlotRecord,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaTutorAvailabilitySlotRepository implements TutorAvailabilitySlotRepository {
  private get db() {
    return getPrismaClient();
  }

  async findById(id: string): Promise<TutorAvailabilitySlotRecord | null> {
    const record: any = await this.db.tutorAvailabilitySlot.findUnique({ where: { id } });
    return record ? this.toRecord(record) : null;
  }

  async findAvailableById(id: string): Promise<TutorAvailabilitySlotRecord | null> {
    const record: any = await this.db.tutorAvailabilitySlot.findFirst({
      where: {
        id,
        status: "AVAILABLE",
        AND: [
          { startAt: { gt: new Date() } },
        ],
      },
    });
    return record ? this.toRecord(record) : null;
  }

  async reserveSlot(id: string, reservedByParentId: string, reservedUntil: Date): Promise<void> {
    await this.db.tutorAvailabilitySlot.update({
      where: { id },
      data: {
        status: "RESERVED",
        reservedByParentId,
        reservedUntil,
      },
    });
  }

  async markAsBooked(id: string): Promise<void> {
    await this.db.tutorAvailabilitySlot.update({
      where: { id },
      data: {
        status: "BOOKED",
      },
    });
  }

  async releaseSlot(id: string): Promise<void> {
    await this.db.tutorAvailabilitySlot.update({
      where: { id },
      data: {
        status: "AVAILABLE",
        reservedByParentId: null,
        reservedUntil: null,
      },
    });
  }

  async markAsExpired(id: string): Promise<void> {
    await this.db.tutorAvailabilitySlot.update({
      where: { id },
      data: {
        status: "EXPIRED",
      },
    });
  }

  async createConcreteSlot(data: CreateConcreteSlotRecord): Promise<TutorAvailabilitySlotRecord> {
    const record: any = await this.db.tutorAvailabilitySlot.create({
      data: {
        tutorId: data.tutorId,
        startAt: data.startAt,
        endAt: data.endAt,
        timezone: data.timezone ?? "Asia/Kolkata",
        status: "AVAILABLE",
        serviceMode: data.serviceMode as any,
        capacity: data.capacity ?? 1,
      },
    });
    return this.toRecord(record);
  }

  private toRecord(record: any): TutorAvailabilitySlotRecord {
    return {
      id: record.id,
      tutorId: record.tutorId,
      startAt: record.startAt,
      endAt: record.endAt,
      timezone: record.timezone,
      status: record.status,
      serviceMode: record.serviceMode,
      capacity: record.capacity,
      reservedUntil: record.reservedUntil ?? null,
      reservedByParentId: record.reservedByParentId ?? null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}