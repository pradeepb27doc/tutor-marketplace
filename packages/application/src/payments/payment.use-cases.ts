import type { UseCase, Clock } from "../index.js";
import type { PaymentRepository } from "./payment.repository.js";
import type {
  PaymentGatewayRegistry,
} from "./payment.gateway.js";
import type {
  CreatePaymentOrderInput,
  VerifyPaymentInput,
  InitiateRefundInput,
  PaymentQueryInput,
  RefundQueryInput,
  PaymentOrderDto,
  PaymentDto,
  PaymentWithTransactionsDto,
  PaymentTransactionDto,
  RefundDto,
  PaymentSummaryDto,
} from "./payment.dtos.js";
import { toPaymentOrderDto, toPaymentDto, toPaymentWithTransactionsDto, toRefundDto, toPaymentSummaryDto } from "./payment.dtos.js";
import {
  PaymentNotFoundError,
  PaymentOwnershipError,
  InvalidPaymentStatusError,
  PaymentVerificationError,
  PaymentCaptureError,
  RefundAmountExceededError,
  IdempotencyKeyConflictError,
  BookingNotPayableError,
} from "./payment.errors.js";
import {
  PAYMENT_EVENTS,
  PAYABLE_BOOKING_STATUSES,
  REFUNDABLE_BOOKING_STATUSES,
  assertRefundAmountValid,
  isFullRefund,
} from "./payment.rules.js";
import type { ParentRepository } from "../index.js";
import type { BookingRepository } from "../bookings/booking.repository.js";

const DEFAULT_PROVIDER = "RAZORPAY";

function toPaise(decimalString: string | null | undefined): number {
  if (!decimalString) return 0;
  return Math.round(parseFloat(decimalString) * 100);
}

// --- 1. Create Payment Order ---

export class CreatePaymentOrderUseCase
  implements UseCase<{ userId: string; data: CreatePaymentOrderInput }, PaymentOrderDto>
{
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly bookingRepo: BookingRepository,
    private readonly parentRepo: ParentRepository,
    private readonly gatewayRegistry: PaymentGatewayRegistry,
    private readonly clock: Clock,
  ) {}

  async execute(input: { userId: string; data: CreatePaymentOrderInput }): Promise<PaymentOrderDto> {
    const { userId, data } = input;
    const provider = data.provider ?? DEFAULT_PROVIDER;

    if (data.idempotencyKey) {
      const existing = await this.paymentRepo.findByIdempotencyKey(data.idempotencyKey);
      if (existing) throw new IdempotencyKeyConflictError();
    }

    const parent = await this.parentRepo.findByUserId(userId);
    if (!parent) throw new PaymentOwnershipError();

    const booking = await this.bookingRepo.findById(data.bookingId);
    if (!booking) throw new BookingNotPayableError("Booking not found");
    if (booking.parentId !== parent.id) throw new PaymentOwnershipError();
    if (!PAYABLE_BOOKING_STATUSES.includes(booking.status as any)) {
      throw new BookingNotPayableError(`Booking status is ${booking.status}`);
    }

    const gateway = this.gatewayRegistry.get(provider);
    const amountPaise = toPaise(booking.priceAmount);
    const feePaise = toPaise(booking.platformFeeAmount);

    const order = await gateway.createOrder({
      amount: amountPaise,
      currency: booking.currency,
      receipt: booking.publicId,
      notes: { bookingId: booking.id, parentId: booking.parentId },
      idempotencyKey: data.idempotencyKey,
    });

    const payment = await this.paymentRepo.create({
      bookingId: booking.id,
      parentId: booking.parentId,
      provider,
      amount: amountPaise,
      platformFeeAmount: feePaise,
      currency: booking.currency,
      idempotencyKey: data.idempotencyKey ?? null,
      providerOrderId: order.providerOrderId,
    });

    await this.paymentRepo.addTransaction({
      paymentId: payment.id,
      provider,
      providerEventId: order.providerOrderId,
      eventType: PAYMENT_EVENTS.ORDER_CREATED,
      status: "PENDING",
      amount: amountPaise,
      payload: order.gatewayData,
    });

    return toPaymentOrderDto(payment, order.gatewayData);
  }
}

// --- 2. Verify Payment ---

