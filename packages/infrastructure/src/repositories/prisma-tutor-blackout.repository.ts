import type {
  TutorBlackoutPeriodRecord,
  TutorBlackoutPeriodRepository,
  CreateTutorBlackoutPeriodRecord,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaTutorBlackoutRepository implements TutorBlackoutPeriodRepository {
  private get db() {
    return getPrismaClient();
  }

  async findByTutorId(tutorId: string): Promise<TutorBlackoutPeriodRecord[]> {
    const records: any[] = await this.db.tutorBlackoutPeriod.findMany({
      where: { tutorId },
      orderBy: { startAt: "asc" },
    });
    return records.map((r: any) => this.toRecord(r));
  }

  async findById(id: string): Promise<TutorBlackoutPeriodRecord | null> {
    const record: any = await this.db.tutorBlackoutPeriod.findUnique({ where: { id } });
    return record ? this.toRecord(record) : null;
  }

  async create(data: CreateTutorBlackoutPeriodRecord): Promise<TutorBlackoutPeriodRecord> {
    const record: any = await this.db.tutorBlackoutPeriod.create({
      data: {
        tutorId: data.tutorId,
        startAt: data.startAt,
        endAt: data.endAt,
        reason: data.reason ?? null,
      },
    });
    return this.toRecord(record);
  }

  async delete(id: string): Promise<void> {
    await this.db.tutorBlackoutPeriod.delete({ where: { id } });
  }

  private toRecord(record: any): TutorBlackoutPeriodRecord {
    return {
      id: record.id,
      tutorId: record.tutorId,
      startAt: record.startAt,
      endAt: record.endAt,
      reason: record.reason,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}