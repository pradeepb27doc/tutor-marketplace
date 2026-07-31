import type {
  ReviewRepository,
  ReviewRecord,
  CreateReviewRecord,
  ReviewQueryOptions,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaReviewRepository implements ReviewRepository {
  private get db() {
    return getPrismaClient();
  }

  async findById(id: string): Promise<ReviewRecord | null> {
    const record: any = await this.db.review.findUnique({ where: { id } });
    return record ? this.toRecord(record) : null;
  }

  async findByBookingIdAndParentId(bookingId: string, parentId: string): Promise<ReviewRecord | null> {
    const record: any = await this.db.review.findFirst({
      where: { bookingId, parentId },
    });
    return record ? this.toRecord(record) : null;
  }

  async findByTutorId(tutorId: string, opts?: ReviewQueryOptions): Promise<ReviewRecord[]> {
    const where: any = { tutorId };
    if (opts?.status) where.status = opts.status;
    if (opts?.rating) where.rating = opts.rating;

    const records: any[] = await this.db.review.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      take: opts?.limit,
      skip: opts?.offset,
    });
    return records.map((r: any) => this.toRecord(r));
  }

  async findByParentId(parentId: string, opts?: ReviewQueryOptions): Promise<ReviewRecord[]> {
    const where: any = { parentId };
    if (opts?.status) where.status = opts.status;
    if (opts?.rating) where.rating = opts.rating;

    const records: any[] = await this.db.review.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      take: opts?.limit,
      skip: opts?.offset,
    });
    return records.map((r: any) => this.toRecord(r));
  }

  async findAllPendingModeration(opts?: { limit?: number; offset?: number }): Promise<ReviewRecord[]> {
    const records: any[] = await this.db.review.findMany({
      where: { status: "PENDING_MODERATION" },
      orderBy: { submittedAt: "asc" },
      take: opts?.limit,
      skip: opts?.offset,
    });
    return records.map((r: any) => this.toRecord(r));
  }

  async create(data: CreateReviewRecord): Promise<ReviewRecord> {
    const record: any = await this.db.review.create({
      data: {
        bookingId: data.bookingId,
        parentId: data.parentId,
        studentId: data.studentId,
        tutorId: data.tutorId,
        rating: data.rating,
        title: data.title ?? null,
        comment: data.comment ?? null,
        status: "PENDING_MODERATION",
        submittedAt: new Date(),
      },
    });
    return this.toRecord(record);
  }

  async moderate(id: string, status: string, moderatedByUserId: string): Promise<ReviewRecord> {
    const record: any = await this.db.review.update({
      where: { id },
      data: {
        status: status as any,
        moderatedByUserId,
        moderatedAt: new Date(),
      },
    });
    return this.toRecord(record);
  }

  async updateRating(tutorId: string): Promise<{ averageRating: number; reviewCount: number }> {
    const result: any = await this.db.review.aggregate({
      where: { tutorId, status: "PUBLISHED" },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = result._avg.rating ?? 0;
    const reviewCount = result._count.rating;

    await this.db.tutor.update({
      where: { id: tutorId },
      data: {
        averageRating,
        reviewCount,
      },
    });

    return {
      averageRating: parseFloat(averageRating.toFixed(2)),
      reviewCount,
    };
  }

  private toRecord(record: any): ReviewRecord {
    return {
      id: record.id,
      bookingId: record.bookingId,
      parentId: record.parentId,
      studentId: record.studentId,
      tutorId: record.tutorId,
      rating: record.rating,
      title: record.title,
      comment: record.comment,
      status: record.status,
      moderatedByUserId: record.moderatedByUserId,
      moderatedAt: record.moderatedAt,
      submittedAt: record.submittedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}