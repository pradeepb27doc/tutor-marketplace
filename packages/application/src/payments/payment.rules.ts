// Payment business rules and status transitions.

export const PAYMENT_STATUSES = {
  PENDING: "PENDING",
  AUTHORIZED: "AUTHORIZED",
  CAPTURED: "CAPTURED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
} as const;

export const REFUND_STATUSES = {
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
  PROCESSING: "PROCESSING",
  PROCESSED: "PROCESSED",
  FAILED: "FAILED",
  REJECTED: "REJECTED",
} as const;

// Allowed payment status transitions.
const PAYMENT_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["AUTHORIZED", "FAILED", "CANCELLED"],
  AUTHORIZED: ["CAPTURED", "FAILED", "CANCELLED"],
  CAPTURED: ["REFUNDED", "PARTIALLY_REFUNDED"],
  FAILED: ["PENDING", "CANCELLED"],
  CANCELLED: ["PENDING"],
  REFUNDED: [],
  PARTIALLY_REFUNDED: ["REFUNDED"],
};

export function isAllowedPaymentTransition(from: string, to: string): boolean {
  return PAYMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertPaymentTransition(from: string, to: string): void {
  if (!isAllowedPaymentTransition(from, to)) {
    throw new Error(`Illegal payment status transition: ${from} -> ${to}`);
  }
}

// Booking must be in PENDING_PAYMENT to start a payment order.
export const PAYABLE_BOOKING_STATUSES = ["PENDING_PAYMENT"] as const;

// Bookings eligible for refund (captured payments exist).
export const REFUNDABLE_BOOKING_STATUSES = [
  "CANCELLED_BY_PARENT",
  "CANCELLED_BY_TUTOR",
  "CANCELLED_BY_ADMIN",
  "COMPLETED",
  "REFUNDED",
] as const;

// Event types recorded in payment history.
export const PAYMENT_EVENTS = {
  ORDER_CREATED: "ORDER_CREATED",
  PAYMENT_AUTHORIZED: "PAYMENT_AUTHORIZED",
  VERIFICATION_FAILED: "VERIFICATION_FAILED",
  PAYMENT_CAPTURED: "PAYMENT_CAPTURED",
  CAPTURE_FAILED: "CAPTURE_FAILED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_CANCELLED: "PAYMENT_CANCELLED",
  REFUND_INITIATED: "REFUND_INITIATED",
  REFUND_PROCESSED: "REFUND_PROCESSED",
  REFUND_FAILED: "REFUND_FAILED",
  REFUND_REJECTED: "REFUND_REJECTED",
} as const;

// Refund window: 30 days from booking start.
export const REFUND_WINDOW_DAYS = 30;

/**
 * Validate refund eligibility against captured total and existing refunds.
 * All amounts in integer minor units.
 */
export function assertRefundAmountValid(
  capturedAmount: number,
  existingRefundedAmount: number,
  requestedAmount: number,
): void {
  const available = capturedAmount - existingRefundedAmount;
  if (requestedAmount <= 0) {
    throw new Error("Refund amount must be greater than zero");
  }
  if (requestedAmount > available) {
    throw new Error("Refund amount exceeds available captured amount");
  }
}

export function isFullRefund(capturedAmount: number, refundedAmount: number): boolean {
  return refundedAmount >= capturedAmount;
}