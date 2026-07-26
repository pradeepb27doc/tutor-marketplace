import type {
  VerificationCheckRecord,
  VerificationDocumentRecord,
  VerificationTypeValue,
  VerificationStatusValue,
  DocumentStatusValue,
} from "./verification.repository.js";
import type { TutorRepository } from "./tutor.repository.js";

// --- Tutor-facing DTOs ---

export interface VerificationDocumentDto {
  id: string;
  verificationCheckId: string | null;
  type: VerificationTypeValue;
  status: DocumentStatusValue;
  fileKey: string;
  originalFileName: string | null;
  mimeType: string | null;
  uploadedAt: Date;
  expiresAt: Date | null;
}

export interface VerificationCheckDto {
  type: VerificationTypeValue;
  status: VerificationStatusValue;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  documents: VerificationDocumentDto[];
}

export interface VerificationStatusDto {
  tutorId: string;
  status: string;
  checks: VerificationCheckDto[];
}

// --- Admin-facing DTOs ---

export interface VerificationCaseCheckDto extends VerificationCheckDto {}

export interface VerificationCaseDto {
  tutorId: string;
  tutorUserId: string;
  status: string;
  city: string | null;
  headline: string | null;
  createdAt: Date;
  checks: VerificationCaseCheckDto[];
}

export interface VerificationCaseSummaryDto {
  tutorId: string;
  status: string;
  city: string | null;
  headline: string | null;
  createdAt: Date;
  pendingCheckTypes: VerificationTypeValue[];
}

export interface ListVerificationCasesResultDto {
  data: VerificationCaseSummaryDto[];
  page: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

// --- Input DTOs ---

export interface UploadVerificationDocumentInput {
  type: VerificationTypeValue;
  fileKey: string;
  originalFileName?: string;
  mimeType?: string;
  expiresAt?: Date | null;
}

export interface SubmitVerificationResultDto {
  tutorId: string;
  status: string;
}

export interface ApproveVerificationResultDto {
  tutorId: string;
  status: string;
  approvedAt: Date;
}

export interface RejectVerificationResultDto {
  tutorId: string;
  status: string;
  rejectionReason: string;
}

export interface RequestChangesResultDto {
  tutorId: string;
  status: string;
}

// --- Mappers ---

export function toDocumentDto(r: VerificationDocumentRecord): VerificationDocumentDto {
  return {
    id: r.id,
    verificationCheckId: r.verificationCheckId,
    type: r.type,
    status: r.status,
    fileKey: r.fileKey,
    originalFileName: r.originalFileName,
    mimeType: r.mimeType,
    uploadedAt: r.uploadedAt,
    expiresAt: r.expiresAt,
  };
}

export function toCheckDto(
  check: VerificationCheckRecord,
  documents: VerificationDocumentRecord[],
): VerificationCheckDto {
  return {
    type: check.type,
    status: check.status,
    submittedAt: check.submittedAt,
    reviewedAt: check.reviewedAt,
    rejectionReason: check.rejectionReason,
    documents: documents.map(toDocumentDto),
  };
}

export type { TutorRepository };