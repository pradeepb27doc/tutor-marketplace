import { describe, expect, it, beforeEach } from "vitest";
import {
  SubmitReviewUseCase,
  ModerateReviewUseCase,
  GetReviewUseCase,
  ListTutorReviewsUseCase,
  ListMyReviewsUseCase,
  ListPendingModerationReviewsUseCase,
  GetTutorRatingSummaryUseCase,
} from "./index.js";
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
import type {
  ReviewRepository,
  ReviewRecord,
  CreateReviewRecord,
  ReviewQueryOptions,
} from "./review.repository.js";
import type {
  BookingRepository,
  ParentRepository,
  TutorRepository,
} from "./review.use-cases.js";

// --- Fakes ---

let _seq = 0;
function nextId(prefix: string): string {
  _seq += 1;
  return `${prefix}-${_seq}`;
}

class FakeReviewRepository implements ReviewRepository {
  public reviews: ReviewRecord[] = [];

  async findById(id: string): Promise<ReviewRecord | null> {
    return this.reviews.find((r) => r.id === id) ?? null;
  }

  async findByBookingIdAndParentId(bookingId: string, parentId: string): Promise<ReviewRecord | null> {
    return this.reviews.find((r) => r.bookingId === bookingId && r.parentId === parentId) ?? null;
  }

  async findByTutorId(tutorId: string, opts?: ReviewQueryOptions): Promise<ReviewRecord[]> {
    let result = this.reviews.filter((r) => r.tutorId === tutorId);
    if (opts?.status) result = result.filter((r) => r.status === opts.status);
    if (opts?.rating) result = result.filter((r) => r.rating === opts.rating);
    return result.slice(opts?.offset ?? 0, opts?.limit ? (opts.offset ?? 0) + opts.limit : undefined);
  }

  async findByParentId(parentId: string, opts?: ReviewQueryOptions): Promise<ReviewRecord[]> {
    let result = this.reviews.filter((r) => r.parentId === parentId);
    if (opts?.status) result = result.filter((r) => r.status === opts.status);
    if (opts?.rating) result = result.filter((r) => r.rating === opts.rating);
    return result.slice(opts?.offset ?? 0, opts?.limit ? (opts.offset ?? 0) + opts.limit : undefined);
  }

  async findAllPendingModeration(opts?: { limit?: number; offset?: number }): Promise<ReviewRecord[]> {
    return this.reviews
      .filter((r) => r.status === "PENDING")
      .slice(opts?.offset ?? 0, opts?.limit ? (opts.offset ?? 0) + opts.limit : undefined);
  }

  async create(data: CreateReviewRecord): Promise<ReviewRecord> {
    const now = new Date();
    const record: ReviewRecord = {
      id: nextId("review"),
      bookingId: data.bookingId,
      parentId: data.parentId,
      studentId: data.studentId,
      tutorId: data.tutorId,
      rating: data.rating,
      title: data.title ?? null,
      comment: data.comment ?? null,
      status: "PENDING",
      moderatedByUserId: null,
      moderatedAt: null,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    this.reviews.push(record);
    return record;
  }

  async moderate(id: string, status: string, moderatedByUserId: string): Promise<ReviewRecord> {
    const idx = this.reviews.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Review not found");
    this.reviews[idx] = {
      ...this.reviews[idx],
      status,
      moderatedByUserId,
      moderatedAt: new Date(),
      updatedAt: new Date(),
    };
    return this.reviews[idx];
  }

  async updateRating(tutorId: string): Promise<{ averageRating: number; reviewCount: number }> {
    const tutorReviews = this.reviews.filter((r) => r.tutorId === tutorId && r.status === "PUBLISHED");
    const total = tutorReviews.reduce((sum, r) => sum + r.rating, 0);
    const count = tutorReviews.length;
    return {
      averageRating: count > 0 ? parseFloat((total / count).toFixed(2)) : 0,
      reviewCount: count,
    };
  }
}

class FakeBookingRepo implements BookingRepository {
  public bookings: Array<{ id: string; status: string; parentId: string; tutorId: string; studentId: string }> = [];

