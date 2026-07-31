import type { ReviewRecord } from "./review.repository.js";

export interface CreateReviewInput {
  bookingId: string;
  studentId: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface ModerateReviewInput {
  reviewId: string;
  status: "PUBLISHED" | "HIDDEN" | "FLAGGED";
}

export interface ReviewQueryInput {
  tutorId?: string;
  status?: string;
  rating?: number;
  limit?: number;
  offset?: number;
}

export interface ReviewDto {
  id: string;
  bookingId: string;
  parentId: string;
  studentId: string;
  tutorId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  status: string;
  moderatedByUserId: string | null;
  moderatedAt: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TutorRatingSummaryDto {
  averageRating: number;
  reviewCount: number;
  distribution: Record<number, number>;
}

export type ReviewListDto = ReviewDto[];

/** Mapper functions */

export function toReviewDto(record: ReviewRecord): ReviewDto {
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
    moderatedAt: record.moderatedAt?.toISOString() ?? null,
    submittedAt: record.submittedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}