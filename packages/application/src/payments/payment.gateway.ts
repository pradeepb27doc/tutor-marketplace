// Payment Gateway Abstraction (Port)
// Provider-agnostic interface used by the Application layer.
// Concrete adapters (Razorpay, Stripe, PayPal) live in the Infrastructure layer.

export interface CreateGatewayOrderParams {
  amount: number; // Integer minor currency units (e.g. paise, cents)
  currency: string;
  receipt: string; // Unique receipt identifier (e.g. booking.publicId)
  notes?: Record<string, string>;
  idempotencyKey?: string;
}

export interface GatewayOrderResult {
  providerOrderId: string;
  amount: number;
  currency: string;
  status: string;
  gatewayData: Record<string, any>; // Pass-through data for the client SDK
}

export interface VerifyGatewayPaymentParams {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export interface GatewayPaymentVerificationResult {
  verified: boolean;
  status: string;
  amount: number;
  currency: string;
  providerPaymentId: string;
}

export interface CaptureGatewayPaymentParams {
  providerPaymentId: string;
  amount: number; // Integer minor currency units
  currency?: string;
}

export interface GatewayCaptureResult {
  captured: boolean;
  status: string;
  providerPaymentId: string;
}

export interface GatewayRefundParams {
  providerPaymentId: string;
  amount: number; // Integer minor currency units
  notes?: Record<string, string>;
}

export interface GatewayRefundResult {
  providerRefundId: string;
  status: string;
  amount: number;
}

export interface GatewayPaymentStatusResult {
  status: string;
  amount: number;
  currency: string;
  providerPaymentId: string;
  failureReason: string | null;
}

export interface PaymentGatewayPort {
  readonly providerName: string;
  createOrder(params: CreateGatewayOrderParams): Promise<GatewayOrderResult>;
  verifyPayment(params: VerifyGatewayPaymentParams): Promise<GatewayPaymentVerificationResult>;
  capturePayment(params: CaptureGatewayPaymentParams): Promise<GatewayCaptureResult>;
  refund(params: GatewayRefundParams): Promise<GatewayRefundResult>;
  getPaymentStatus(providerPaymentId: string): Promise<GatewayPaymentStatusResult>;
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean;
}

export class GatewayNotConfiguredError extends Error {
  constructor(provider: string) {
    super(`Payment gateway '${provider}' is not configured`);
    this.name = "GatewayNotConfiguredError";
  }
}

// Registry holding all available gateway adapters.
export class PaymentGatewayRegistry {
  private readonly gateways = new Map<string, PaymentGatewayPort>();

  register(gateway: PaymentGatewayPort): void {
    this.gateways.set(gateway.providerName, gateway);
  }

  get(providerName: string): PaymentGatewayPort {
    const gateway = this.gateways.get(providerName);
    if (!gateway) throw new GatewayNotConfiguredError(providerName);
    return gateway;
  }

  has(providerName: string): boolean {
    return this.gateways.has(providerName);
  }
}