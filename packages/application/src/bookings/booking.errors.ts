export class BookingNotFoundError extends Error {
  constructor() {
    super("Booking not found");
    this.name = "BookingNotFoundError";
  }
}

export class BookingOwnershipError extends Error {
  constructor() {
    super("Booking does not belong to the requesting user");
    this.name = "BookingOwnershipError";
  }
}

export class InvalidBookingStatusError extends Error {
  constructor(expected: string, actual: string) {
    super(`Booking status must be '${expected}' but was '${actual}'`);
    this.name = "InvalidBookingStatusError";
  }
}

export class SlotNotFoundError extends Error {
  constructor() {
    super("Availability slot not found");
    this.name = "SlotNotFoundError";
  }
}

export class SlotNotAvailableError extends Error {
  constructor() {
    super("Availability slot is not available for booking");
    this.name = "SlotNotAvailableError";
  }
}

export class SlotAlreadyReservedError extends Error {
  constructor() {
    super("Availability slot has already been reserved or booked");
    this.name = "SlotAlreadyReservedError";
  }
}

export class SlotExpiredError extends Error {
  constructor() {
    super("Availability slot has expired");
    this.name = "SlotExpiredError";
  }
}

export class StudentOwnershipError extends Error {
  constructor() {
    super("Student does not belong to the requesting parent");
    this.name = "StudentOwnershipError";
  }
}

export class SubjectNotOfferedByTutorError extends Error {
  constructor() {
    super("The selected subject is not offered by this tutor");
    this.name = "SubjectNotOfferedByTutorError";
  }
}

export class OverlappingBookingError extends Error {
  constructor() {
    super("This time slot overlaps with an existing booking");
    this.name = "OverlappingBookingError";
  }
}

export class CancellationWindowExceededError extends Error {
  constructor() {
    super("Cannot cancel a booking after the session start time");
    this.name = "CancellationWindowExceededError";
  }
}

export class BookingCannotBeCompletedError extends Error {
  constructor() {
    super("Booking cannot be completed before the session end time");
    this.name = "BookingCannotBeCompletedError";
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