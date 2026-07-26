import type {
  TutorBreakPeriodRecord,
  TutorBreakPeriodRepository,
  CreateTutorBreakPeriodRecord,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaTutorBreakPeriodRepository implements TutorBreakPeriodRepository {
  private get db() {
    return getPrismaClient();
  }

  async findByTutorId(tutorId: string): Promise<TutorBreakPeriodRecord[]> {
    const records: any[] = await this.db.tutorBreakPeriod.findMany({
      where: { tutorId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    return records.map((r: any) => this.toRecord(r));
  }

  async create(data: CreateTutorBreakPeriodRecord): Promise<TutorBreakPeriodRecord> {
    const record: any = await this.db.tutorBreakPeriod.create({
      data: {
        tutorId: data.tutorId,
        dayOfWeek: data.dayOfWeek ?? null,
        startTime: data.startTime,
        endTime: data.endTime,
        reason: data.reason ?? null,
      },
    });
    return this.toRecord(record);
  }

  async delete(id: string): Promise<void> {
    await this.db.tutorBreakPeriod.delete({ where: { id } });
  }

  private toRecord(record: any): TutorBreakPeriodRecord {
    return {
      id: record.id,
      tutorId: record.tutorId,
      dayOfWeek: record.dayOfWeek,
      startTime: record.startTime,
      endTime: record.endTime,
      reason: record.reason,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}