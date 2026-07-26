 export class PaymentNotFoundError extends Error {
  constructor() {
    super("Payment not found");
    this.name = "PaymentNotFoundError";
  }
}

export class PaymentOwnershipError extends Error {
  constructor() {
    super("Payment does not belong to the requesting user");
    this.name = "PaymentOwnershipError";
  }
}

export class InvalidPaymentStatusError extends Error {
  constructor(expected: string, actual: string) {
    super(`Payment status must be '${expected}' but was '${actual}'`);
    this.name = "InvalidPaymentStatusError";
  }
}

export class PaymentVerificationError extends Error {
  constructor(message = "Payment verification failed") {
    super(message);
    this.name = "PaymentVerificationError";
  }
}

export class PaymentCaptureError extends Error {
  constructor(message = "Payment capture failed") {
    super(message);
    this.name = "PaymentCaptureError";
  }
}

export class RefundProcessingError extends Error {
  constructor(message = "Refund processing failed") {
    super(message);
    this.name = "RefundProcessingError";
  }
}

export class RefundNotAllowedError extends Error {
  constructor(message = "Refund is not allowed for this booking") {
    super(message);
    this.name = "RefundNotAllowedError";
  }
}

export class RefundAmountExceededError extends Error {
  constructor(message = "Refund amount exceeds captured amount") {
    super(message);
    this.name = "RefundAmountExceededError";
  }
}

export class IdempotencyKeyConflictError extends Error {
  constructor() {
    super("A payment order with this idempotency key already exists");
    this.name = "IdempotencyKeyConflictError";
  }
}

export class BookingNotPayableError extends Error {
  constructor(message = "Booking is not in a payable state") {
    super(message);
    this.name = "BookingNotPayableError";
  }
}