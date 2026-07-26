import type { UseCase } from "../index.js";
import type {
  ReviewRepository,
  ReviewRecord,
  CreateReviewRecord,
} from "./review.repository.js";
import type {
  CreateReviewInput,
  ModerateReviewInput,
  ReviewQueryInput,
  ReviewDto,
  TutorRatingSummaryDto,
} from "./review.dtos.js";
import { toReviewDto } from "./review.dtos.js";
import {
  InvalidRatingError,
  DuplicateReviewError,
  BookingNotCompletedError,
  ReviewNotFoundError,
  ReviewOwnershipError,
  ParentNotFoundError,
  TutorNotFoundError,
  BookingNotFoundError,
} from "./review.errors.js";

// --- External repository interfaces needed by review use cases ---

export interface BookingRepository {
  findById(id: string): Promise<{ id: string; status: string; parentId: string; tutorId: string; studentId: string } | null>;
}

export interface ParentRepository {
  findByUserId(userId: string): Promise<{ id: string; userId: string } | null>;
}

export interface TutorRepository {
  findByUserId(userId: string): Promise<{ id: string; userId: string } | null>;
  findById(id: string): Promise<{ id: string; userId: string } | null>;
}

// --- Use Cases ---

export class SubmitReviewUseCase
  implements UseCase<{ userId: string; data: CreateReviewInput }, ReviewDto>
{
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly bookingRepo: BookingRepository,
    private readonly parentRepo: ParentRepository,
    private readonly tutorRepo: TutorRepository,
  ) {}

  async execute(input: { userId: string; data: CreateReviewInput }): Promise<ReviewDto> {
    const { userId, data } = input;

    // 1. Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new InvalidRatingError(data.rating);
    }

    // 2. Resolve parent profile
    const parent = await this.parentRepo.findByUserId(userId);
    if (!parent) throw new ParentNotFoundError();

    // 3. Verify booking exists and is completed
    const booking = await this.bookingRepo.findById(data.bookingId);
    if (!booking) throw new BookingNotFoundError();
    if (booking.status !== "COMPLETED") {
      throw new BookingNotCompletedError();
    }
    if (booking.parentId !== parent.id) throw new ReviewOwnershipError();

    // 4. Check for duplicate review
    const existing = await this.reviewRepo.findByBookingIdAndParentId(data.bookingId, parent.id);
    if (existing) throw new DuplicateReviewError();

    // 5. Verify tutor exists
    const tutor = await this.tutorRepo.findById(booking.tutorId);
    if (!tutor) throw new TutorNotFoundError();

    // 6. Create review
    const createData: CreateReviewRecord = {
      bookingId: data.bookingId,
      parentId: parent.id,
      studentId: data.studentId,
      tutorId: booking.tutorId,
      rating: data.rating,
      title: data.title ?? null,
      comment: data.comment ?? null,
    };

    const review = await this.reviewRepo.create(createData);

    // 7. Update tutor's average rating
    await this.reviewRepo.updateRating(booking.tutorId);

    return toReviewDto(review);
  }
}

export class ModerateReviewUseCase
  implements UseCase<{ userId: string; data: ModerateReviewInput }, ReviewDto>
{
  constructor(
    private readonly reviewRepo: ReviewRepository,
  ) {}

  async execute(input: { userId: string; data: ModerateReviewInput }): Promise<ReviewDto> {
    const { userId, data } = input;

    const review = await this.reviewRepo.findById(data.reviewId);
    if (!review) throw new ReviewNotFoundError();

    const updated = await this.reviewRepo.moderate(data.reviewId, data.status, userId);

    // If status changed to something that should affect rating, update it
    if (data.status === "HIDDEN" || data.status === "FLAGGED") {
      await this.reviewRepo.updateRating(review.tutorId);
    }

    return toReviewDto(updated);
  }
}

