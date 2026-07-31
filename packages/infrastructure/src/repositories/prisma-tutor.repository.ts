import type {
  TutorRecord,
  TutorRepository,
  CreateTutorRecord,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaTutorRepository implements TutorRepository {
  private get db() {
    return getPrismaClient();
  }

  async findByUserId(userId: string): Promise<TutorRecord | null> {
    const tutor: any = await this.db.tutor.findUnique({ where: { userId } });
    if (!tutor) return null;
    return this.toRecord(tutor);
  }

  async findById(id: string): Promise<TutorRecord | null> {
    const tutor: any = await this.db.tutor.findUnique({ where: { id } });
    if (!tutor) return null;
    return this.toRecord(tutor);
  }

  async create(data: CreateTutorRecord): Promise<TutorRecord> {
    const tutor: any = await this.db.tutor.create({
      data: {
        userId: data.userId,
        headline: data.headline ?? undefined,
        bio: data.bio ?? undefined,
        gender: (data.gender ?? undefined) as any,
        experienceYears: data.experienceYears ?? 0,
        city: data.city ?? undefined,
        locality: data.locality ?? undefined,
        baseHourlyRate: data.baseHourlyRate ?? undefined,
      },
    });
    return this.toRecord(tutor);
  }

  async update(id: string, data: Partial<TutorRecord>): Promise<TutorRecord> {
    const tutor: any = await this.db.tutor.update({
      where: { id },
      data: {
        headline: data.headline ?? undefined,
        bio: data.bio ?? undefined,
        gender: (data.gender ?? undefined) as any,
        experienceYears: data.experienceYears ?? undefined,
        city: data.city ?? undefined,
        locality: data.locality ?? undefined,
        baseHourlyRate: data.baseHourlyRate ?? undefined,
        profileCompletionScore: data.profileCompletionScore ?? undefined,
      },
    });
    return this.toRecord(tutor);
  }

  private toRecord(tutor: any): TutorRecord {
    return {
      id: tutor.id,
      userId: tutor.userId,
      status: tutor.status,
      headline: tutor.headline,
      bio: tutor.bio,
      gender: tutor.gender,
      experienceYears: tutor.experienceYears,
      city: tutor.city,
      locality: tutor.locality,
      baseHourlyRate: tutor.baseHourlyRate?.toString() ?? null,
      currency: tutor.currency,
      profileCompletionScore: tutor.profileCompletionScore,
      averageRating: tutor.averageRating?.toString() ?? "0",
      reviewCount: tutor.reviewCount,
      completedClassesCount: tutor.completedClassesCount,
      deletedAt: tutor.deletedAt ?? null,
      createdAt: tutor.createdAt,
      updatedAt: tutor.updatedAt,
    };
  }
}