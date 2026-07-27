// Types matching backend DTOs from packages/application/src/reviews/review.dtos.ts
// Backend endpoints:
// - POST /bookings/:bookingId/reviews
// - GET /tutors/:tutorId/reviews
// - GET /tutors/:tutorId/ratings

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

export interface CreateReviewInput {
  bookingId: string;
  studentId: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface ReviewQueryParams {
  status?: string;
  rating?: number;
  limit?: number;
  cursor?: string;
  offset?: number;
}

export interface ReviewsListResponse {
  data: ReviewDto[];
  meta?: {
    limit?: number;
    cursor?: string;
    hasMore?: boolean;
  };
}

export interface TutorRatingSummaryResponse {
  data: TutorRatingSummaryDto;
}