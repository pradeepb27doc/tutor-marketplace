import { describe, it, expect, vi, beforeEach } from "vitest";
import { RazorpayPaymentGateway } from "./razorpay-payment.gateway.js";
import { GatewayNotConfiguredError } from "@tutor-marketplace/application";

// Mock the razorpay module
vi.mock("razorpay", () => {
  const MockRazorpay = vi.fn(() => ({
    orders: { create: vi.fn() },
    payments: {
      capture: vi.fn(),
      refund: vi.fn(),
      fetch: vi.fn(),
    },
  }));
  return { default: MockRazorpay };
});

// Mock the config module
vi.mock("@tutor-marketplace/config", () => ({
  getEnv: vi.fn(),
}));

// Mock the logger
vi.mock("@tutor-marketplace/application", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tutor-marketplace/application")>();
  return {
    ...actual,
    logger: {
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
    },
  };
});

import { getEnv } from "@tutor-marketplace/config";
import { logger } from "@tutor-marketplace/application";

describe("RazorpayPaymentGateway", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize the Razorpay client when both credentials are present", () => {
      vi.mocked(getEnv).mockReturnValue({
        RAZORPAY_KEY_ID: "rzp_test_key",
        RAZORPAY_KEY_SECRET: "test_secret",
      } as any);

      const gateway = new RazorpayPaymentGateway();

      expect(gateway.enabled).toBe(true);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it("should log a warning and disable the gateway when RAZORPAY_KEY_ID is missing", () => {
      vi.mocked(getEnv).mockReturnValue({
        RAZORPAY_KEY_ID: undefined,
        RAZORPAY_KEY_SECRET: "test_secret",
      } as any);

      const gateway = new RazorpayPaymentGateway();

      expect(gateway.enabled).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(
        "Razorpay disabled - credentials not configured",
      );
    });

    it("should log a warning and disable the gateway when RAZORPAY_KEY_SECRET is missing", () => {
      vi.mocked(getEnv).mockReturnValue({
        RAZORPAY_KEY_ID: "rzp_test_key",
        RAZORPAY_KEY_SECRET: undefined,
      } as any);

      const gateway = new RazorpayPaymentGateway();

      expect(gateway.enabled).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(
        "Razorpay disabled - credentials not configured",
      );
    });

    it("should log a warning and disable the gateway when both credentials are missing", () => {
      vi.mocked(getEnv).mockReturnValue({
        RAZORPAY_KEY_ID: undefined,
        RAZORPAY_KEY_SECRET: undefined,
      } as any);

      const gateway = new RazorpayPaymentGateway();

      expect(gateway.enabled).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(
        "Razorpay disabled - credentials not configured",
      );
    });
  });

  describe("when disabled (credentials missing)", () => {
    let gateway: RazorpayPaymentGateway;

    beforeEach(() => {
      vi.mocked(getEnv).mockReturnValue({
        RAZORPAY_KEY_ID: undefined,
        RAZORPAY_KEY_SECRET: undefined,
      } as any);
      gateway = new RazorpayPaymentGateway();
    });

    it("should throw GatewayNotConfiguredError on createOrder", async () => {
      await expect(
        gateway.createOrder({
          amount: 100,
          currency: "INR",
          receipt: "receipt-1",
        }),
      ).rejects.toThrow(GatewayNotConfiguredError);
    });

    it("should throw GatewayNotConfiguredError on verifyPayment", async () => {
      await expect(
        gateway.verifyPayment({
          providerOrderId: "order-1",
          providerPaymentId: "pay-1",
          signature: "sig-1",
        }),
      ).rejects.toThrow(GatewayNotConfiguredError);
    });

    it("should throw GatewayNotConfiguredError on capturePayment", async () => {
      await expect(
        gateway.capturePayment({
          providerPaymentId: "pay-1",
          amount: 100,
        }),
      ).rejects.toThrow(GatewayNotConfiguredError);
    });

    it("should throw GatewayNotConfiguredError on refund", async () => {
      await expect(
        gateway.refund({
          providerPaymentId: "pay-1",
          amount: 100,
        }),
      ).rejects.toThrow(GatewayNotConfiguredError);
    });

    it("should throw GatewayNotConfiguredError on getPaymentStatus", async () => {
      await expect(
        gateway.getPaymentStatus("pay-1"),
      ).rejects.toThrow(GatewayNotConfiguredError);
    });

    it("should still allow verifyWebhookSignature (does not require Razorpay client)", () => {
      // verifyWebhookSignature is a pure utility that doesn't need the client
      const result = gateway.verifyWebhookSignature(
        '{"event":"payment.captured"}',
        "some-signature",
        "webhook-secret",
      );
      // It should not throw; the result depends on the actual HMAC verification
      expect(typeof result).toBe("boolean");
    });
  });

  describe("when enabled (credentials present)", () => {
    let gateway: RazorpayPaymentGateway;

    beforeEach(() => {
      vi.mocked(getEnv).mockReturnValue({
        RAZORPAY_KEY_ID: "rzp_test_key",
        RAZORPAY_KEY_SECRET: "test_secret",
      } as any);
      gateway = new RazorpayPaymentGateway();
    });

    it("should be enabled", () => {
      expect(gateway.enabled).toBe(true);
    });

    it("should attempt to call Razorpay API on createOrder", async () => {
      // The Razorpay mock's orders.create returns undefined by default,
      // so this will throw. But we just want to verify it doesn't throw
      // GatewayNotConfiguredError.
      await expect(
        gateway.createOrder({
          amount: 100,
          currency: "INR",
          receipt: "receipt-1",
        }),
      ).rejects.not.toThrow(GatewayNotConfiguredError);
    });
  });
});