import type {
  TutorQualificationRecord,
  TutorQualificationRepository,
  CreateTutorQualificationRecord,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaTutorQualificationRepository implements TutorQualificationRepository {
  private get db() {
    return getPrismaClient();
  }

  async findByTutorId(tutorId: string): Promise<TutorQualificationRecord[]> {
    const records: any[] = await this.db.tutorQualification.findMany({
      where: { tutorId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r: any) => this.toRecord(r));
  }

  async findById(id: string): Promise<TutorQualificationRecord | null> {
    const record: any = await this.db.tutorQualification.findUnique({ where: { id } });
    if (!record) return null;
    return this.toRecord(record);
  }

  async create(data: CreateTutorQualificationRecord): Promise<TutorQualificationRecord> {
    const record: any = await this.db.tutorQualification.create({
      data: {
        tutorId: data.tutorId,
        title: data.title,
        institutionName: data.institutionName ?? undefined,
        completionYear: data.completionYear ?? undefined,
      },
    });
    return this.toRecord(record);
  }

  async update(id: string, data: Partial<TutorQualificationRecord>): Promise<TutorQualificationRecord> {
    const record: any = await this.db.tutorQualification.update({
      where: { id },
      data: {
        title: data.title ?? undefined,
        institutionName: data.institutionName ?? undefined,
        completionYear: data.completionYear ?? undefined,
      },
    });
    return this.toRecord(record);
  }

  async delete(id: string): Promise<void> {
    await this.db.tutorQualification.delete({ where: { id } });
  }

  private toRecord(record: any): TutorQualificationRecord {
    return {
      id: record.id,
      tutorId: record.tutorId,
      title: record.title,
      institutionName: record.institutionName,
      completionYear: record.completionYear,
      createdAt: record.createdAt,
    };
  }
}