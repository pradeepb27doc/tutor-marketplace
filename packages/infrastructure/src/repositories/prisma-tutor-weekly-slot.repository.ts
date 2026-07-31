import type {
  TutorWeeklySlotRecord,
  TutorWeeklySlotRepository,
  CreateTutorWeeklySlotRecord,
  UpdateTutorWeeklySlotRecord,
  DayOfWeekValue,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaTutorWeeklySlotRepository implements TutorWeeklySlotRepository {
  private get db() {
    return getPrismaClient();
  }

  async findByTutorId(tutorId: string): Promise<TutorWeeklySlotRecord[]> {
    const records: any[] = await this.db.tutorWeeklySlot.findMany({
      where: { tutorId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    return records.map((r: any) => this.toRecord(r));
  }

  async findById(id: string): Promise<TutorWeeklySlotRecord | null> {
    const record: any = await this.db.tutorWeeklySlot.findUnique({ where: { id } });
    return record ? this.toRecord(record) : null;
  }

  async findOverlapping(
    tutorId: string,
    dayOfWeek: DayOfWeekValue,
    serviceMode: string,
    excludeSlotId?: string,
  ): Promise<TutorWeeklySlotRecord[]> {
    const records: any[] = await this.db.tutorWeeklySlot.findMany({
      where: {
        tutorId,
        dayOfWeek,
        serviceMode: serviceMode as any,
        ...(excludeSlotId ? { id: { not: excludeSlotId } } : {}),
      },
    });
    return records.map((r: any) => this.toRecord(r));
  }

  async create(data: CreateTutorWeeklySlotRecord): Promise<TutorWeeklySlotRecord> {
    const record: any = await this.db.tutorWeeklySlot.create({
      data: {
        tutorId: data.tutorId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        timezone: data.timezone ?? "Asia/Kolkata",
        serviceMode: data.serviceMode as any,
        capacity: data.capacity ?? 1,
      },
    });
    return this.toRecord(record);
  }

  async update(id: string, data: UpdateTutorWeeklySlotRecord): Promise<TutorWeeklySlotRecord> {
    const record: any = await this.db.tutorWeeklySlot.update({
      where: { id },
      data: {
        ...(data.dayOfWeek ? { dayOfWeek: data.dayOfWeek } : {}),
        ...(data.startTime ? { startTime: data.startTime } : {}),
        ...(data.endTime ? { endTime: data.endTime } : {}),
        ...(data.timezone ? { timezone: data.timezone } : {}),
        ...(data.serviceMode ? { serviceMode: data.serviceMode as any } : {}),
        ...(typeof data.capacity === "number" ? { capacity: data.capacity } : {}),
      },
    });
    return this.toRecord(record);
  }

  async delete(id: string): Promise<void> {
    await this.db.tutorWeeklySlot.delete({ where: { id } });
  }

  private toRecord(record: any): TutorWeeklySlotRecord {
    return {
      id: record.id,
      tutorId: record.tutorId,
      dayOfWeek: record.dayOfWeek,
      startTime: record.startTime,
      endTime: record.endTime,
      timezone: record.timezone,
      serviceMode: record.serviceMode,
      capacity: record.capacity,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}