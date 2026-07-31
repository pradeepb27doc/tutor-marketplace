import { describe, expect, it } from "vitest";
import {
  ApproveRefundUseCase,
  BookingNotPayableError,
  CapturePaymentUseCase,
  CancelPaymentUseCase,
  CreatePaymentOrderUseCase,
  GetPaymentHistoryUseCase,
  GetPaymentSummaryUseCase,
  GetRefundStatusUseCase,
  GetPaymentUseCase,
  IdempotencyKeyConflictError,
  InitiateRefundUseCase,
  InvalidPaymentStatusError,
  ListAllPaymentsUseCase,
  ListParentPaymentsUseCase,
  ListRefundsUseCase,
  PaymentCaptureError,
  PaymentGatewayRegistry,
  PaymentOwnershipError,
  PaymentVerificationError,
  ProcessPaymentWebhookUseCase,
  RejectRefundUseCase,
  RetryPaymentUseCase,
  VerifyPaymentUseCase,
  assertRefundAmountValid,
  isAllowedPaymentTransition,
  isFullRefund,
} from "./index.js";
import {
  FakeBookingRepository,
  FakeClock,
  FakeParentProfileRepository,
  FakePaymentGateway,
  FakePaymentRepository,
  buildBookingRecord,
  buildParentRecord,
} from "@tutor-marketplace/testing";
import type { PaymentRecord } from "./payment.repository.js";

