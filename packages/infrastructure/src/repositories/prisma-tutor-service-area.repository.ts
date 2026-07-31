import type {
  TutorServiceAreaRecord,
  TutorServiceAreaRepository,
  CreateTutorServiceAreaRecord,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaTutorServiceAreaRepository implements TutorServiceAreaRepository {
  private get db() {
    return getPrismaClient();
  }

  async findByTutorId(tutorId: string): Promise<TutorServiceAreaRecord[]> {
    const records: any[] = await this.db.tutorServiceArea.findMany({
      where: { tutorId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r: any) => this.toRecord(r));
  }

  async create(data: CreateTutorServiceAreaRecord): Promise<TutorServiceAreaRecord> {
    const record: any = await this.db.tutorServiceArea.create({
      data: {
        tutorId: data.tutorId,
        city: data.city,
        locality: data.locality ?? undefined,
        radiusKm: data.radiusKm ? (data.radiusKm as any) : undefined,
      },
    });
    return this.toRecord(record);
  }

  async delete(id: string): Promise<void> {
    await this.db.tutorServiceArea.delete({ where: { id } });
  }

  private toRecord(record: any): TutorServiceAreaRecord {
    return {
      id: record.id,
      tutorId: record.tutorId,
      city: record.city,
      locality: record.locality,
      radiusKm: record.radiusKm?.toString() ?? "5",
      createdAt: record.createdAt,
    };
  }
}