export class VerifyPaymentUseCase
  implements UseCase<{ userId: string; paymentId: string; data: VerifyPaymentInput }, PaymentDto>
{
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly bookingRepo: BookingRepository,
    private readonly parentRepo: ParentRepository,
    private readonly gatewayRegistry: PaymentGatewayRegistry,
    private readonly clock: Clock,
  ) {}

  async execute(input: { userId: string; paymentId: string; data: VerifyPaymentInput }): Promise<PaymentDto> {
    const { userId, paymentId, data } = input;
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new PaymentNotFoundError();
    if (payment.status !== "PENDING") {
      throw new InvalidPaymentStatusError("PENDING", payment.status);
    }

    const parent = await this.parentRepo.findByUserId(userId);
    if (!parent || payment.parentId !== parent.id) throw new PaymentOwnershipError();

    const gateway = this.gatewayRegistry.get(payment.provider);
    const result = await gateway.verifyPayment({
      providerOrderId: data.providerOrderId,
      providerPaymentId: data.providerPaymentId,
      signature: data.signature,
    });

    if (!result.verified) {
      await this.paymentRepo.transaction(async (repo) => {
        await repo.updateStatus(paymentId, "FAILED", {
          failedAt: this.clock.now(),
          failureReason: "Signature verification failed",
        });
        await repo.addTransaction({
          paymentId,
          provider: payment.provider,
          providerEventId: data.providerPaymentId,
          eventType: PAYMENT_EVENTS.VERIFICATION_FAILED,
          status: "FAILED",
        });
      });
      throw new PaymentVerificationError();
    }

    const updated = await this.paymentRepo.transaction(async (repo) => {
      const u = await repo.updateStatus(paymentId, "AUTHORIZED", {
        providerPaymentId: data.providerPaymentId,
        authorizedAt: this.clock.now(),
      });
      await repo.addTransaction({
        paymentId,
        provider: payment.provider,
        providerEventId: data.providerPaymentId,
        eventType: PAYMENT_EVENTS.PAYMENT_AUTHORIZED,
        status: "AUTHORIZED",
        amount: result.amount,
      });
      return u;
    });

    await this.bookingRepo.updateStatus(payment.bookingId, "PAYMENT_AUTHORIZED", userId);

    return toPaymentDto(updated);
  }
}

// --- 3. Capture Payment ---

export class CapturePaymentUseCase
  implements UseCase<{ userId: string; paymentId: string }, PaymentDto>
{
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly gatewayRegistry: PaymentGatewayRegistry,
    private readonly clock: Clock,
  ) {}

  async execute(input: { userId: string; paymentId: string }): Promise<PaymentDto> {
    const { paymentId } = input;
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new PaymentNotFoundError();
    if (payment.status !== "AUTHORIZED") {
      throw new InvalidPaymentStatusError("AUTHORIZED", payment.status);
    }

    const gateway = this.gatewayRegistry.get(payment.provider);
    const result = await gateway.capturePayment({
      providerPaymentId: payment.providerPaymentId ?? "",
      amount: payment.amount,
      currency: payment.currency,
    });

    if (!result.captured) {
      await this.paymentRepo.addTransaction({
        paymentId,
        provider: payment.provider,
        eventType: PAYMENT_EVENTS.CAPTURE_FAILED,
        status: "FAILED",
      });
      throw new PaymentCaptureError();
    }

    const updated = await this.paymentRepo.updateStatus(paymentId, "CAPTURED", {
      capturedAt: this.clock.now(),
    });

    await this.paymentRepo.addTransaction({
      paymentId,
      provider: payment.provider,
      providerEventId: payment.providerPaymentId,
      eventType: PAYMENT_EVENTS.PAYMENT_CAPTURED,
      status: "CAPTURED",
      amount: payment.amount,
    });

    return toPaymentDto(updated);
  }
}

// --- 4. Retry Payment ---