  async findById(id: string): Promise<{ id: string; status: string; parentId: string; tutorId: string; studentId: string } | null> {
    return this.bookings.find((b) => b.id === id) ?? null;
  }
}

class FakeParentRepo implements ParentRepository {
  public parents: Array<{ id: string; userId: string }> = [];

  async findByUserId(userId: string): Promise<{ id: string; userId: string } | null> {
    return this.parents.find((p) => p.userId === userId) ?? null;
  }
}

class FakeTutorRepo implements TutorRepository {
  public tutors: Array<{ id: string; userId: string }> = [];

  async findByUserId(userId: string): Promise<{ id: string; userId: string } | null> {
    return this.tutors.find((t) => t.userId === userId) ?? null;
  }

  async findById(id: string): Promise<{ id: string; userId: string } | null> {
    return this.tutors.find((t) => t.id === id) ?? null;
  }
}

function setup() {
  const reviewRepo = new FakeReviewRepository();
  const bookingRepo = new FakeBookingRepo();
  const parentRepo = new FakeParentRepo();
  const tutorRepo = new FakeTutorRepo();

  // Seed default entities
  parentRepo.parents.push({ id: "parent-1", userId: "user-parent" });
  tutorRepo.tutors.push({ id: "tutor-1", userId: "user-tutor" });
  bookingRepo.bookings.push({
    id: "booking-1",
    status: "COMPLETED",
    parentId: "parent-1",
    tutorId: "tutor-1",
    studentId: "student-1",
  });

  return { reviewRepo, bookingRepo, parentRepo, tutorRepo };
}

// ===== Tests =====

describe("SubmitReviewUseCase", () => {
  it("submits a valid review successfully", async () => {
    const s = setup();
    const useCase = new SubmitReviewUseCase(s.reviewRepo, s.bookingRepo, s.parentRepo, s.tutorRepo);

    const result = await useCase.execute({
      userId: "user-parent",
      data: { bookingId: "booking-1", studentId: "student-1", rating: 5, title: "Great tutor", comment: "Very helpful" },
    });

    expect(result.rating).toBe(5);
    expect(result.status).toBe("PENDING");
    expect(result.tutorId).toBe("tutor-1");
    expect(result.parentId).toBe("parent-1");
    expect(result.title).toBe("Great tutor");
    expect(result.comment).toBe("Very helpful");
  });

  it("throws InvalidRatingError for rating out of range", async () => {
    const s = setup();
    const useCase = new SubmitReviewUseCase(s.reviewRepo, s.bookingRepo, s.parentRepo, s.tutorRepo);

    await expect(useCase.execute({
      userId: "user-parent",
      data: { bookingId: "booking-1", studentId: "student-1", rating: 0 },
    })).rejects.toThrow(InvalidRatingError);

    await expect(useCase.execute({
      userId: "user-parent",
      data: { bookingId: "booking-1", studentId: "student-1", rating: 6 },
    })).rejects.toThrow(InvalidRatingError);
  });

  it("throws ParentNotFoundError when parent profile does not exist", async () => {
    const s = setup();
    const useCase = new SubmitReviewUseCase(s.reviewRepo, s.bookingRepo, s.parentRepo, s.tutorRepo);

    await expect(useCase.execute({
      userId: "non-existent-user",
      data: { bookingId: "booking-1", studentId: "student-1", rating: 4 },
    })).rejects.toThrow(ParentNotFoundError);
  });

  it("throws BookingNotFoundError when booking does not exist", async () => {
    const s = setup();
    const useCase = new SubmitReviewUseCase(s.reviewRepo, s.bookingRepo, s.parentRepo, s.tutorRepo);

    await expect(useCase.execute({
      userId: "user-parent",
      data: { bookingId: "non-existent-booking", studentId: "student-1", rating: 4 },
    })).rejects.toThrow(BookingNotFoundError);
  });

  it("throws BookingNotCompletedError when booking is not completed", async () => {
    const s = setup();
    s.bookingRepo.bookings[0].status = "ACCEPTED";
    const useCase = new SubmitReviewUseCase(s.reviewRepo, s.bookingRepo, s.parentRepo, s.tutorRepo);

    await expect(useCase.execute({
      userId: "user-parent",
      data: { bookingId: "booking-1", studentId: "student-1", rating: 4 },
    })).rejects.toThrow(BookingNotCompletedError);
  });

  it("throws ReviewOwnershipError when booking parentId does not match parent", async () => {
    const s = setup();
    s.bookingRepo.bookings[0].parentId = "other-parent";
    const useCase = new SubmitReviewUseCase(s.reviewRepo, s.bookingRepo, s.parentRepo, s.tutorRepo);

    await expect(useCase.execute({
      userId: "user-parent",
      data: { bookingId: "booking-1", studentId: "student-1", rating: 4 },
    })).rejects.toThrow(ReviewOwnershipError);
  });

  it("throws DuplicateReviewError for duplicate review on same booking", async () => {
    const s = setup();
    const useCase = new SubmitReviewUseCase(s.reviewRepo, s.bookingRepo, s.parentRepo, s.tutorRepo);

    await useCase.execute({
      userId: "user-parent",
      data: { bookingId: "booking-1", studentId: "student-1", rating: 4 },
    });

    await expect(useCase.execute({
      userId: "user-parent",
      data: { bookingId: "booking-1", studentId: "student-1", rating: 5 },
    })).rejects.toThrow(DuplicateReviewError);
  });

  it("throws TutorNotFoundError when tutor does not exist", async () => {
    const s = setup();
    s.tutorRepo.tutors = [];
    const useCase = new SubmitReviewUseCase(s.reviewRepo, s.bookingRepo, s.parentRepo, s.tutorRepo);

    await expect(useCase.execute({
      userId: "user-parent",
      data: { bookingId: "booking-1", studentId: "student-1", rating: 4 },
    })).rejects.toThrow(TutorNotFoundError);
  });

  it("updates tutor rating after successful review", async () => {
    const s = setup();
    const useCase = new SubmitReviewUseCase(s.reviewRepo, s.bookingRepo, s.parentRepo, s.tutorRepo);

    // Moderate the review to PUBLISHED so it affects rating
    await useCase.execute({
      userId: "user-parent",
      data: { bookingId: "booking-1", studentId: "student-1", rating: 5 },
    });
    await s.reviewRepo.moderate(s.reviewRepo.reviews[0].id, "PUBLISHED", "admin");

    const rating = await s.reviewRepo.updateRating("tutor-1");
    expect(rating.averageRating).toBe(5);
    expect(rating.reviewCount).toBe(1);
  });
});

describe("ModerateReviewUseCase", () => {
  it("moderates a review status", async () => {
    const s = setup();
    const review = await s.reviewRepo.create({
      bookingId: "booking-1",
      parentId: "parent-1",
      studentId: "student-1",
      tutorId: "tutor-1",
      rating: 4,
    });

    const useCase = new ModerateReviewUseCase(s.reviewRepo);
    const result = await useCase.execute({ userId: "admin-user", data: { reviewId: review.id, status: "PUBLISHED" } });

    expect(result.status).toBe("PUBLISHED");
    expect(result.moderatedByUserId).toBe("admin-user");
  });

  it("throws ReviewNotFoundError for missing review", async () => {
    const s = setup();
    const useCase = new ModerateReviewUseCase(s.reviewRepo);

    await expect(useCase.execute({
      userId: "admin-user",
      data: { reviewId: "non-existent", status: "PUBLISHED" },
    })).rejects.toThrow(ReviewNotFoundError);
  });

  it("updates tutor rating when hiding a published review", async () => {
    const s = setup();

    // Create and publish a review
    const review = await s.reviewRepo.create({
      bookingId: "booking-1",
      parentId: "parent-1",
      studentId: "student-1",
      tutorId: "tutor-1",
      rating: 4,
    });
    await s.reviewRepo.moderate(review.id, "PUBLISHED", "admin");

    // Now hide it
    const useCase = new ModerateReviewUseCase(s.reviewRepo);
    await useCase.execute({ userId: "admin-user", data: { reviewId: review.id, status: "HIDDEN" } });

    const rating = await s.reviewRepo.updateRating("tutor-1");
    expect(rating.averageRating).toBe(0);
    expect(rating.reviewCount).toBe(0);
  });
});

describe("GetReviewUseCase", () => {
  it("gets a review by id for the owning parent", async () => {
    const s = setup();
    const review = await s.reviewRepo.create({
      bookingId: "booking-1",
      parentId: "parent-1",
      studentId: "student-1",
      tutorId: "tutor-1",
      rating: 4,
    });

    const useCase = new GetReviewUseCase(s.reviewRepo, s.parentRepo, s.tutorRepo);
    const result = await useCase.execute({ userId: "user-parent", reviewId: review.id });

    expect(result.id).toBe(review.id);
  });

  it("allows tutor access to their own reviewed booking", async () => {
    const s = setup();
    const review = await s.reviewRepo.create({
      bookingId: "booking-1",
      parentId: "parent-1",
      studentId: "student-1",
      tutorId: "tutor-1",
      rating: 4,
    });

    const useCase = new GetReviewUseCase(s.reviewRepo, s.parentRepo, s.tutorRepo);
    const result = await useCase.execute({ userId: "user-tutor", reviewId: review.id });

    expect(result.id).toBe(review.id);
  });

  it("throws ReviewNotFoundError for missing review", async () => {
    const s = setup();
    const useCase = new GetReviewUseCase(s.reviewRepo, s.parentRepo, s.tutorRepo);

    await expect(useCase.execute({ userId: "user-parent", reviewId: "non-existent" })).rejects.toThrow(ReviewNotFoundError);
  });

  it("throws ReviewOwnershipError when user is neither parent nor tutor", async () => {
    const s = setup();
    const review = await s.reviewRepo.create({
      bookingId: "booking-1",
      parentId: "parent-1",
      studentId: "student-1",
      tutorId: "tutor-1",
      rating: 4,
    });

    const useCase = new GetReviewUseCase(s.reviewRepo, s.parentRepo, s.tutorRepo);
    await expect(useCase.execute({ userId: "unrelated-user", reviewId: review.id })).rejects.toThrow(ReviewOwnershipError);
  });
});

describe("ListTutorReviewsUseCase", () => {
  it("lists reviews for a tutor", async () => {
    const s = setup();
    await s.reviewRepo.create({ bookingId: "b1", parentId: "p1", studentId: "s1", tutorId: "tutor-1", rating: 5 });
    await s.reviewRepo.create({ bookingId: "b2", parentId: "p2", studentId: "s2", tutorId: "tutor-1", rating: 4 });

    const useCase = new ListTutorReviewsUseCase(s.reviewRepo, s.tutorRepo);
    const result = await useCase.execute({ tutorId: "tutor-1" });

    expect(result).toHaveLength(2);
  });

  it("throws TutorNotFoundError for non-existent tutor", async () => {
    const s = setup();
    const useCase = new ListTutorReviewsUseCase(s.reviewRepo, s.tutorRepo);
    await expect(useCase.execute({ tutorId: "non-existent" })).rejects.toThrow(TutorNotFoundError);
  });

  it("filters by status and rating", async () => {
    const s = setup();
    const r1 = await s.reviewRepo.create({ bookingId: "b1", parentId: "p1", studentId: "s1", tutorId: "tutor-1", rating: 5 });
    const r2 = await s.reviewRepo.create({ bookingId: "b2", parentId: "p2", studentId: "s2", tutorId: "tutor-1", rating: 4 });
    await s.reviewRepo.moderate(r1.id, "PUBLISHED", "admin");
    await s.reviewRepo.moderate(r2.id, "PUBLISHED", "admin");

    const useCase = new ListTutorReviewsUseCase(s.reviewRepo, s.tutorRepo);
    const filtered = await useCase.execute({ tutorId: "tutor-1", query: { status: "PUBLISHED", rating: 4 } });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].rating).toBe(4);
  });
});

