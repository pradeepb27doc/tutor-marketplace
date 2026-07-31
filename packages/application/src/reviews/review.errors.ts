export class ReviewNotFoundError extends Error {
  constructor() {
    super("Review not found");
    this.name = "ReviewNotFoundError";
  }
}

export class ReviewOwnershipError extends Error {
  constructor() {
    super("Review does not belong to the requesting user");
    this.name = "ReviewOwnershipError";
  }
}

export class DuplicateReviewError extends Error {
  constructor() {
    super("A review for this booking has already been submitted");
    this.name = "DuplicateReviewError";
  }
}

export class InvalidRatingError extends Error {
  constructor(rating: number) {
    super(`Rating must be between 1 and 5, but got ${rating}`);
    this.name = "InvalidRatingError";
  }
}

export class BookingNotCompletedError extends Error {
  constructor() {
    super("Cannot review a booking that has not been completed");
    this.name = "BookingNotCompletedError";
  }
}

export class TutorNotFoundError extends Error {
  constructor() {
    super("Tutor not found");
    this.name = "TutorNotFoundError";
  }
}

export class ParentNotFoundError extends Error {
  constructor() {
    super("Parent profile not found");
    this.name = "ParentNotFoundError";
  }
}

export class StudentNotFoundError extends Error {
  constructor() {
    super("Student not found");
    this.name = "StudentNotFoundError";
  }
}

export class BookingNotFoundError extends Error {
  constructor() {
    super("Booking not found");
    this.name = "BookingNotFoundError";
  }
}