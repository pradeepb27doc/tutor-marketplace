import type {
  SubjectRecord,
  SubjectRepository,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaSubjectRepository implements SubjectRepository {
  private get db() {
    return getPrismaClient();
  }

  async findAllActive(): Promise<SubjectRecord[]> {
    const subjects: any[] = await this.db.subject.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
        },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return subjects.map((s: any) => this.toRecord(s));
  }

  async findBySlug(slug: string): Promise<SubjectRecord | null> {
    const subject: any = await this.db.subject.findUnique({
      where: { slug },
    });
    if (!subject) return null;
    return this.toRecord(subject);
  }

  private toRecord(subject: any): SubjectRecord {
    return {
      id: subject.id,
      slug: subject.slug,
      name: subject.name,
      category: subject.category,
      parentSubjectId: subject.parentSubjectId,
      isActive: subject.isActive,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    };
  }
}