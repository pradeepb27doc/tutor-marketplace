import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaPaymentRepository } from "./prisma-payment.repository.js";
import type {
  PaymentRepository,
  CreatePaymentRecord,
  CreatePaymentTransactionRecord,
  CreatePaymentWebhookRecord,
  CreateRefundRecord,
  PaymentQueryOptions,
} from "@tutor-marketplace/application";

// Mock the database module
vi.mock("@tutor-marketplace/database", () => ({
  getPrismaClient: vi.fn(),
}));

import { getPrismaClient } from "@tutor-marketplace/database";

describe("PrismaPaymentRepository", () => {
  let repository: PrismaPaymentRepository;
  let mockPrisma: any;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      payment: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
        aggregate: vi.fn(),
      },
      paymentTransaction: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      paymentWebhookEvent: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      refund: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
        aggregate: vi.fn(),
      },
    };

    mockPrisma = {
      payment: mockDb.payment,
      paymentTransaction: mockDb.paymentTransaction,
      paymentWebhookEvent: mockDb.paymentWebhookEvent,
      refund: mockDb.refund,
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    repository = new PrismaPaymentRepository();
  });

  describe("findById", () => {
    it("should return a payment record when found", async () => {
      const mockRecord = {
        id: "payment-1",
        bookingId: "booking-1",
        parentId: "parent-1",
        provider: "RAZORPAY",
        status: "PENDING",
        amount: "1000",
        platformFeeAmount: "100",
        currency: "INR",
        providerOrderId: "order-1",
        providerPaymentId: null,
        idempotencyKey: "idem-1",
        authorizedAt: null,
        capturedAt: null,
        failedAt: null,
        failureReason: null,
        metadata: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:00:00Z"),
      };

      mockDb.payment.findUnique.mockResolvedValue(mockRecord);

      const result = await repository.findById("payment-1");

      expect(result).toEqual({
        id: "payment-1",
        bookingId: "booking-1",
        parentId: "parent-1",
        provider: "RAZORPAY",
        status: "PENDING",
        amount: 1000,
        platformFeeAmount: 100,
        currency: "INR",
        providerOrderId: "order-1",
        providerPaymentId: null,
        idempotencyKey: "idem-1",
        authorizedAt: null,
        capturedAt: null,
        failedAt: null,
        failureReason: null,
        metadata: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:00:00Z"),
      });
      expect(mockDb.payment.findUnique).toHaveBeenCalledWith({ where: { id: "payment-1" } });
    });

    it("should return null when payment not found", async () => {
      mockDb.payment.findUnique.mockResolvedValue(null);

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      mockDb.payment.findUnique.mockRejectedValue(new Error("Database connection error"));

      await expect(repository.findById("payment-1")).rejects.toThrow("Database connection error");
    });
  });

  describe("findByBookingId", () => {
    it("should return payments for a booking", async () => {
      const mockRecords = [
        {
          id: "payment-1",
          bookingId: "booking-1",
          parentId: "parent-1",
          provider: "RAZORPAY",
          status: "PENDING",
          amount: "1000",
          platformFeeAmount: "100",
          currency: "INR",
          providerOrderId: "order-1",
          providerPaymentId: null,
          idempotencyKey: "idem-1",
          authorizedAt: null,
          capturedAt: null,
          failedAt: null,
          failureReason: null,
          metadata: null,
          createdAt: new Date("2024-01-01T09:00:00Z"),
          updatedAt: new Date("2024-01-01T09:00:00Z"),
        },
      ];

      mockDb.payment.findMany.mockResolvedValue(mockRecords);

      const result = await repository.findByBookingId("booking-1");

      expect(result).toHaveLength(1);
      expect(result[0].bookingId).toBe("booking-1");
      expect(mockDb.payment.findMany).toHaveBeenCalledWith({
        where: { bookingId: "booking-1" },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return empty array when no payments found", async () => {
      mockDb.payment.findMany.mockResolvedValue([]);

      const result = await repository.findByBookingId("booking-1");

      expect(result).toEqual([]);
    });
  });

  describe("findByParentId", () => {
    it("should return payments for a parent with options", async () => {
      const mockRecords = [
        {
          id: "payment-1",
          bookingId: "booking-1",
          parentId: "parent-1",
          provider: "RAZORPAY",
          status: "CAPTURED",
          amount: "1000",
          platformFeeAmount: "100",
          currency: "INR",
          providerOrderId: "order-1",
          providerPaymentId: "pay-1",
          idempotencyKey: "idem-1",
          authorizedAt: new Date("2024-01-01T09:00:00Z"),
          capturedAt: new Date("2024-01-01T09:05:00Z"),
          failedAt: null,
          failureReason: null,
          metadata: null,
          createdAt: new Date("2024-01-01T09:00:00Z"),
          updatedAt: new Date("2024-01-01T09:05:00Z"),
        },
      ];

      mockDb.payment.findMany.mockResolvedValue(mockRecords);

      const opts: PaymentQueryOptions = {
        status: "CAPTURED",
        from: new Date("2024-01-01"),
        to: new Date("2024-01-31"),
        limit: 10,
        offset: 0,
      };

      const result = await repository.findByParentId("parent-1", opts);

      expect(result).toHaveLength(1);
      expect(mockDb.payment.findMany).toHaveBeenCalledWith({
        where: {
          parentId: "parent-1",
          status: "CAPTURED",
          createdAt: { gte: new Date("2024-01-01"), lte: new Date("2024-01-31") },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        skip: 0,
      });
    });
  });

  describe("findByProviderOrderId", () => {
    it("should return payment by provider order ID", async () => {
      const mockRecord = {
        id: "payment-1",
        bookingId: "booking-1",
        parentId: "parent-1",
        provider: "RAZORPAY",
        status: "PENDING",
        amount: "1000",
        platformFeeAmount: "100",
        currency: "INR",
        providerOrderId: "order-1",
        providerPaymentId: null,
        idempotencyKey: "idem-1",
        authorizedAt: null,
        capturedAt: null,
        failedAt: null,
        failureReason: null,
        metadata: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:00:00Z"),
      };

      mockDb.payment.findUnique.mockResolvedValue(mockRecord);

      const result = await repository.findByProviderOrderId("order-1");

      expect(result).not.toBeNull();
      expect(result?.providerOrderId).toBe("order-1");
    });
  });

  describe("findByIdempotencyKey", () => {
    it("should return payment by idempotency key", async () => {
      const mockRecord = {
        id: "payment-1",
        bookingId: "booking-1",
        parentId: "parent-1",
        provider: "RAZORPAY",
        status: "PENDING",
        amount: "1000",
        platformFeeAmount: "100",
        currency: "INR",
        providerOrderId: "order-1",
        providerPaymentId: null,
        idempotencyKey: "idem-1",
        authorizedAt: null,
        capturedAt: null,
        failedAt: null,
        failureReason: null,
        metadata: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:00:00Z"),
      };

      mockDb.payment.findUnique.mockResolvedValue(mockRecord);

      const result = await repository.findByIdempotencyKey("idem-1");

      expect(result).not.toBeNull();
      expect(result?.idempotencyKey).toBe("idem-1");
      expect(mockDb.payment.findUnique).toHaveBeenCalledWith({ where: { idempotencyKey: "idem-1" } });
    });
  });

  describe("create", () => {
    it("should create a payment with default values", async () => {
      const createData: CreatePaymentRecord = {
        bookingId: "booking-1",
        parentId: "parent-1",
        provider: "RAZORPAY",
        amount: "1000",
        platformFeeAmount: "100",
        currency: "INR",
      };

      const mockRecord = {
        id: "payment-new",
        bookingId: "booking-1",
        parentId: "parent-1",
        provider: "RAZORPAY",
        status: "PENDING",
        amount: "1000",
        platformFeeAmount: "100",
        currency: "INR",
        idempotencyKey: null,
        providerOrderId: null,
        providerPaymentId: null,
        authorizedAt: null,
        capturedAt: null,
        failedAt: null,
        failureReason: null,
        metadata: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:00:00Z"),
      };

      mockDb.payment.create.mockResolvedValue(mockRecord);

      const result = await repository.create(createData);

      expect(result.status).toBe("PENDING");
      expect(mockDb.payment.create).toHaveBeenCalledWith({
        data: {
          bookingId: "booking-1",
          parentId: "parent-1",
          provider: "RAZORPAY",
          amount: "1000",
          platformFeeAmount: "100",
          currency: "INR",
          idempotencyKey: null,
          providerOrderId: null,
          status: "PENDING",
        },
      });
    });
  });

  describe("updateStatus", () => {
    it("should update payment status", async () => {
      const mockRecord = {
        id: "payment-1",
        bookingId: "booking-1",
        parentId: "parent-1",
        provider: "RAZORPAY",
        status: "CAPTURED",
        amount: "1000",
        platformFeeAmount: "100",
        currency: "INR",
        providerOrderId: "order-1",
        providerPaymentId: "pay-1",
        idempotencyKey: "idem-1",
        authorizedAt: new Date("2024-01-01T09:00:00Z"),
        capturedAt: new Date("2024-01-01T09:05:00Z"),
        failedAt: null,
        failureReason: null,
        metadata: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:05:00Z"),
      };

      mockDb.payment.update.mockResolvedValue(mockRecord);

      const result = await repository.updateStatus("payment-1", "CAPTURED", {
        providerPaymentId: "pay-1",
        capturedAt: new Date("2024-01-01T09:05:00Z"),
      });

      expect(result.status).toBe("CAPTURED");
      expect(result.capturedAt).not.toBeNull();
    });

    it("should handle database errors", async () => {
      mockDb.payment.update.mockRejectedValue(new Error("Update failed"));

      await expect(repository.updateStatus("payment-1", "CAPTURED")).rejects.toThrow("Update failed");
    });
  });

  describe("addTransaction", () => {
    it("should create a payment transaction", async () => {
      const entry: CreatePaymentTransactionRecord = {
        paymentId: "payment-1",
        provider: "RAZORPAY",
        providerEventId: "event-1",
        eventType: "payment.captured",
        status: "SUCCESS",
        amount: "1000",
        payload: { captured: true },
        processedAt: new Date("2024-01-01T09:05:00Z"),
      };

      mockDb.paymentTransaction.create.mockResolvedValue({ id: "tx-1" });

      await repository.addTransaction(entry);

      expect(mockDb.paymentTransaction.create).toHaveBeenCalledWith({
        data: {
          paymentId: "payment-1",
          provider: "RAZORPAY",
          providerEventId: "event-1",
          eventType: "payment.captured",
          status: "SUCCESS",
          amount: "1000",
          payload: { captured: true },
          processedAt: new Date("2024-01-01T09:05:00Z"),
        },
      });
    });

    it("should handle database errors", async () => {
      mockDb.paymentTransaction.create.mockRejectedValue(new Error("Insert failed"));

      const entry: CreatePaymentTransactionRecord = {
        paymentId: "payment-1",
        provider: "RAZORPAY",
        eventType: "payment.captured",
        status: "SUCCESS",
      };

      await expect(repository.addTransaction(entry)).rejects.toThrow("Insert failed");
    });
  });

  describe("saveWebhookEvent", () => {
    it("should save a webhook event", async () => {
      const data: CreatePaymentWebhookRecord = {
        provider: "RAZORPAY",
        providerEventId: "webhook-1",
        eventType: "payment.captured",
        status: "RECEIVED",
        payload: { paymentId: "pay-1" },
        paymentId: "payment-1",
      };

      const mockRecord = {
        id: "webhook-1",
        provider: "RAZORPAY",
        providerEventId: "webhook-1",
        eventType: "payment.captured",
        status: "RECEIVED",
        payload: { paymentId: "pay-1" },
        paymentId: "payment-1",
        receivedAt: new Date("2024-01-01T09:05:00Z"),
        processedAt: null,
        errorMessage: null,
      };

      mockDb.paymentWebhookEvent.create.mockResolvedValue(mockRecord);

      const result = await repository.saveWebhookEvent(data);

      expect(result.status).toBe("RECEIVED");
      expect(mockDb.paymentWebhookEvent.create).toHaveBeenCalledWith({
        data: {
          provider: "RAZORPAY",
          providerEventId: "webhook-1",
          eventType: "payment.captured",
          status: "RECEIVED",
          payload: { paymentId: "pay-1" },
          paymentId: "payment-1",
        },
      });
    });
  });

  describe("markWebhookProcessed", () => {
    it("should mark webhook as processed", async () => {
      mockDb.paymentWebhookEvent.update.mockResolvedValue({ id: "webhook-1" });

      await repository.markWebhookProcessed("webhook-1", "payment-1");

      expect(mockDb.paymentWebhookEvent.update).toHaveBeenCalledWith({
        where: { id: "webhook-1" },
        data: {
          status: "PROCESSED",
          processedAt: expect.any(Date),
          errorMessage: null,
          paymentId: "payment-1",
        },
      });
    });

    it("should mark webhook as failed with error message", async () => {
      mockDb.paymentWebhookEvent.update.mockResolvedValue({ id: "webhook-1" });

      await repository.markWebhookProcessed("webhook-1", "payment-1", "Processing error");

      expect(mockDb.paymentWebhookEvent.update).toHaveBeenCalledWith({
        where: { id: "webhook-1" },
        data: {
          status: "FAILED",
          processedAt: expect.any(Date),
          errorMessage: "Processing error",
          paymentId: "payment-1",
        },
      });
    });
  });

  describe("createRefund", () => {
    it("should create a refund request", async () => {
      const data: CreateRefundRecord = {
        paymentId: "payment-1",
        bookingId: "booking-1",
        requestedByUserId: "user-1",
        amount: "500",
        currency: "INR",
        reason: "Service not provided",
      };

      const mockRecord = {
        id: "refund-1",
        paymentId: "payment-1",
        bookingId: "booking-1",
        requestedByUserId: "user-1",
        amount: "500",
        currency: "INR",
        reason: "Service not provided",
        status: "REQUESTED",
        approvedByUserId: null,
        providerRefundId: null,
        processedAt: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:00:00Z"),
      };

      mockDb.refund.create.mockResolvedValue(mockRecord);

      const result = await repository.createRefund(data);

      expect(result.status).toBe("REQUESTED");
      expect(mockDb.refund.create).toHaveBeenCalledWith({
        data: {
          paymentId: "payment-1",
          bookingId: "booking-1",
          requestedByUserId: "user-1",
          amount: "500",
          currency: "INR",
          reason: "Service not provided",
          status: "REQUESTED",
        },
      });
    });
  });

  describe("updateRefundStatus", () => {
    it("should update refund status to PROCESSED with timestamp", async () => {
      const mockRecord = {
        id: "refund-1",
        paymentId: "payment-1",
        bookingId: "booking-1",
        requestedByUserId: "user-1",
        approvedByUserId: "admin-1",
        amount: "500",
        currency: "INR",
        reason: "Service not provided",
        status: "PROCESSED",
        providerRefundId: "rfnd-1",
        processedAt: new Date("2024-01-01T10:00:00Z"),
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T10:00:00Z"),
      };

      mockDb.refund.update.mockResolvedValue(mockRecord);

      const result = await repository.updateRefundStatus("refund-1", "PROCESSED", "admin-1", "rfnd-1");

      expect(result.status).toBe("PROCESSED");
      expect(result.processedAt).not.toBeNull();
      expect(mockDb.refund.update).toHaveBeenCalledWith({
        where: { id: "refund-1" },
        data: {
          status: "PROCESSED",
          approvedByUserId: "admin-1",
          providerRefundId: "rfnd-1",
          processedAt: expect.any(Date),
        },
      });
    });
  });

  describe("countByStatus", () => {
    it("should return count of payments by status", async () => {
      mockDb.payment.count.mockResolvedValue(25);

      const result = await repository.countByStatus("PENDING");

      expect(result).toBe(25);
      expect(mockDb.payment.count).toHaveBeenCalledWith({ where: { status: "PENDING" } });
    });
  });

  describe("getPaymentSummary", () => {
    it("should return payment summary with aggregates", async () => {
      mockDb.payment.count.mockResolvedValue(100);
      mockDb.payment.aggregate.mockResolvedValue({ _sum: { amount: "50000" } });
      mockDb.refund.aggregate.mockResolvedValue({ _sum: { amount: "5000" } });
      mockDb.payment.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(60)  // pending
        .mockResolvedValueOnce(10)  // authorized
        .mockResolvedValueOnce(20)  // captured
        .mockResolvedValueOnce(5)   // failed
        .mockResolvedValueOnce(3)   // refunded
        .mockResolvedValueOnce(2);  // partiallyRefunded

      const result = await repository.getPaymentSummary();

      expect(result.totalPayments).toBe(100);
      expect(result.totalCapturedAmount).toBe(Number("50000"));
      expect(result.totalRefundedAmount).toBe(Number("5000"));
      expect(result.pendingCount).toBe(60);
      expect(result.authorizedCount).toBe(10);
      expect(result.capturedCount).toBe(20);
      expect(result.failedCount).toBe(5);
      expect(result.refundedCount).toBe(3);
      expect(result.partiallyRefundedCount).toBe(2);
    });

    it("should handle null aggregate values", async () => {
      mockDb.payment.count.mockResolvedValue(0);
      mockDb.payment.aggregate.mockResolvedValue({ _sum: { amount: null } });
      mockDb.refund.aggregate.mockResolvedValue({ _sum: { amount: null } });

      const result = await repository.getPaymentSummary();

      expect(result.totalPayments).toBe(0);
      expect(result.totalCapturedAmount).toBe(Number("0"));
      expect(result.totalRefundedAmount).toBe(Number("0"));
    });
  });

  describe("transaction", () => {
    it("should execute function within a transaction", async () => {
      const mockTx = {
        payment: {
          create: vi.fn().mockResolvedValue({
            id: "payment-tx",
            bookingId: "booking-1",
            parentId: "parent-1",
            provider: "RAZORPAY",
            status: "PENDING",
            amount: "1000",
            platformFeeAmount: "100",
            currency: "INR",
            idempotencyKey: null,
            providerOrderId: null,
            providerPaymentId: null,
            authorizedAt: null,
            capturedAt: null,
            failedAt: null,
            failureReason: null,
            metadata: null,
            createdAt: new Date("2024-01-01T09:00:00Z"),
            updatedAt: new Date("2024-01-01T09:00:00Z"),
          }),
        },
      };

      mockPrisma.$transaction = vi.fn(async (fn: any) => {
        return fn(mockTx);
      });

      const result = await repository.transaction(async (txRepo) => {
        return await (txRepo as any).create({
          bookingId: "booking-1",
          parentId: "parent-1",
          provider: "RAZORPAY",
          amount: "1000",
        });
      });

      expect(result).toEqual({
        id: "payment-tx",
        bookingId: "booking-1",
        parentId: "parent-1",
        provider: "RAZORPAY",
        status: "PENDING",
        amount: 1000,
        platformFeeAmount: 100,
        currency: "INR",
        providerOrderId: null,
        providerPaymentId: null,
        idempotencyKey: null,
        authorizedAt: null,
        capturedAt: null,
        failedAt: null,
        failureReason: null,
        metadata: null,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:00:00Z"),
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });
});