describe("ListMyReviewsUseCase", () => {
  it("lists reviews made by the current parent", async () => {
    const s = setup();
    await s.reviewRepo.create({ bookingId: "b1", parentId: "parent-1", studentId: "s1", tutorId: "t1", rating: 5 });
    await s.reviewRepo.create({ bookingId: "b2", parentId: "parent-1", studentId: "s2", tutorId: "t2", rating: 3 });

    const useCase = new ListMyReviewsUseCase(s.reviewRepo, s.parentRepo);
    const result = await useCase.execute({ userId: "user-parent" });

    expect(result).toHaveLength(2);
  });

  it("throws ParentNotFoundError when parent profile is missing", async () => {
    const s = setup();
    const useCase = new ListMyReviewsUseCase(s.reviewRepo, s.parentRepo);
    await expect(useCase.execute({ userId: "non-existent" })).rejects.toThrow(ParentNotFoundError);
  });
});

describe("ListPendingModerationReviewsUseCase", () => {
  it("lists only pending reviews", async () => {
    const s = setup();
    await s.reviewRepo.create({ bookingId: "b1", parentId: "p1", studentId: "s1", tutorId: "t1", rating: 5 });
    const r2 = await s.reviewRepo.create({ bookingId: "b2", parentId: "p2", studentId: "s2", tutorId: "t2", rating: 4 });
    await s.reviewRepo.moderate(r2.id, "PUBLISHED", "admin");

    const useCase = new ListPendingModerationReviewsUseCase(s.reviewRepo);
    const result = await useCase.execute({ userId: "admin-user" });

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("PENDING");
  });
});

