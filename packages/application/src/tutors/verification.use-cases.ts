import type { UseCase, Clock } from "../index.js";
import type { TutorRepository } from "./tutor.repository.js";
import type {
  TutorVerificationRepository,
  VerificationTypeValue,
} from "./verification.repository.js";
import { REQUIRED_VERIFICATION_TYPES } from "./verification.repository.js";
import {
  toCheckDto,
  toDocumentDto,
  type VerificationStatusDto,
  type VerificationCaseDto,
  type VerificationCaseSummaryDto,
  type ListVerificationCasesResultDto,
  type UploadVerificationDocumentInput,
  type SubmitVerificationResultDto,
  type ApproveVerificationResultDto,
  type RejectVerificationResultDto,
  type RequestChangesResultDto,
} from "./verification.dtos.js";

const REQUIRED = REQUIRED_VERIFICATION_TYPES;

function assertTutorFound(tutor: { id: string; status: string } | null, userId: string) {
  if (!tutor) throw new Error("Tutor profile not found");
}

// --- Tutor: Get Verification Status ---

export class GetVerificationStatusUseCase
  implements UseCase<{ userId: string }, VerificationStatusDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly verificationRepo: TutorVerificationRepository,
  ) {}

  async execute(input: { userId: string }): Promise<VerificationStatusDto> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    assertTutorFound(tutor, input.userId);
    const checks = await this.verificationRepo.findChecksByTutorId(tutor!.id);
    const documents = await this.verificationRepo.findDocumentsByTutorId(tutor!.id);

    const checksWithDocs = checks.map((c) => ({
      ...toCheckDto(
        c,
        documents.filter((d) => d.verificationCheckId === c.id),
      ),
    }));

    // Ensure every required type appears even if no check exists yet.
    for (const type of REQUIRED) {
      if (!checksWithDocs.some((c) => c.type === type)) {
        checksWithDocs.push({
          type,
          status: "NOT_SUBMITTED",
          submittedAt: null,
          reviewedAt: null,
          rejectionReason: null,
          documents: [],
        });
      }
    }

    return {
      tutorId: tutor!.id,
      status: tutor!.status,
      checks: checksWithDocs,
    };
  }
}

// --- Tutor: Upload Verification Document ---

export class UploadVerificationDocumentUseCase
  implements
    UseCase<
      { userId: string; data: UploadVerificationDocumentInput },
      VerificationStatusDto["checks"][number]["documents"][number]
    >
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly verificationRepo: TutorVerificationRepository,
  ) {}

  async execute(input: {
    userId: string;
    data: UploadVerificationDocumentInput;
  }) {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    assertTutorFound(tutor, input.userId);

    if (tutor!.status === "ACTIVE") {
      throw new Error("Tutor is already verified and active");
    }

    // Ensure a check exists for this type and move it to SUBMITTED.
    const check = await this.verificationRepo.upsertCheck(tutor!.id, input.data.type, {
      status: "SUBMITTED",
      submittedAt: new Date(),
    });

    const doc = await this.verificationRepo.createDocument({
      tutorId: tutor!.id,
      verificationCheckId: check.id,
      type: input.data.type,
      fileKey: input.data.fileKey,
      originalFileName: input.data.originalFileName ?? null,
      mimeType: input.data.mimeType ?? null,
      expiresAt: input.data.expiresAt ?? null,
    });

    return toDocumentDto(doc);
  }
}

// --- Tutor: Submit Verification ---

export class SubmitVerificationUseCase
  implements UseCase<{ userId: string }, SubmitVerificationResultDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly verificationRepo: TutorVerificationRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: { userId: string }): Promise<SubmitVerificationResultDto> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    assertTutorFound(tutor, input.userId);

    if (tutor!.status === "ACTIVE") {
      throw new Error("Tutor is already verified and active");
    }

    const documents = await this.verificationRepo.findDocumentsByTutorId(tutor!.id);
    const submittedTypes = new Set(documents.map((d) => d.type));

    const missing = REQUIRED.filter((t) => !submittedTypes.has(t));
    if (missing.length > 0) {
      throw new Error(
        `Missing documents for required verification types: ${missing.join(", ")}`,
      );
    }

    // Mark each required check as SUBMITTED (idempotent on re-submit).
    for (const type of REQUIRED) {
      await this.verificationRepo.upsertCheck(tutor!.id, type, {
        status: "SUBMITTED",
        submittedAt: this.clock.now(),
      });
    }

    await this.tutorRepo.update(tutor!.id, { status: "PENDING_VERIFICATION" as any });

    return { tutorId: tutor!.id, status: "PENDING_VERIFICATION" };
  }
}

// --- Admin/Support: List Verification Cases ---

