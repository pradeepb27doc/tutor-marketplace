import type {
  PaymentRecord,
  PaymentTransactionRecord,
  RefundRecord,
  PaymentSummary,
} from "./payment.repository.js";

// --- Application Input DTOs ---

export interface CreatePaymentOrderInput {
  bookingId: string;
  provider?: string;
  idempotencyKey?: string;
}

export interface VerifyPaymentInput {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export interface InitiateRefundInput {
  bookingId: string;
  amount: number; // Integer minor currency units
  reason?: string;
}

export interface PaymentQueryInput {
  status?: string;
  provider?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface RefundQueryInput {
  status?: string;
  paymentId?: string;
  bookingId?: string;
  limit?: number;
  offset?: number;
}

// --- Response DTOs ---

export interface PaymentOrderDto {
  paymentId: string;
  provider: string;
  providerOrderId: string;
  amount: number;
  currency: string;
  gatewayData: Record<string, any>;
  status: string;
  createdAt: string;
}

export interface PaymentDto {
  id: string;
  bookingId: string;
  parentId: string;
  provider: string;
  status: string;
  amount: number;
  platformFeeAmount: number;
  currency: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  authorizedAt: string | null;
  capturedAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransactionDto {
  id: string;
  provider: string;
  providerEventId: string | null;
  eventType: string;
  status: string;
  amount: number | null;
  processedAt: string | null;
  createdAt: string;
}

export interface PaymentWithTransactionsDto extends PaymentDto {
  transactions: PaymentTransactionDto[];
}

export interface RefundDto {
  id: string;
  paymentId: string;
  bookingId: string;
  status: string;
  amount: number;
  currency: string;
  reason: string | null;
  providerRefundId: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummaryDto {
  totalPayments: number;
  totalCapturedAmount: number;
  totalRefundedAmount: number;
  pendingCount: number;
  authorizedCount: number;
  capturedCount: number;
  failedCount: number;
  refundedCount: number;
  partiallyRefundedCount: number;
}

// --- Mapper Functions ---

export function toPaymentOrderDto(
  record: PaymentRecord,
  gatewayData: Record<string, any>,
): PaymentOrderDto {
  return {
    paymentId: record.id,
    provider: record.provider,
    providerOrderId: record.providerOrderId ?? "",
    amount: record.amount,
    currency: record.currency,
    gatewayData,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
  };
}

export function toPaymentDto(record: PaymentRecord): PaymentDto {
  return {
    id: record.id,
    bookingId: record.bookingId,
    parentId: record.parentId,
    provider: record.provider,
    status: record.status,
    amount: record.amount,
    platformFeeAmount: record.platformFeeAmount,
    currency: record.currency,
    providerOrderId: record.providerOrderId,
    providerPaymentId: record.providerPaymentId,
    authorizedAt: record.authorizedAt?.toISOString() ?? null,
    capturedAt: record.capturedAt?.toISOString() ?? null,
    failedAt: record.failedAt?.toISOString() ?? null,
    failureReason: record.failureReason,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toPaymentTransactionDto(record: PaymentTransactionRecord): PaymentTransactionDto {
  return {
    id: record.id,
    provider: record.provider,
    providerEventId: record.providerEventId,
    eventType: record.eventType,
    status: record.status,
    amount: record.amount,
    processedAt: record.processedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
  };
}

export function toPaymentWithTransactionsDto(
  record: PaymentRecord,
  transactions: PaymentTransactionRecord[],
): PaymentWithTransactionsDto {
  return {
    ...toPaymentDto(record),
    transactions: transactions.map(toPaymentTransactionDto),
  };
}

export function toRefundDto(record: RefundRecord): RefundDto {
  return {
    id: record.id,
    paymentId: record.paymentId,
    bookingId: record.bookingId,
    status: record.status,
    amount: record.amount,
    currency: record.currency,
    reason: record.reason,
    providerRefundId: record.providerRefundId,
    processedAt: record.processedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toPaymentSummaryDto(summary: PaymentSummary): PaymentSummaryDto {
  return {
    totalPayments: summary.totalPayments,
    totalCapturedAmount: summary.totalCapturedAmount,
    totalRefundedAmount: summary.totalRefundedAmount,
    pendingCount: summary.pendingCount,
    authorizedCount: summary.authorizedCount,
    capturedCount: summary.capturedCount,
    failedCount: summary.failedCount,
    refundedCount: summary.refundedCount,
    partiallyRefundedCount: summary.partiallyRefundedCount,
  };
}