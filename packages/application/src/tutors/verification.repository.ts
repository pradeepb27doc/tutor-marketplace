import type { TutorRepository, TutorRecord } from "./tutor.repository.js";

// --- Verification Records ---

export type VerificationTypeValue =
  | "GOVERNMENT_ID"
  | "DEGREE"
  | "EXPERIENCE"
  | "POLICE"
  | "BACKGROUND_CHECK"
  | "ADDRESS"
  | "REFERENCE";

export type VerificationStatusValue =
  | "NOT_SUBMITTED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

export type DocumentStatusValue = "UPLOADED" | "VERIFIED" | "REJECTED" | "EXPIRED";

export interface VerificationCheckRecord {
  id: string;
  tutorId: string;
  type: VerificationTypeValue;
  status: VerificationStatusValue;
  submittedAt: Date | null;
  reviewedByUserId: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationDocumentRecord {
  id: string;
  tutorId: string;
  verificationCheckId: string | null;
  type: VerificationTypeValue;
  status: DocumentStatusValue;
  fileKey: string;
  originalFileName: string | null;
  mimeType: string | null;
  uploadedAt: Date;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVerificationDocumentRecord {
  tutorId: string;
  verificationCheckId: string | null;
  type: VerificationTypeValue;
  fileKey: string;
  originalFileName?: string | null;
  mimeType?: string | null;
  expiresAt?: Date | null;
}

export interface UpsertVerificationCheckInput {
  status?: VerificationStatusValue;
  submittedAt?: Date | null;
  metadata?: Record<string, unknown> | null;
}

export interface VerificationCaseSummaryRecord {
  tutor: Pick<
    TutorRecord,
    "id" | "userId" | "status" | "city" | "headline" | "createdAt"
  >;
  checks: VerificationCheckRecord[];
}

export interface TutorVerificationRepository {
  findChecksByTutorId(tutorId: string): Promise<VerificationCheckRecord[]>;
  findCheckByTutorIdAndType(
    tutorId: string,
    type: VerificationTypeValue,
  ): Promise<VerificationCheckRecord | null>;
  upsertCheck(
    tutorId: string,
    type: VerificationTypeValue,
    data: UpsertVerificationCheckInput,
  ): Promise<VerificationCheckRecord>;
  setCheckStatus(
    checkId: string,
    status: VerificationStatusValue,
    opts?: { reviewedByUserId?: string; rejectionReason?: string | null },
  ): Promise<void>;
  createDocument(
    data: CreateVerificationDocumentRecord,
  ): Promise<VerificationDocumentRecord>;
  findDocumentsByTutorId(tutorId: string): Promise<VerificationDocumentRecord[]>;
  findDocumentsByCheckId(checkId: string): Promise<VerificationDocumentRecord[]>;
  setDocumentStatus(docId: string, status: DocumentStatusValue): Promise<void>;
  listPendingCases(opts: {
    cursor?: string | null;
    limit: number;
  }): Promise<{ items: VerificationCaseSummaryRecord[]; nextCursor: string | null }>;
  getCaseByTutorId(tutorId: string): Promise<VerificationCaseSummaryRecord | null>;
  /** Transactionally mark all required checks APPROVED and activate the tutor. */
  approveVerification(
    tutorId: string,
    reviewerUserId: string,
    now: Date,
  ): Promise<void>;
  /** Transactionally mark required checks REJECTED and set tutor status REJECTED. */
  rejectVerification(
    tutorId: string,
    reviewerUserId: string,
    now: Date,
    rejectionReason: string,
  ): Promise<void>;
  /** Transactionally mark required checks CHANGES_REQUESTED and set tutor status CHANGES_REQUESTED. */
  requestChangesVerification(
    tutorId: string,
    reviewerUserId: string,
    now: Date,
    note?: string | null,
  ): Promise<void>;
}

export const REQUIRED_VERIFICATION_TYPES: VerificationTypeValue[] = [
  "GOVERNMENT_ID",
  "DEGREE",
  "EXPERIENCE",
];

export type { TutorRepository };