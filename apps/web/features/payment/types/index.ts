// Backend API response types for payment endpoints
// Mirrors: packages/application/src/payments/payment.dtos.ts

export interface PaymentOrderDto {
  paymentId: string;
  provider: string;
  providerOrderId: string;
  amount: number; // Integer minor currency units (e.g. paise)
  currency: string;
  gatewayData: Record<string, unknown>;
  status: string;
  createdAt: string;
}

export interface PaymentDto {
  id: string;
  bookingId: string;
  parentId: string;
  provider: string;
  status: string;
  amount: number; // Integer minor currency units
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

// --- API Response Wrappers ---

export interface PaymentOrderApiResponse {
  data: PaymentOrderDto;
}

export interface PaymentApiResponse {
  data: PaymentDto;
}

export interface PaymentWithTransactionsApiResponse {
  data: PaymentWithTransactionsDto;
}

// --- Payment Method Types ---

export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

export interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  icon: string;
  description: string;
}

// --- Payment Processing State Machine ---

export type PaymentProcessState =
  | { status: "idle" }
  | { status: "creating_order" }
  | { status: "pending"; paymentId: string; providerOrderId: string }
  | { status: "processing"; paymentId: string }
  | { status: "success"; payment: PaymentDto }
  | {
      status: "failure";
      paymentId: string | null;
      reason: string | null;
    }
  | { status: "cancelled" }
  | { status: "timeout" };

// --- Razorpay Verification Payload ---

export interface RazorpayVerifyPayload {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}