export class ListVerificationCasesUseCase
  implements
    UseCase<
      { cursor?: string | null; limit?: number },
      ListVerificationCasesResultDto
    >
{
  constructor(private readonly verificationRepo: TutorVerificationRepository) {}

  async execute(input: { cursor?: string | null; limit?: number }) {
    const limit = Math.min(input.limit ?? 20, 100);
    const result = await this.verificationRepo.listPendingCases({
      cursor: input.cursor ?? null,
      limit,
    });

    const data: VerificationCaseSummaryDto[] = result.items.map((item) => {
      const submittedOrLater = item.checks.filter(
        (c) =>
          c.status !== "NOT_SUBMITTED" && c.status !== "REJECTED" && c.status !== "APPROVED",
      );
      const pendingCheckTypes = (submittedOrLater.length ? submittedOrLater : item.checks).map(
        (c) => c.type,
      ) as VerificationTypeValue[];
      return {
        tutorId: item.tutor.id,
        status: item.tutor.status,
        city: item.tutor.city,
        headline: item.tutor.headline,
        createdAt: item.tutor.createdAt,
        pendingCheckTypes,
      };
    });

    return {
      data,
      page: {
        nextCursor: result.nextCursor,
        hasMore: result.nextCursor !== null,
        limit,
      },
    };
  }
}

// --- Admin/Support: Get Verification Case ---

export class GetVerificationCaseUseCase
  implements UseCase<{ tutorId: string }, VerificationCaseDto>
{
  constructor(private readonly verificationRepo: TutorVerificationRepository) {}

  async execute(input: { tutorId: string }): Promise<VerificationCaseDto> {
    const caseRecord = await this.verificationRepo.getCaseByTutorId(input.tutorId);
    if (!caseRecord) throw new Error("Verification case not found");

    const documents = await this.verificationRepo.findDocumentsByTutorId(input.tutorId);
    const checks = caseRecord.checks.map((c) =>
      toCheckDto(
        c,
        documents.filter((d) => d.verificationCheckId === c.id),
      ),
    );

    return {
      tutorId: caseRecord.tutor.id,
      tutorUserId: caseRecord.tutor.userId,
      status: caseRecord.tutor.status,
      city: caseRecord.tutor.city,
      headline: caseRecord.tutor.headline,
      createdAt: caseRecord.tutor.createdAt,
      checks,
    };
  }
}

// --- Admin: Approve Verification (activates tutor in single transaction) ---

export class ApproveVerificationUseCase
  implements UseCase<{ tutorId: string; reviewerUserId: string }, ApproveVerificationResultDto>
{
  constructor(
    private readonly verificationRepo: TutorVerificationRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: {
    tutorId: string;
    reviewerUserId: string;
  }): Promise<ApproveVerificationResultDto> {
    const caseRecord = await this.verificationRepo.getCaseByTutorId(input.tutorId);
    if (!caseRecord) throw new Error("Verification case not found");

    const now = this.clock.now();
    await this.verificationRepo.approveVerification(input.tutorId, input.reviewerUserId, now);

    return {
      tutorId: input.tutorId,
      status: "ACTIVE",
      approvedAt: now,
    };
  }
}

// --- Admin: Reject Verification ---

export class RejectVerificationUseCase
  implements
    UseCase<
      { tutorId: string; reviewerUserId: string; rejectionReason: string },
      RejectVerificationResultDto
    >
{
  constructor(
    private readonly verificationRepo: TutorVerificationRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: {
    tutorId: string;
    reviewerUserId: string;
    rejectionReason: string;
  }): Promise<RejectVerificationResultDto> {
    const caseRecord = await this.verificationRepo.getCaseByTutorId(input.tutorId);
    if (!caseRecord) throw new Error("Verification case not found");

    const now = this.clock.now();
    await this.verificationRepo.rejectVerification(
      input.tutorId,
      input.reviewerUserId,
      now,
      input.rejectionReason,
    );

    return {
      tutorId: input.tutorId,
      status: "REJECTED",
      rejectionReason: input.rejectionReason,
    };
  }
}

// --- Admin: Request Changes ---

export class RequestChangesVerificationUseCase
  implements
    UseCase<
      { tutorId: string; reviewerUserId: string; note?: string | null },
      RequestChangesResultDto
    >
{
  constructor(
    private readonly verificationRepo: TutorVerificationRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: {
    tutorId: string;
    reviewerUserId: string;
    note?: string | null;
  }): Promise<RequestChangesResultDto> {
    const caseRecord = await this.verificationRepo.getCaseByTutorId(input.tutorId);
    if (!caseRecord) throw new Error("Verification case not found");

    const now = this.clock.now();
    await this.verificationRepo.requestChangesVerification(
      input.tutorId,
      input.reviewerUserId,
      now,
      input.note ?? null,
    );

    return {
      tutorId: input.tutorId,
      status: "CHANGES_REQUESTED",
    };
  }
}