export class GetReviewUseCase
  implements UseCase<{ userId: string; reviewId: string }, ReviewDto>
{
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly parentRepo: ParentRepository,
    private readonly tutorRepo: TutorRepository,
  ) {}

  async execute(input: { userId: string; reviewId: string }): Promise<ReviewDto> {
    const { userId, reviewId } = input;

    const review = await this.reviewRepo.findById(reviewId);
    if (!review) throw new ReviewNotFoundError();

    // Check ownership: either the parent who wrote it or the tutor it's about
    const parent = await this.parentRepo.findByUserId(userId);
    const tutor = await this.tutorRepo.findByUserId(userId);

    const isParent = parent && review.parentId === parent.id;
    const isTutor = tutor && review.tutorId === tutor.id;

    if (!isParent && !isTutor) throw new ReviewOwnershipError();

    return toReviewDto(review);
  }
}

export class ListTutorReviewsUseCase
  implements UseCase<{ tutorId: string; query?: ReviewQueryInput }, ReviewDto[]>
{
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly tutorRepo: TutorRepository,
  ) {}

  async execute(input: { tutorId: string; query?: ReviewQueryInput }): Promise<ReviewDto[]> {
    const tutor = await this.tutorRepo.findById(input.tutorId);
    if (!tutor) throw new TutorNotFoundError();

    const opts = input.query
      ? {
          tutorId: input.tutorId,
          status: input.query.status,
          rating: input.query.rating,
          limit: input.query.limit,
          offset: input.query.offset,
        }
      : { tutorId: input.tutorId };

    const reviews = await this.reviewRepo.findByTutorId(input.tutorId, opts);
    return reviews.map(toReviewDto);
  }
}

export class ListMyReviewsUseCase
  implements UseCase<{ userId: string; query?: ReviewQueryInput }, ReviewDto[]>
{
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly parentRepo: ParentRepository,
  ) {}

  async execute(input: { userId: string; query?: ReviewQueryInput }): Promise<ReviewDto[]> {
    const parent = await this.parentRepo.findByUserId(input.userId);
    if (!parent) throw new ParentNotFoundError();

    const opts = input.query
      ? {
          parentId: parent.id,
          status: input.query.status,
          rating: input.query.rating,
          limit: input.query.limit,
          offset: input.query.offset,
        }
      : { parentId: parent.id };

    const reviews = await this.reviewRepo.findByParentId(parent.id, opts);
    return reviews.map(toReviewDto);
  }
}

export class ListPendingModerationReviewsUseCase
  implements UseCase<{ userId: string; limit?: number; offset?: number }, ReviewDto[]>
{
  constructor(
    private readonly reviewRepo: ReviewRepository,
  ) {}

  async execute(input: { userId: string; limit?: number; offset?: number }): Promise<ReviewDto[]> {
    const reviews = await this.reviewRepo.findAllPendingModeration({
      limit: input.limit,
      offset: input.offset,
    });
    return reviews.map(toReviewDto);
  }
}

export class GetTutorRatingSummaryUseCase
  implements UseCase<{ tutorId: string }, TutorRatingSummaryDto>
{
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly tutorRepo: TutorRepository,
  ) {}

  async execute(input: { tutorId: string }): Promise<TutorRatingSummaryDto> {
    const tutor = await this.tutorRepo.findById(input.tutorId);
    if (!tutor) throw new TutorNotFoundError();

    const reviews = await this.reviewRepo.findByTutorId(input.tutorId);

    const totalRating = reviews
      .filter((r) => r.status === "PUBLISHED")
      .reduce((sum, r) => sum + r.rating, 0);
    const publishedReviews = reviews.filter((r) => r.status === "PUBLISHED");
    const reviewCount = publishedReviews.length;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of publishedReviews) {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    }

    return {
      averageRating: reviewCount > 0 ? parseFloat((totalRating / reviewCount).toFixed(2)) : 0,
      reviewCount,
      distribution,
    };
  }
}