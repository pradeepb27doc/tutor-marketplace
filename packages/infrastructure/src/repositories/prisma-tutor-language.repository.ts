import type {
  TutorLanguageRecord,
  TutorLanguageRepository,
  CreateTutorLanguageRecord,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaTutorLanguageRepository implements TutorLanguageRepository {
  private get db() {
    return getPrismaClient();
  }

  async findByTutorId(tutorId: string): Promise<TutorLanguageRecord[]> {
    const records: any[] = await this.db.tutorLanguage.findMany({
      where: { tutorId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r: any) => this.toRecord(r));
  }

  async create(data: CreateTutorLanguageRecord): Promise<TutorLanguageRecord> {
    const record: any = await this.db.tutorLanguage.create({
      data: {
        tutorId: data.tutorId,
        language: data.language,
        proficiency: data.proficiency ?? undefined,
      },
    });
    return this.toRecord(record);
  }

  async delete(id: string): Promise<void> {
    await this.db.tutorLanguage.delete({ where: { id } });
  }

  private toRecord(record: any): TutorLanguageRecord {
    return {
      id: record.id,
      tutorId: record.tutorId,
      language: record.language,
      proficiency: record.proficiency,
      createdAt: record.createdAt,
    };
  }
}