export class RetryPaymentUseCase
  implements UseCase<{ userId: string; bookingId: string; data: CreatePaymentOrderInput }, PaymentOrderDto>
{
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly bookingRepo: BookingRepository,
    private readonly parentRepo: ParentRepository,
    private readonly gatewayRegistry: PaymentGatewayRegistry,
    private readonly clock: Clock,
  ) {}

  async execute(input: { userId: string; bookingId: string; data: CreatePaymentOrderInput }): Promise<PaymentOrderDto> {
    const { userId, bookingId, data } = input;
    const provider = data.provider ?? DEFAULT_PROVIDER;

    const parent = await this.parentRepo.findByUserId(userId);
    if (!parent) throw new PaymentOwnershipError();

    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new BookingNotPayableError("Booking not found");
    if (booking.parentId !== parent.id) throw new PaymentOwnershipError();

    const existingPayments = await this.paymentRepo.findByBookingId(bookingId);
    for (const p of existingPayments) {
      if (p.status === "FAILED" || p.status === "PENDING") {
        await this.paymentRepo.updateStatus(p.id, "CANCELLED", {
          failedAt: this.clock.now(),
          failureReason: "Retried by user",
        });
        await this.paymentRepo.addTransaction({
          paymentId: p.id,
          provider: p.provider,
          eventType: PAYMENT_EVENTS.PAYMENT_CANCELLED,
          status: "CANCELLED",
        });
      }
    }

    const gateway = this.gatewayRegistry.get(provider);
    const amountPaise = toPaise(booking.priceAmount);
    const feePaise = toPaise(booking.platformFeeAmount);

    const order = await gateway.createOrder({
      amount: amountPaise,
      currency: booking.currency,
      receipt: booking.publicId,
      notes: { bookingId: booking.id, parentId: booking.parentId, retry: "true" },
      idempotencyKey: data.idempotencyKey,
    });

    const payment = await this.paymentRepo.create({
      bookingId: booking.id,
      parentId: booking.parentId,
      provider,
      amount: amountPaise,
      platformFeeAmount: feePaise,
      currency: booking.currency,
      idempotencyKey: data.idempotencyKey ?? null,
      providerOrderId: order.providerOrderId,
    });

    await this.paymentRepo.addTransaction({
      paymentId: payment.id,
      provider,
      providerEventId: order.providerOrderId,
      eventType: PAYMENT_EVENTS.ORDER_CREATED,
      status: "PENDING",
      amount: amountPaise,
      payload: order.gatewayData,
    });

    return toPaymentOrderDto(payment, order.gatewayData);
  }
}

// --- 5. Initiate Refund ---

export class InitiateRefundUseCase
  implements UseCase<{ userId: string; data: InitiateRefundInput }, RefundDto>
{
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly bookingRepo: BookingRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: { userId: string; data: InitiateRefundInput }): Promise<RefundDto> {
    const { userId, data } = input;

    const booking = await this.bookingRepo.findById(data.bookingId);
    if (!booking) throw new BookingNotPayableError("Booking not found");
    if (!REFUNDABLE_BOOKING_STATUSES.includes(booking.status as any)) {
      throw new BookingNotPayableError(`Booking status ${booking.status} is not refundable`);
    }

    const payments = await this.paymentRepo.findByBookingId(data.bookingId);
    const captured = payments.filter((p) => p.status === "CAPTURED");
    if (captured.length === 0) {
      throw new RefundAmountExceededError("No captured payment to refund");
    }

    const totalCaptured = captured.reduce((sum, p) => sum + p.amount, 0);
    const refunds = await this.paymentRepo.findRefundsByBookingId(data.bookingId);
    const totalRefunded = refunds
      .filter((r) => r.status === "PROCESSED" || r.status === "PROCESSING")
      .reduce((sum, r) => sum + r.amount, 0);

    assertRefundAmountValid(totalCaptured, totalRefunded, data.amount);

    const payment = captured[0];
    const refund = await this.paymentRepo.createRefund({
      paymentId: payment.id,
      bookingId: data.bookingId,
      requestedByUserId: userId,
      amount: data.amount,
      currency: payment.currency,
      reason: data.reason,
    });

    await this.paymentRepo.addTransaction({
      paymentId: payment.id,
      provider: payment.provider,
      eventType: PAYMENT_EVENTS.REFUND_INITIATED,
      status: "REQUESTED",
      amount: data.amount,
      payload: { refundId: refund.id },
    });

    return toRefundDto(refund);
  }
}

// --- 6. Approve Refund ---

