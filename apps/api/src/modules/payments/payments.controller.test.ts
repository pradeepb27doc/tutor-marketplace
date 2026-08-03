import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaymentsController } from "./payments.controller.js";
import {
  CreatePaymentOrderUseCase,
  VerifyPaymentUseCase,
  CapturePaymentUseCase,
  RetryPaymentUseCase,
  InitiateRefundUseCase,
  ApproveRefundUseCase,
  RejectRefundUseCase,
  GetPaymentUseCase,
  ListParentPaymentsUseCase,
  ListAllPaymentsUseCase,
  GetPaymentHistoryUseCase,
  GetRefundStatusUseCase,
  ListRefundsUseCase,
  ProcessPaymentWebhookUseCase,
  GetPaymentSummaryUseCase,
  CancelPaymentUseCase,
} from "@tutor-marketplace/application";

describe("PaymentsController", () => {
  let controller: PaymentsController;
  const mocks = {
    createOrder: { execute: vi.fn() },
    verify: { execute: vi.fn() },
    capture: { execute: vi.fn() },
    retry: { execute: vi.fn() },
    refund: { execute: vi.fn() },
    approveRefund: { execute: vi.fn() },
    rejectRefund: { execute: vi.fn() },
    get: { execute: vi.fn() },
    listParent: { execute: vi.fn() },
    listAll: { execute: vi.fn() },
    history: { execute: vi.fn() },
    getRefund: { execute: vi.fn() },
    listRefunds: { execute: vi.fn() },
    webhook: { execute: vi.fn() },
    summary: { execute: vi.fn() },
    cancel: { execute: vi.fn() },
  };

  const validPayment = {
    id: "payment-1",
    bookingId: "booking-1",
    parentId: "parent-1",
    provider: "RAZORPAY",
    status: "PENDING",
    amount: 50000,
    platformFeeAmount: 5000,
    currency: "INR",
    providerOrderId: null,
    providerPaymentId: null,
    idempotencyKey: null,
    authorizedAt: null,
    capturedAt: null,
    failedAt: null,
    failureReason: null,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PaymentsController(
      mocks.createOrder as unknown as CreatePaymentOrderUseCase,
      mocks.verify as unknown as VerifyPaymentUseCase,
      mocks.capture as unknown as CapturePaymentUseCase,
      mocks.retry as unknown as RetryPaymentUseCase,
      mocks.refund as unknown as InitiateRefundUseCase,
      mocks.approveRefund as unknown as ApproveRefundUseCase,
      mocks.rejectRefund as unknown as RejectRefundUseCase,
      mocks.get as unknown as GetPaymentUseCase,
      mocks.listParent as unknown as ListParentPaymentsUseCase,
      mocks.listAll as unknown as ListAllPaymentsUseCase,
      mocks.history as unknown as GetPaymentHistoryUseCase,
      mocks.getRefund as unknown as GetRefundStatusUseCase,
      mocks.listRefunds as unknown as ListRefundsUseCase,
      mocks.webhook as unknown as ProcessPaymentWebhookUseCase,
      mocks.summary as unknown as GetPaymentSummaryUseCase,
      mocks.cancel as unknown as CancelPaymentUseCase,
    );
  });

  describe("createOrder", () => {
    it("should create a payment order", async () => {
      mocks.createOrder.execute.mockResolvedValue({ ...validPayment, providerOrderId: "order-1" });
      const req = { user: { id: "parent-1", role: "PARENT" } } as any;
      const result = await controller.createOrder(req, { bookingId: "booking-1" } as any);
      expect(result.data.providerOrderId).toBe("order-1");
      expect(mocks.createOrder.execute).toHaveBeenCalledWith({
        userId: "parent-1",
        data: { bookingId: "booking-1", provider: undefined, idempotencyKey: undefined },
      });
    });

    it("should propagate gateway unavailable error", async () => {
      mocks.createOrder.execute.mockRejectedValue(new Error("Payment gateway unavailable"));
      const req = { user: { id: "parent-1", role: "PARENT" } } as any;
      await expect(controller.createOrder(req, { bookingId: "booking-1" } as any)).rejects.toThrow("Payment gateway unavailable");
    });

    it("should propagate duplicate idempotency key error", async () => {
      mocks.createOrder.execute.mockRejectedValue(new Error("Idempotency key already used"));
      const req = { user: { id: "parent-1", role: "PARENT" } } as any;
      await expect(controller.createOrder(req, { bookingId: "booking-1", idempotencyKey: "dup" } as any)).rejects.toThrow("Idempotency key");
    });
  });

  describe("verify", () => {
    it("should verify payment", async () => {
      mocks.verify.execute.mockResolvedValue({ ...validPayment, status: "CAPTURED" });
      const req = { user: { id: "parent-1", role: "PARENT" } } as any;
      const result = await controller.verify(req, "payment-1", {
        providerOrderId: "order-1",
        providerPaymentId: "pay-1",
        signature: "sig-1",
      } as any);
      expect(result.data.status).toBe("CAPTURED");
      expect(mocks.verify.execute).toHaveBeenCalledWith({
        userId: "parent-1",
        paymentId: "payment-1",
        data: { providerOrderId: "order-1", providerPaymentId: "pay-1", signature: "sig-1" },
      });
    });

    it("should propagate verification failure", async () => {
      mocks.verify.execute.mockRejectedValue(new Error("Payment verification failed"));
      const req = { user: { id: "parent-1", role: "PARENT" } } as any;
      await expect(controller.verify(req, "payment-1", {} as any)).rejects.toThrow("verification failed");
    });
  });

  describe("retry", () => {
    it("should retry a payment", async () => {
      const order = { paymentId: "payment-2", provider: "RAZORPAY", providerOrderId: "order-2", amount: 50000, currency: "INR", gatewayData: {}, status: "PENDING", createdAt: new Date().toISOString() };
      mocks.retry.execute.mockResolvedValue(order as any);
      const req = { user: { id: "parent-1", role: "PARENT" } } as any;
      const result = await controller.retry(req, "booking-1", { bookingId: "booking-1" } as any);
      expect(result.data.providerOrderId).toBe("order-2");
      expect(mocks.retry.execute).toHaveBeenCalledWith({
        userId: "parent-1",
        bookingId: "booking-1",
        data: { bookingId: "booking-1", provider: undefined, idempotencyKey: undefined },
      });
    });
  });

  describe("refund", () => {
    it("should initiate a refund", async () => {
      const refund = { id: "refund-1", paymentId: "payment-1", bookingId: "booking-1", requestedByUserId: "admin-1", approvedByUserId: null, status: "REQUESTED", amount: 50000, currency: "INR", reason: "test", providerRefundId: null, processedAt: null, createdAt: new Date(), updatedAt: new Date() };
      mocks.refund.execute.mockResolvedValue(refund);
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.initiateRefund(req, { amount: 50000 } as any);
      expect(result.data.status).toBe("REQUESTED");
    });

    it("should propagate refund amount exceeded error", async () => {
      mocks.refund.execute.mockRejectedValue(new Error("Refund amount exceeds available captured amount"));
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await expect(controller.initiateRefund(req, { amount: 9999999 } as any)).rejects.toThrow("exceeds");
    });
  });

  describe("approveRefund / rejectRefund", () => {
    it("should approve a refund", async () => {
      mocks.approveRefund.execute.mockResolvedValue({ ...validPayment, status: "REFUNDED" });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.approveRefund(req, "refund-1");
      expect(mocks.approveRefund.execute).toHaveBeenCalledWith({ userId: "admin-1", refundId: "refund-1" });
      expect(result.data.status).toBe("REFUNDED");
    });

    it("should reject a refund", async () => {
      mocks.rejectRefund.execute.mockResolvedValue({ ...validPayment, status: "CAPTURED" });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await controller.rejectRefund(req, "refund-1");
      expect(mocks.rejectRefund.execute).toHaveBeenCalledWith({ userId: "admin-1", refundId: "refund-1" });
    });
  });

  describe("getPayment", () => {
    it("should get payment details", async () => {
      mocks.get.execute.mockResolvedValue(validPayment);
      const req = { user: { id: "parent-1" } } as any;
      const result = await controller.get(req, "payment-1");
      expect(result).toEqual({ data: validPayment });
    });

    it("should propagate payment not found", async () => {
      mocks.get.execute.mockRejectedValue(new Error("Payment not found"));
      const req = { user: { id: "parent-1" } } as any;
      await expect(controller.get(req, "bad-id")).rejects.toThrow("Payment not found");
    });
  });

  describe("webhook", () => {
    it("should process razorpay webhook", async () => {
      mocks.webhook.execute.mockResolvedValue({ received: true });
      const req = { body: { event: "payment.captured", payload: { payment: { entity: { id: "pay-1" } } } } } as any;
      const result = await controller.razorpayWebhook(req, "test-signature");
      expect(result).toEqual({ data: { received: true } });
      expect(mocks.webhook.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: "RAZORPAY",
          signature: "test-signature",
          payload: expect.any(Object),
          webhookSecret: expect.any(String),
          generateId: expect.any(Function),
        }),
      );
    });

    it("should ignore missing signature and still process", async () => {
      mocks.webhook.execute.mockResolvedValue({ received: true });
      const req = { body: { event: "payment.failed" } } as any;
      const result = await controller.razorpayWebhook(req, "");
      expect(result).toEqual({ data: { received: true } });
    });

    it("should propagate webhook processing error", async () => {
      mocks.webhook.execute.mockRejectedValue(new Error("Webhook verification failed"));
      const req = { body: {} } as any;
      await expect(controller.razorpayWebhook(req, "bad-sig")).rejects.toThrow("verification failed");
    });
  });

  describe("cancel", () => {
    it("should cancel a payment", async () => {
      mocks.cancel.execute.mockResolvedValue({ ...validPayment, status: "CANCELLED" });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.cancel(req, "payment-1");
      expect(result.data.status).toBe("CANCELLED");
      expect(mocks.cancel.execute).toHaveBeenCalledWith({ userId: "admin-1", paymentId: "payment-1" });
    });
  });

  describe("capture", () => {
    it("should capture a payment", async () => {
      mocks.capture.execute.mockResolvedValue({ ...validPayment, status: "CAPTURED" });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.capture(req, "payment-1");
      expect(result.data.status).toBe("CAPTURED");
      expect(mocks.capture.execute).toHaveBeenCalledWith({ userId: "admin-1", paymentId: "payment-1" });
    });
  });

  describe("listParentPayments", () => {
    it("should list parent payments", async () => {
      mocks.listParent.execute.mockResolvedValue([validPayment]);
      const req = { user: { id: "parent-1", role: "PARENT" } } as any;
      const result = await controller.listParent(req, { limit: 20 } as any);
      expect(result.data).toHaveLength(1);
      expect(mocks.listParent.execute).toHaveBeenCalledWith({
        userId: "parent-1",
        query: { status: undefined, provider: undefined, from: undefined, to: undefined, limit: 20, offset: undefined },
      });
    });
  });

  describe("history", () => {
    it("should get payment transaction history", async () => {
      const txns = [{ id: "txn-1", paymentId: "payment-1", provider: "RAZORPAY", providerEventId: "evt-1", eventType: "ORDER_CREATED", status: "SUCCESS", amount: 50000, payload: null, processedAt: null, createdAt: new Date() }];
      mocks.history.execute.mockResolvedValue(txns);
      const req = { user: { id: "parent-1" } } as any;
      const result = await controller.history(req, "payment-1");
      expect(result.data).toHaveLength(1);
    });
  });

  describe("summary", () => {
    it("should get payment summary", async () => {
      const summary = { totalPayments: 10, totalCapturedAmount: 500000, totalRefundedAmount: 50000, pendingCount: 1, authorizedCount: 2, capturedCount: 5, failedCount: 1, refundedCount: 1, partiallyRefundedCount: 0 };
      mocks.summary.execute.mockResolvedValue(summary);
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.summary(req);
      expect(result.data.totalPayments).toBe(10);
    });
  });

  describe("listAllPayments", () => {
    it("should list all payments", async () => {
      mocks.listAll.execute.mockResolvedValue([validPayment]);
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.listAll(req, { limit: 20 } as any);
      expect(result.data[0].id).toBe("payment-1");
    });
  });

  describe("getRefund", () => {
    it("should get refund status", async () => {
      const refund = { id: "refund-1", paymentId: "payment-1", bookingId: "booking-1", requestedByUserId: "admin-1", approvedByUserId: null, status: "REQUESTED", amount: 50000, currency: "INR", reason: null, providerRefundId: null, processedAt: null, createdAt: new Date(), updatedAt: new Date() };
      mocks.getRefund.execute.mockResolvedValue(refund);
      const req = { user: { id: "admin-1" } } as any;
      const result = await controller.getRefund(req, "refund-1");
      expect(result.data.status).toBe("REQUESTED");
    });
  });
});