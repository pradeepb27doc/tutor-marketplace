import Razorpay from "razorpay";
import { getEnv } from "@tutor-marketplace/config";
import { createHmac } from "node:crypto";
import { verifyRazorpayWebhookSignature } from "./razorpay-webhook-verifier.js";
import { logger, GatewayNotConfiguredError } from "@tutor-marketplace/application";
import type {
  PaymentGatewayPort,
  CreateGatewayOrderParams,
  GatewayOrderResult,
  VerifyGatewayPaymentParams,
  GatewayPaymentVerificationResult,
  CaptureGatewayPaymentParams,
  GatewayCaptureResult,
  GatewayRefundParams,
  GatewayRefundResult,
  GatewayPaymentStatusResult,
} from "@tutor-marketplace/application";

/**
 * Razorpay implementation of the PaymentGatewayPort.
 * Implements order creation, payment verification, capture, refund,
 * status lookup and webhook signature verification.
 *
 * Initialization is conditional on the presence of RAZORPAY_KEY_ID
 * and RAZORPAY_KEY_SECRET environment variables. If either is missing,
 * a warning is logged and the gateway enters a disabled state where
 * every payment operation throws GatewayNotConfiguredError.
 */
export class RazorpayPaymentGateway implements PaymentGatewayPort {
  readonly providerName = "RAZORPAY";

  private readonly client: Razorpay | null;
  readonly enabled: boolean;

  constructor() {
    const env = getEnv();
    const keyId = env.RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      this.client = new Razorpay({ key_id: keyId, key_secret: keySecret });
      this.enabled = true;
    } else {
      logger.warn("Razorpay disabled - credentials not configured");
      this.client = null;
      this.enabled = false;
    }
  }

  private assertEnabled(): void {
    if (!this.client) {
      throw new GatewayNotConfiguredError(this.providerName);
    }
  }

  async createOrder(params: CreateGatewayOrderParams): Promise<GatewayOrderResult> {
    this.assertEnabled();
    const order: any = await this.client!.orders.create({
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes,
    });

    return {
      providerOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      gatewayData: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        notes: order.notes,
      },
    };
  }

  async verifyPayment(params: VerifyGatewayPaymentParams): Promise<GatewayPaymentVerificationResult> {
    this.assertEnabled();
    const secret = getEnv().RAZORPAY_KEY_SECRET ?? "";
    const generatedSignature = createHmac("sha256", secret)
      .update(`${params.providerOrderId}|${params.providerPaymentId}`)
      .digest("hex");

    const verified = generatedSignature === params.signature;

    return {
      verified,
      status: verified ? "AUTHORIZED" : "FAILED",
      amount: 0,
      currency: "",
      providerPaymentId: params.providerPaymentId,
    };
  }

  async capturePayment(params: CaptureGatewayPaymentParams): Promise<GatewayCaptureResult> {
    this.assertEnabled();
    try {
      const result: any = await this.client!.payments.capture(
        params.providerPaymentId,
        params.amount,
        params.currency ?? "INR",
      );
      return {
        captured: result && (result.status === "captured" || result.status === "succeeded"),
        status: result?.status ?? "captured",
        providerPaymentId: params.providerPaymentId,
      };
    } catch {
      return {
        captured: false,
        status: "FAILED",
        providerPaymentId: params.providerPaymentId,
      };
    }
  }

  async refund(params: GatewayRefundParams): Promise<GatewayRefundResult> {
    this.assertEnabled();
    const result: any = await this.client!.payments.refund(params.providerPaymentId, {
      amount: params.amount,
      notes: params.notes,
    });

    return {
      providerRefundId: result.id,
      status: result.status,
      amount: result.amount,
    };
  }

  async getPaymentStatus(providerPaymentId: string): Promise<GatewayPaymentStatusResult> {
    this.assertEnabled();
    const result: any = await this.client!.payments.fetch(providerPaymentId);
    return {
      status: result.status,
      amount: result.amount,
      currency: result.currency,
      providerPaymentId,
      failureReason: result.error_description ?? null,
    };
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    return verifyRazorpayWebhookSignature(payload, signature, secret);
  }
}