export class ApproveRefundUseCase
  implements UseCase<{ userId: string; refundId: string }, RefundDto>
{
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly bookingRepo: BookingRepository,
    private readonly gatewayRegistry: PaymentGatewayRegistry,
    private readonly clock: Clock,
  ) {}

  async execute(input: { userId: string; refundId: string }): Promise<RefundDto> {
    const { userId, refundId } = input;
    const refund = await this.paymentRepo.findRefundById(refundId);
    if (!refund) throw new PaymentNotFoundError();
    if (refund.status !== "REQUESTED") {
      throw new InvalidPaymentStatusError("REQUESTED", refund.status);
    }

    const payment = await this.paymentRepo.findById(refund.paymentId);
    if (!payment) throw new PaymentNotFoundError();

    const gateway = this.gatewayRegistry.get(payment.provider);
    const result = await gateway.refund({
      providerPaymentId: payment.providerPaymentId ?? "",
      amount: refund.amount,
      notes: { refundId, reason: refund.reason ?? "" },
    });

    const refunds = await this.paymentRepo.findRefundsByPaymentId(payment.id);
    const totalRefunded = refunds
      .filter((r) => r.status === "PROCESSED" || r.id === refundId)
      .reduce((sum, r) => sum + r.amount, 0);

    const fullRefund = isFullRefund(payment.amount, totalRefunded);
    const newPaymentStatus = fullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED";

    const updatedRefund = await this.paymentRepo.updateRefundStatus(
      refundId,
      "PROCESSED",
      userId,
      result.providerRefundId,
    );
    await this.paymentRepo.updatePayment(payment.id, { status: newPaymentStatus } as any);
    await this.paymentRepo.addTransaction({
      paymentId: payment.id,
      provider: payment.provider,
      providerEventId: result.providerRefundId,
      eventType: PAYMENT_EVENTS.REFUND_PROCESSED,
      status: "REFUNDED",
      amount: refund.amount,
    });

    if (fullRefund) {
      await this.bookingRepo.updateStatus(payment.bookingId, "REFUNDED", userId, "Full refund processed");
    }

    return toRefundDto(updatedRefund);
  }
}

// --- 7. Reject Refund ---

export class RejectRefundUseCase
  implements UseCase<{ userId: string; refundId: string }, RefundDto>
{
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async execute(input: { userId: string; refundId: string }): Promise<RefundDto> {
    const { refundId } = input;
    const refund = await this.paymentRepo.findRefundById(refundId);
    if (!refund) throw new PaymentNotFoundError();
    if (refund.status !== "REQUESTED") {
      throw new InvalidPaymentStatusError("REQUESTED", refund.status);
    }
    const updated = await this.paymentRepo.updateRefundStatus(refundId, "REJECTED");
    return toRefundDto(updated);
  }
}

// --- 8. Get Payment ---

export class GetPaymentUseCase
  implements UseCase<{ userId: string; paymentId: string }, PaymentWithTransactionsDto>
{
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly bookingRepo: BookingRepository,
    private readonly parentRepo: ParentRepository,
  ) {}

  async execute(input: { userId: string; paymentId: string }): Promise<PaymentWithTransactionsDto> {
    const { userId, paymentId } = input;
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new PaymentNotFoundError();

    const parent = await this.parentRepo.findByUserId(userId);
    if (parent && payment.parentId !== parent.id) throw new PaymentOwnershipError();

    const transactions = await this.paymentRepo.getTransactions(paymentId);
    return toPaymentWithTransactionsDto(payment, transactions);
  }
}

// --- 9. List Parent Payments ---

export class ListParentPaymentsUseCase
  implements UseCase<{ userId: string; query?: PaymentQueryInput }, PaymentDto[]>
{
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly parentRepo: ParentRepository,
  ) {}

  async execute(input: { userId: string; query?: PaymentQueryInput }): Promise<PaymentDto[]> {
    const parent = await this.parentRepo.findByUserId(input.userId);
    if (!parent) throw new PaymentOwnershipError();
    const opts = input.query
      ? {
          status: input.query.status,
          provider: input.query.provider,
          from: input.query.from ? new Date(input.query.from) : undefined,
          to: input.query.to ? new Date(input.query.to) : undefined,
          limit: input.query.limit,
          offset: input.query.offset,
        }
      : undefined;
    const payments = await this.paymentRepo.findByParentId(parent.id, opts);
    return payments.map(toPaymentDto);
  }
}

// --- 10. List All Payments (Admin) ---

export class ListAllPaymentsUseCase
  implements UseCase<{ userId: string; query?: PaymentQueryInput }, PaymentDto[]>
{
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async execute(input: { userId: string; query?: PaymentQueryInput }): Promise<PaymentDto[]> {
    const opts = input.query
      ? {
          status: input.query.status,
          provider: input.query.provider,
          from: input.query.from ? new Date(input.query.from) : undefined,
          to: input.query.to ? new Date(input.query.to) : undefined,
          limit: input.query.limit,
          offset: input.query.offset,
        }
      : undefined;
    const payments = await this.paymentRepo.findAll(opts);
    return payments.map(toPaymentDto);
  }
}

// --- 11. Get Payment History ---

export class GetPaymentHistoryUseCase
  implements UseCase<{ userId: string; paymentId: string }, PaymentTransactionDto[]>
{
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async execute(input: { userId: string; paymentId: string }): Promise<PaymentTransactionDto[]> {
    const transactions = await this.paymentRepo.getTransactions(input.paymentId);
    return transactions.map((t) => ({
      id: t.id,
      provider: t.provider,
      providerEventId: t.providerEventId,
      eventType: t.eventType,
      status: t.status,
      amount: t.amount,
      processedAt: t.processedAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
    }));
  }
}

