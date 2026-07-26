import type {
  TutorVerificationRepository,
  VerificationCheckRecord,
  VerificationDocumentRecord,
  CreateVerificationDocumentRecord,
  UpsertVerificationCheckInput,
  VerificationCaseSummaryRecord,
  VerificationTypeValue,
  VerificationStatusValue,
  DocumentStatusValue,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";
import { REQUIRED_VERIFICATION_TYPES } from "@tutor-marketplace/application";

export class PrismaTutorVerificationRepository implements TutorVerificationRepository {
  private get db() {
    return getPrismaClient();
  }

  async findChecksByTutorId(tutorId: string): Promise<VerificationCheckRecord[]> {
    const records: any[] = await this.db.verificationCheck.findMany({
      where: { tutorId },
      orderBy: { createdAt: "asc" },
    });
    return records.map((r) => this.toCheckRecord(r));
  }

  async findCheckByTutorIdAndType(
    tutorId: string,
    type: VerificationTypeValue,
  ): Promise<VerificationCheckRecord | null> {
    const record: any = await this.db.verificationCheck.findUnique({
      where: { tutorId_type: { tutorId, type } },
    });
    return record ? this.toCheckRecord(record) : null;
  }

  async upsertCheck(
    tutorId: string,
    type: VerificationTypeValue,
    data: UpsertVerificationCheckInput,
  ): Promise<VerificationCheckRecord> {
    const record: any = await this.db.verificationCheck.upsert({
      where: { tutorId_type: { tutorId, type } },
      create: {
        tutorId,
        type,
        status: (data.status ?? "SUBMITTED") as any,
        submittedAt: data.submittedAt === undefined ? null : data.submittedAt,
        metadata: (data.metadata ?? null) as any,
      },
      update: {
        status: data.status === undefined ? undefined : (data.status as any),
        submittedAt: data.submittedAt === undefined ? undefined : data.submittedAt,
        metadata: data.metadata === undefined ? undefined : (data.metadata as any),
      },
    });
    return this.toCheckRecord(record);
  }

  async setCheckStatus(
    checkId: string,
    status: VerificationStatusValue,
    opts?: { reviewedByUserId?: string; rejectionReason?: string | null },
  ): Promise<void> {
    await this.db.verificationCheck.update({
      where: { id: checkId },
      data: {
        status: status as any,
        reviewedAt: new Date(),
        reviewedByUserId: opts?.reviewedByUserId ?? undefined,
        rejectionReason: opts?.rejectionReason === undefined ? undefined : opts.rejectionReason,
      },
    });
  }

  async createDocument(
    data: CreateVerificationDocumentRecord,
  ): Promise<VerificationDocumentRecord> {
    const record: any = await this.db.verificationDocument.create({
      data: {
        tutorId: data.tutorId,
        verificationCheckId: data.verificationCheckId ?? undefined,
        type: data.type as any,
        fileKey: data.fileKey,
        originalFileName: data.originalFileName ?? undefined,
        mimeType: data.mimeType ?? undefined,
        expiresAt: data.expiresAt ?? undefined,
      },
    });
    return this.toDocumentRecord(record);
  }

  async findDocumentsByTutorId(tutorId: string): Promise<VerificationDocumentRecord[]> {
    const records: any[] = await this.db.verificationDocument.findMany({
      where: { tutorId },
      orderBy: { createdAt: "asc" },
    });
    return records.map((r) => this.toDocumentRecord(r));
  }

  async findDocumentsByCheckId(checkId: string): Promise<VerificationDocumentRecord[]> {
    const records: any[] = await this.db.verificationDocument.findMany({
      where: { verificationCheckId: checkId },
      orderBy: { createdAt: "asc" },
    });
    return records.map((r) => this.toDocumentRecord(r));
  }

  async setDocumentStatus(docId: string, status: DocumentStatusValue): Promise<void> {
    await this.db.verificationDocument.update({
      where: { id: docId },
      data: { status: status as any },
    });
  }

  async listPendingCases(opts: {
    cursor?: string | null;
    limit: number;
  }): Promise<{ items: VerificationCaseSummaryRecord[]; nextCursor: string | null }> {
    const where = {
      status: { in: ["PENDING_VERIFICATION", "CHANGES_REQUESTED"] as any[] },
    };
    const records: any[] = await this.db.tutor.findMany({
      where,
      take: opts.limit + 1,
      ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
      orderBy: { id: "asc" },
      select: {
        id: true,
        userId: true,
        status: true,
        city: true,
        headline: true,
        createdAt: true,
        verificationChecks: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const hasMore = records.length > opts.limit;
    const page = hasMore ? records.slice(0, opts.limit) : records;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    const items: VerificationCaseSummaryRecord[] = page.map((t) => ({
      tutor: {
        id: t.id,
        userId: t.userId,
        status: t.status,
        city: t.city,
        headline: t.headline,
        createdAt: t.createdAt,
      },
      checks: t.verificationChecks.map((c: any) => this.toCheckRecord(c)),
    }));

    return { items, nextCursor };
  }

  async getCaseByTutorId(tutorId: string): Promise<VerificationCaseSummaryRecord | null> {
    const tutor: any = await this.db.tutor.findUnique({
      where: { id: tutorId },
      select: {
        id: true,
        userId: true,
        status: true,
        city: true,
        headline: true,
        createdAt: true,
        verificationChecks: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!tutor) return null;
    return {
      tutor: {
        id: tutor.id,
        userId: tutor.userId,
        status: tutor.status,
        city: tutor.city,
        headline: tutor.headline,
        createdAt: tutor.createdAt,
      },
      checks: tutor.verificationChecks.map((c: any) => this.toCheckRecord(c)),
    };
  }

  async approveVerification(
    tutorId: string,
    reviewerUserId: string,
    now: Date,
  ): Promise<void> {
    await this.db.$transaction(async (tx: any) => {
      const checks: any[] = await tx.verificationCheck.findMany({
        where: { tutorId, type: { in: REQUIRED_VERIFICATION_TYPES as any[] } },
      });
      for (const c of checks) {
        await tx.verificationCheck.update({
          where: { id: c.id },
          data: {
            status: "APPROVED",
            reviewedAt: now,
            reviewedByUserId: reviewerUserId,
            rejectionReason: null,
          },
        });
        await tx.verificationDocument.updateMany({
          where: { verificationCheckId: c.id },
          data: { status: "VERIFIED" },
        });
      }
      await tx.tutor.update({
        where: { id: tutorId },
        data: { status: "ACTIVE", approvedAt: now },
      });
    });
  }

  async rejectVerification(
    tutorId: string,
    reviewerUserId: string,
    now: Date,
    rejectionReason: string,
  ): Promise<void> {
    await this.db.$transaction(async (tx: any) => {
      const checks: any[] = await tx.verificationCheck.findMany({
        where: { tutorId, type: { in: REQUIRED_VERIFICATION_TYPES as any[] } },
      });
      for (const c of checks) {
        await tx.verificationCheck.update({
          where: { id: c.id },
          data: {
            status: "REJECTED",
            reviewedAt: now,
            reviewedByUserId: reviewerUserId,
            rejectionReason,
          },
        });
        await tx.verificationDocument.updateMany({
          where: { verificationCheckId: c.id },
          data: { status: "REJECTED" },
        });
      }
      await tx.tutor.update({
        where: { id: tutorId },
        data: { status: "REJECTED" },
      });
    });
  }

  async requestChangesVerification(
    tutorId: string,
    reviewerUserId: string,
    now: Date,
    note?: string | null,
  ): Promise<void> {
    await this.db.$transaction(async (tx: any) => {
      const checks: any[] = await tx.verificationCheck.findMany({
        where: { tutorId, type: { in: REQUIRED_VERIFICATION_TYPES as any[] } },
      });
      for (const c of checks) {
        await tx.verificationCheck.update({
          where: { id: c.id },
          data: {
            status: "CHANGES_REQUESTED",
            reviewedAt: now,
            reviewedByUserId: reviewerUserId,
            rejectionReason: note ?? null,
          },
        });
      }
      await tx.tutor.update({
        where: { id: tutorId },
        data: { status: "CHANGES_REQUESTED" },
      });
    });
  }

  private toCheckRecord(r: any): VerificationCheckRecord {
    return {
      id: r.id,
      tutorId: r.tutorId,
      type: r.type,
      status: r.status,
      submittedAt: r.submittedAt,
      reviewedByUserId: r.reviewedByUserId,
      reviewedAt: r.reviewedAt,
      rejectionReason: r.rejectionReason,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  private toDocumentRecord(r: any): VerificationDocumentRecord {
    return {
      id: r.id,
      tutorId: r.tutorId,
      verificationCheckId: r.verificationCheckId,
      type: r.type,
      status: r.status,
      fileKey: r.fileKey,
      originalFileName: r.originalFileName,
      mimeType: r.mimeType,
      uploadedAt: r.uploadedAt,
      expiresAt: r.expiresAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}