function payment(overrides: Partial<PaymentRecord> = {}): PaymentRecord {
  const now = new Date("2026-07-14T00:00:00Z");
  return {
    id: "payment-1",
    bookingId: "booking-1",
    parentId: "parent-1",
    provider: "RAZORPAY",
    status: "PENDING",
    amount: 50000,
    platformFeeAmount: 5000,
    currency: "INR",
    providerOrderId: "order-1",
    providerPaymentId: null,
    idempotencyKey: null,
    authorizedAt: null,
    capturedAt: null,
    failedAt: null,
    failureReason: null,
    metadata: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function setup() {
  const clock = new FakeClock(new Date("2026-07-14T00:00:00Z"));
  const paymentRepo = new FakePaymentRepository();
  const bookingRepo = new FakeBookingRepository();
  const parentRepo = new FakeParentProfileRepository();
  const gateway = new FakePaymentGateway();
  const registry = new PaymentGatewayRegistry();
  registry.register(gateway);
  const parent = buildParentRecord({ id: "parent-1", userId: "parent-user-1" });
  parentRepo.parents.push(parent);
  bookingRepo.bookings.push(buildBookingRecord({ id: "booking-1", parentId: parent.id, status: "PENDING_PAYMENT", priceAmount: "500.00", platformFeeAmount: "50.00" } as any));
  return { clock, paymentRepo, bookingRepo, parentRepo, gateway, registry, parent };
}

describe("payment business rules", () => {
  it("validates transitions and refund amounts", () => {
    expect(isAllowedPaymentTransition("PENDING", "AUTHORIZED")).toBe(true);
    expect(isAllowedPaymentTransition("CAPTURED", "AUTHORIZED")).toBe(false);
    expect(isFullRefund(50000, 50000)).toBe(true);
    expect(() => assertRefundAmountValid(50000, 10000, 40000)).not.toThrow();
    expect(() => assertRefundAmountValid(50000, 10000, 40001)).toThrow("Refund amount exceeds available captured amount");
    expect(() => assertRefundAmountValid(50000, 0, 0)).toThrow("Refund amount must be greater than zero");
  });
});

describe("CreatePaymentOrderUseCase", () => {
  it("creates a gateway order, payment record, and order transaction", async () => {
    const s = setup();
    const result = await new CreatePaymentOrderUseCase(s.paymentRepo, s.bookingRepo, s.parentRepo, s.registry, s.clock).execute({ userId: s.parent.userId, data: { bookingId: "booking-1", idempotencyKey: "idem-1" } });
    expect(result.amount).toBe(50000);
    expect(result.provider).toBe("RAZORPAY");
    expect(s.gateway.createdOrders[0]).toMatchObject({ amount: 50000, currency: "INR", receipt: expect.any(String), idempotencyKey: "idem-1" });
    expect(s.paymentRepo.payments[0]).toMatchObject({ bookingId: "booking-1", parentId: s.parent.id, amount: 50000, platformFeeAmount: 5000, idempotencyKey: "idem-1" });
    expect(s.paymentRepo.transactions[0]).toMatchObject({ eventType: "ORDER_CREATED", status: "PENDING", amount: 50000 });
  });

  it("enforces idempotency, ownership, and payable booking status", async () => {
    const s = setup();
    s.paymentRepo.payments.push(payment({ idempotencyKey: "idem-1" }));
    const useCase = new CreatePaymentOrderUseCase(s.paymentRepo, s.bookingRepo, s.parentRepo, s.registry, s.clock);
    await expect(useCase.execute({ userId: s.parent.userId, data: { bookingId: "booking-1", idempotencyKey: "idem-1" } })).rejects.toThrow(IdempotencyKeyConflictError);
    await expect(useCase.execute({ userId: "missing-parent", data: { bookingId: "booking-1" } })).rejects.toThrow(PaymentOwnershipError);
    s.bookingRepo.bookings[0].parentId = "other-parent";
    await expect(useCase.execute({ userId: s.parent.userId, data: { bookingId: "booking-1" } })).rejects.toThrow(PaymentOwnershipError);
    s.bookingRepo.bookings[0].parentId = s.parent.id;
    s.bookingRepo.bookings[0].status = "ACCEPTED";
    await expect(useCase.execute({ userId: s.parent.userId, data: { bookingId: "booking-1" } })).rejects.toThrow(BookingNotPayableError);
  });
});

describe("payment verification, capture, and retry", () => {
  it("verifies payment, authorizes it, and updates booking status", async () => {
    const s = setup();
    s.paymentRepo.payments.push(payment());
    const result = await new VerifyPaymentUseCase(s.paymentRepo, s.bookingRepo, s.parentRepo, s.registry, s.clock).execute({ userId: s.parent.userId, paymentId: "payment-1", data: { providerOrderId: "order-1", providerPaymentId: "pay-1", signature: "sig" } });
    expect(result.status).toBe("AUTHORIZED");
    expect(result.providerPaymentId).toBe("pay-1");
    expect(s.bookingRepo.bookings[0].status).toBe("PAYMENT_AUTHORIZED");
    expect(s.paymentRepo.transactions.at(-1)).toMatchObject({ eventType: "PAYMENT_AUTHORIZED", status: "AUTHORIZED" });
  });

  it("marks failed on verification failure", async () => {
    const s = setup();
    s.gateway.nextVerificationResult = false;
    s.paymentRepo.payments.push(payment());
    await expect(new VerifyPaymentUseCase(s.paymentRepo, s.bookingRepo, s.parentRepo, s.registry, s.clock).execute({ userId: s.parent.userId, paymentId: "payment-1", data: { providerOrderId: "order-1", providerPaymentId: "pay-1", signature: "bad" } })).rejects.toThrow(PaymentVerificationError);
    expect(s.paymentRepo.payments[0]).toMatchObject({ status: "FAILED", failureReason: "Signature verification failed" });
    expect(s.paymentRepo.transactions.at(-1)).toMatchObject({ eventType: "VERIFICATION_FAILED", status: "FAILED" });
  });

  it("captures authorized payment and records capture failure", async () => {
    const s = setup();
    s.paymentRepo.payments.push(payment({ status: "AUTHORIZED", providerPaymentId: "pay-1" }));
    const result = await new CapturePaymentUseCase(s.paymentRepo, s.registry, s.clock).execute({ userId: "admin-user", paymentId: "payment-1" });
    expect(result.status).toBe("CAPTURED");
    expect(s.paymentRepo.transactions.at(-1)).toMatchObject({ eventType: "PAYMENT_CAPTURED", status: "CAPTURED" });

    const s2 = setup();
    s2.gateway.nextCaptureResult = false;
    s2.paymentRepo.payments.push(payment({ status: "AUTHORIZED", providerPaymentId: "pay-1" }));
    await expect(new CapturePaymentUseCase(s2.paymentRepo, s2.registry, s2.clock).execute({ userId: "admin-user", paymentId: "payment-1" })).rejects.toThrow(PaymentCaptureError);
    expect(s2.paymentRepo.transactions.at(-1)).toMatchObject({ eventType: "CAPTURE_FAILED", status: "FAILED" });
  });

  it("retries payment by cancelling pending/failed attempts and creating a new order", async () => {
    const s = setup();
    s.paymentRepo.payments.push(payment({ id: "payment-pending", status: "PENDING" }), payment({ id: "payment-failed", status: "FAILED" }), payment({ id: "payment-captured", status: "CAPTURED" }));
    const result = await new RetryPaymentUseCase(s.paymentRepo, s.bookingRepo, s.parentRepo, s.registry, s.clock).execute({ userId: s.parent.userId, bookingId: "booking-1", data: { bookingId: "booking-1", idempotencyKey: "retry-1" } });
    expect(result.status).toBe("PENDING");
    expect(s.paymentRepo.payments.find((p) => p.id === "payment-pending")?.status).toBe("CANCELLED");
    expect(s.paymentRepo.payments.find((p) => p.id === "payment-failed")?.status).toBe("CANCELLED");
    expect(s.paymentRepo.payments.find((p) => p.id === "payment-captured")?.status).toBe("CAPTURED");
    expect(s.paymentRepo.transactions.filter((t) => t.eventType === "PAYMENT_CANCELLED")).toHaveLength(2);
  });
});

describe("refunds and summaries", () => {
  it("initiates, approves full refund, updates payment and booking", async () => {
    const s = setup();
    s.bookingRepo.bookings[0].status = "CANCELLED_BY_PARENT";
    s.paymentRepo.payments.push(payment({ status: "CAPTURED", providerPaymentId: "pay-1" }));
    const initiated = await new InitiateRefundUseCase(s.paymentRepo, s.bookingRepo, s.clock).execute({ userId: "admin-user", data: { bookingId: "booking-1", amount: 50000, reason: "cancelled" } });
    expect(initiated.status).toBe("REQUESTED");
    expect(s.paymentRepo.transactions.at(-1)).toMatchObject({ eventType: "REFUND_INITIATED", status: "REQUESTED" });

    const approved = await new ApproveRefundUseCase(s.paymentRepo, s.bookingRepo, s.registry, s.clock).execute({ userId: "admin-user", refundId: initiated.id });
    expect(approved.status).toBe("PROCESSED");
    expect(approved.providerRefundId).toContain("provider-refund");
    expect(s.paymentRepo.payments[0].status).toBe("REFUNDED");
    expect(s.bookingRepo.bookings[0].status).toBe("REFUNDED");
  });

  it("supports partial refund approval and refund rejection", async () => {
    const s = setup();
    s.bookingRepo.bookings[0].status = "COMPLETED";
    const capturedPayment = payment({ id: "cap-payment", status: "CAPTURED", providerPaymentId: "pay-1" });
    s.paymentRepo.payments.push(capturedPayment);
    const partial = await new InitiateRefundUseCase(s.paymentRepo, s.bookingRepo, s.clock).execute({ userId: "admin-user", data: { bookingId: "booking-1", amount: 10000, reason: "partial" } });
    await new ApproveRefundUseCase(s.paymentRepo, s.bookingRepo, s.registry, s.clock).execute({ userId: "admin-user", refundId: partial.id });
    expect(s.paymentRepo.payments[0].status).toBe("PARTIALLY_REFUNDED");
    expect(s.bookingRepo.bookings[0].status).toBe("COMPLETED");

    // Add a second captured payment so a further partial refund can be initiated.
    s.paymentRepo.payments.push(payment({ id: "cap-payment-2", status: "CAPTURED", providerPaymentId: "pay-2", amount: 20000 }));
    const second = await new InitiateRefundUseCase(s.paymentRepo, s.bookingRepo, s.clock).execute({ userId: "admin-user", data: { bookingId: "booking-1", amount: 5000, reason: "denied" } });
    const rejected = await new RejectRefundUseCase(s.paymentRepo).execute({ userId: "admin-user", refundId: second.id });
    expect(rejected.status).toBe("REJECTED");
  });

  it("rejects invalid refund and invalid payment statuses", async () => {
    const s = setup();
    await expect(new InitiateRefundUseCase(s.paymentRepo, s.bookingRepo, s.clock).execute({ userId: "admin-user", data: { bookingId: "booking-1", amount: 1000 } })).rejects.toThrow(BookingNotPayableError);
    s.bookingRepo.bookings[0].status = "COMPLETED";
    await expect(new InitiateRefundUseCase(s.paymentRepo, s.bookingRepo, s.clock).execute({ userId: "admin-user", data: { bookingId: "booking-1", amount: 1000 } })).rejects.toThrow("No captured payment to refund");

    s.paymentRepo.payments.push(payment({ status: "PENDING" }));
    await expect(new CapturePaymentUseCase(s.paymentRepo, s.registry, s.clock).execute({ userId: "admin-user", paymentId: "payment-1" })).rejects.toThrow(InvalidPaymentStatusError);
  });

  it("returns payment summary totals", async () => {
    const s = setup();
    s.paymentRepo.payments.push(payment({ id: "p1", status: "CAPTURED", amount: 50000 }), payment({ id: "p2", status: "PENDING", amount: 25000 }), payment({ id: "p3", status: "PARTIALLY_REFUNDED", amount: 20000 }));
    s.paymentRepo.refunds.push({ id: "r1", paymentId: "p1", bookingId: "booking-1", requestedByUserId: "admin", approvedByUserId: "admin", status: "PROCESSED", amount: 10000, currency: "INR", reason: null, providerRefundId: "refund-1", processedAt: new Date(), createdAt: new Date(), updatedAt: new Date() });
    const summary = await new GetPaymentSummaryUseCase(s.paymentRepo).execute({ userId: "admin-user" });
    expect(summary).toMatchObject({ totalPayments: 3, totalCapturedAmount: 50000, totalRefundedAmount: 10000, pendingCount: 1, capturedCount: 1, partiallyRefundedCount: 1 });
  });
});

describe("payment queries", () => {
  it("gets payment with transactions and enforces ownership", async () => {
    const s = setup();
    s.paymentRepo.payments.push(payment({ id: "payment-1", status: "AUTHORIZED" }));
    await s.paymentRepo.addTransaction({ paymentId: "payment-1", provider: "RAZORPAY", eventType: "ORDER_CREATED", status: "PENDING", amount: 50000 });

    const result = await new GetPaymentUseCase(s.paymentRepo, s.bookingRepo, s.parentRepo).execute({ userId: s.parent.userId, paymentId: "payment-1" });
    expect(result.id).toBe("payment-1");
    expect(result.transactions).toHaveLength(1);

    s.paymentRepo.payments[0].parentId = "other-parent";
    await expect(new GetPaymentUseCase(s.paymentRepo, s.bookingRepo, s.parentRepo).execute({ userId: s.parent.userId, paymentId: "payment-1" })).rejects.toThrow(PaymentOwnershipError);
  });

  it("lists parent payments with filters", async () => {
    const s = setup();
    s.paymentRepo.payments.push(
      payment({ id: "p1", parentId: s.parent.id, status: "PENDING", amount: 10000 }),
      payment({ id: "p2", parentId: s.parent.id, status: "CAPTURED", amount: 20000 }),
    );

    const all = await new ListParentPaymentsUseCase(s.paymentRepo, s.parentRepo).execute({ userId: s.parent.userId });
    expect(all).toHaveLength(2);

    const filtered = await new ListParentPaymentsUseCase(s.paymentRepo, s.parentRepo).execute({ userId: s.parent.userId, query: { status: "CAPTURED" } });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("p2");
  });

  it("lists all payments (admin) with filters", async () => {
    const s = setup();
    s.paymentRepo.payments.push(
      payment({ id: "p1", status: "PENDING", amount: 10000 }),
      payment({ id: "p2", status: "CAPTURED", amount: 20000 }),
    );

    const all = await new ListAllPaymentsUseCase(s.paymentRepo).execute({ userId: "admin-user" });
    expect(all).toHaveLength(2);

    const filtered = await new ListAllPaymentsUseCase(s.paymentRepo).execute({ userId: "admin-user", query: { status: "CAPTURED" } });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("p2");
  });

  it("gets payment history", async () => {
    const s = setup();
    s.paymentRepo.payments.push(payment({ id: "p1" }));
    await s.paymentRepo.addTransaction({ paymentId: "p1", provider: "RAZORPAY", eventType: "ORDER_CREATED", status: "PENDING" });
    await s.paymentRepo.addTransaction({ paymentId: "p1", provider: "RAZORPAY", eventType: "PAYMENT_AUTHORIZED", status: "AUTHORIZED" });

    const history = await new GetPaymentHistoryUseCase(s.paymentRepo).execute({ userId: s.parent.userId, paymentId: "p1" });
    expect(history).toHaveLength(2);
    expect(history[0].eventType).toBe("ORDER_CREATED");
    expect(history[1].eventType).toBe("PAYMENT_AUTHORIZED");
  });

  it("gets refund status and lists refunds", async () => {
    const s = setup();
    s.paymentRepo.payments.push(payment({ id: "p1" }));
    const refund = await s.paymentRepo.createRefund({ paymentId: "p1", bookingId: "booking-1", requestedByUserId: "admin", amount: 10000 });

    const status = await new GetRefundStatusUseCase(s.paymentRepo).execute({ userId: "admin-user", refundId: refund.id });
    expect(status.id).toBe(refund.id);

    const byBooking = await new ListRefundsUseCase(s.paymentRepo).execute({ userId: "admin-user", query: { bookingId: "booking-1" } });
    expect(byBooking).toHaveLength(1);

    const byPayment = await new ListRefundsUseCase(s.paymentRepo).execute({ userId: "admin-user", query: { paymentId: "p1" } });
    expect(byPayment).toHaveLength(1);
  });

  it("processes webhook idempotently and records event", async () => {
    const s = setup();
    const payload = { eventId: "evt-1", eventType: "payment.captured", paymentId: "pay-1", amount: 50000 };
    
    await new ProcessPaymentWebhookUseCase(s.paymentRepo, s.registry, s.clock).execute({
      provider: "RAZORPAY",
      payload,
      signature: "valid-secret",
      webhookSecret: "secret",
      generateId: () => "generated-id",
    });

    expect(s.paymentRepo.webhooks).toHaveLength(1);
    expect(s.paymentRepo.transactions).toHaveLength(1);
    expect(s.paymentRepo.transactions[0].eventType).toBe("payment.captured");

    // Idempotency: second call should not duplicate
    await new ProcessPaymentWebhookUseCase(s.paymentRepo, s.registry, s.clock).execute({
      provider: "RAZORPAY",
      payload,
      signature: "valid-secret",
      webhookSecret: "secret",
      generateId: () => "generated-id-2",
    });
    expect(s.paymentRepo.webhooks).toHaveLength(1);
  });

  it("cancels pending/authorized/failed payments", async () => {
    const s = setup();
    s.paymentRepo.payments.push(payment({ id: "p1", status: "PENDING" }), payment({ id: "p2", status: "AUTHORIZED" }), payment({ id: "p3", status: "FAILED" }));

    const cancelled = await new CancelPaymentUseCase(s.paymentRepo, s.clock).execute({ userId: "admin-user", paymentId: "p1" });
    expect(cancelled.status).toBe("CANCELLED");

    await new CancelPaymentUseCase(s.paymentRepo, s.clock).execute({ userId: "admin-user", paymentId: "p2" });
    expect(s.paymentRepo.payments.find((p) => p.id === "p2")?.status).toBe("CANCELLED");

    await new CancelPaymentUseCase(s.paymentRepo, s.clock).execute({ userId: "admin-user", paymentId: "p3" });
    expect(s.paymentRepo.payments.find((p) => p.id === "p3")?.status).toBe("CANCELLED");

    await expect(new CancelPaymentUseCase(s.paymentRepo, s.clock).execute({ userId: "admin-user", paymentId: "p1" })).rejects.toThrow(InvalidPaymentStatusError);
  });
});