// --- 12. Get Refund Status ---

export class GetRefundStatusUseCase
  implements UseCase<{ userId: string; refundId: string }, RefundDto>
{
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async execute(input: { userId: string; refundId: string }): Promise<RefundDto> {
    const refund = await this.paymentRepo.findRefundById(input.refundId);
    if (!refund) throw new PaymentNotFoundError();
    return toRefundDto(refund);
  }
}

// --- 13. List Refunds (Admin) ---

export class ListRefundsUseCase
  implements UseCase<{ userId: string; query?: RefundQueryInput }, RefundDto[]>
{
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async execute(input: { userId: string; query?: RefundQueryInput }): Promise<RefundDto[]> {
    const refunds: RefundDto[] = [];
    if (input.query?.bookingId) {
      const r = await this.paymentRepo.findRefundsByBookingId(input.query.bookingId);
      refunds.push(...r.map(toRefundDto));
    }
    if (input.query?.paymentId) {
      const r = await this.paymentRepo.findRefundsByPaymentId(input.query.paymentId);
      refunds.push(...r.map(toRefundDto));
    }
    return refunds;
  }
}

// --- 14. Process Payment Webhook ---

export interface ProcessWebhookInput {
  provider: string;
  payload: Record<string, any>;
  signature: string;
  webhookSecret: string;
  generateId: () => string;
}

export class ProcessPaymentWebhookUseCase
  implements UseCase<ProcessWebhookInput, void>
{
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly gatewayRegistry: PaymentGatewayRegistry,
    private readonly clock: Clock,
  ) {}

  async execute(input: ProcessWebhookInput): Promise<void> {
    const { provider, payload, signature, webhookSecret, generateId } = input;
    const gateway = this.gatewayRegistry.get(provider);

    const rawPayload = JSON.stringify(payload);
    const isValid = gateway.verifyWebhookSignature(rawPayload, signature, webhookSecret);
    if (!isValid) {
      throw new PaymentVerificationError("Webhook signature invalid");
    }

    const providerEventId = String(payload.eventId ?? payload.id ?? generateId());
    const existing = await this.paymentRepo.findWebhookByProviderEventId(provider, providerEventId);
    if (existing) {
      return; // Idempotent
    }

    const eventType = String(payload.eventType ?? payload.type ?? "UNKNOWN");
    const saved = await this.paymentRepo.saveWebhookEvent({
      provider,
      providerEventId,
      eventType,
      status: "RECEIVED",
      payload,
    });

    try {
      const paymentId = payload.paymentId ?? payload.orderId ?? null;
      if (paymentId) {
        await this.paymentRepo.addTransaction({
          paymentId: String(paymentId),
          provider,
          providerEventId,
          eventType,
          status: "PROCESSED",
          payload,
        });
      }
      await this.paymentRepo.markWebhookProcessed(saved.id, paymentId ? String(paymentId) : "");
    } catch (err) {
      await this.paymentRepo.markWebhookProcessed(saved.id, "", (err as Error).message);
      throw err;
    }
  }
}

// --- 15. Get Payment Summary (Admin) ---

export class GetPaymentSummaryUseCase
  implements UseCase<{ userId: string }, PaymentSummaryDto>
{
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async execute(_input: { userId: string }): Promise<PaymentSummaryDto> {
    const summary = await this.paymentRepo.getPaymentSummary();
    return toPaymentSummaryDto(summary);
  }
}

// --- 16. Cancel Payment (Admin) ---

export class CancelPaymentUseCase
  implements UseCase<{ userId: string; paymentId: string }, PaymentDto>
{
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: { userId: string; paymentId: string }): Promise<PaymentDto> {
    const { paymentId } = input;
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new PaymentNotFoundError();
    if (!["PENDING", "AUTHORIZED", "FAILED"].includes(payment.status)) {
      throw new InvalidPaymentStatusError("PENDING/AUTHORIZED/FAILED", payment.status);
    }

    const updated = await this.paymentRepo.updateStatus(paymentId, "CANCELLED", {
      failedAt: this.clock.now(),
      failureReason: "Cancelled by admin",
    });
    await this.paymentRepo.addTransaction({
      paymentId,
      provider: payment.provider,
      eventType: PAYMENT_EVENTS.PAYMENT_CANCELLED,
      status: "CANCELLED",
    });
    return toPaymentDto(updated);
  }
}