describe("GetTutorRatingSummaryUseCase", () => {
  it("calculates average rating and distribution from published reviews", async () => {
    const s = setup();

    // Create reviews
    const r1 = await s.reviewRepo.create({ bookingId: "b1", parentId: "p1", studentId: "s1", tutorId: "tutor-1", rating: 5 });
    const r2 = await s.reviewRepo.create({ bookingId: "b2", parentId: "p2", studentId: "s2", tutorId: "tutor-1", rating: 4 });
    const r3 = await s.reviewRepo.create({ bookingId: "b3", parentId: "p3", studentId: "s3", tutorId: "tutor-1", rating: 5 });

    // Publish all
    await s.reviewRepo.moderate(r1.id, "PUBLISHED", "admin");
    await s.reviewRepo.moderate(r2.id, "PUBLISHED", "admin");
    await s.reviewRepo.moderate(r3.id, "PUBLISHED", "admin");

    const useCase = new GetTutorRatingSummaryUseCase(s.reviewRepo, s.tutorRepo);
    const summary = await useCase.execute({ tutorId: "tutor-1" });

    expect(summary.averageRating).toBe(4.67);
    expect(summary.reviewCount).toBe(3);
    expect(summary.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 2 });
  });

  it("returns zero rating when no published reviews exist", async () => {
    const s = setup();
    await s.reviewRepo.create({ bookingId: "b1", parentId: "p1", studentId: "s1", tutorId: "tutor-1", rating: 5 });

    const useCase = new GetTutorRatingSummaryUseCase(s.reviewRepo, s.tutorRepo);
    const summary = await useCase.execute({ tutorId: "tutor-1" });

    expect(summary.averageRating).toBe(0);
    expect(summary.reviewCount).toBe(0);
    expect(summary.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  it("throws TutorNotFoundError for non-existent tutor", async () => {
    const s = setup();
    const useCase = new GetTutorRatingSummaryUseCase(s.reviewRepo, s.tutorRepo);
    await expect(useCase.execute({ tutorId: "non-existent" })).rejects.toThrow(TutorNotFoundError);
  });
});