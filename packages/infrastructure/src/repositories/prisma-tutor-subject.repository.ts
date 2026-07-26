import type {
  TutorSubjectRecord,
  TutorSubjectRepository,
  CreateTutorSubjectRecord,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaTutorSubjectRepository implements TutorSubjectRepository {
  private get db() {
    return getPrismaClient();
  }

  async findByTutorId(tutorId: string): Promise<TutorSubjectRecord[]> {
    const records: any[] = await this.db.tutorSubject.findMany({
      where: { tutorId },
      include: { subject: true },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r: any) => this.toRecord(r));
  }

  async findById(id: string): Promise<TutorSubjectRecord | null> {
    const record: any = await this.db.tutorSubject.findUnique({
      where: { id },
      include: { subject: true },
    });
    if (!record) return null;
    return this.toRecord(record);
  }

  async findByTutorIdAndSubjectId(tutorId: string, subjectId: string): Promise<TutorSubjectRecord | null> {
    const record: any = await this.db.tutorSubject.findFirst({
      where: { tutorId, subjectId },
      include: { subject: true },
    });
    if (!record) return null;
    return this.toRecord(record);
  }

  async create(data: CreateTutorSubjectRecord): Promise<TutorSubjectRecord> {
    const record: any = await this.db.tutorSubject.create({
      data: {
        tutorId: data.tutorId,
        subjectId: data.subjectId,
        gradeMin: data.gradeMin ?? undefined,
        gradeMax: data.gradeMax ?? undefined,
        hourlyRate: data.hourlyRate ?? undefined,
      },
      include: { subject: true },
    });
    return this.toRecord(record);
  }

  async softDelete(id: string): Promise<void> {
    await this.db.tutorSubject.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private toRecord(record: any): TutorSubjectRecord {
    return {
      id: record.id,
      tutorId: record.tutorId,
      subjectId: record.subjectId,
      gradeMin: record.gradeMin,
      gradeMax: record.gradeMax,
      hourlyRate: record.hourlyRate?.toString() ?? null,
      serviceModes: record.serviceModes ?? [],
      curricula: record.curricula ?? [],
      isActive: record.isActive,
      createdAt: record.createdAt,
      subject: record.subject
        ? {
            id: record.subject.id,
            slug: record.subject.slug,
            name: record.subject.name,
            category: record.subject.category,
            parentSubjectId: record.subject.parentSubjectId,
            isActive: record.subject.isActive,
            createdAt: record.subject.createdAt,
            updatedAt: record.subject.updatedAt,
          }
        : undefined,
    };
  }
}