import type { PaymentMethod, PaymentMethodOption } from "../types";

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "upi",
    label: "UPI",
    icon: "📱",
    description: "Pay via any UPI app (Google Pay, PhonePe, Paytm, etc.)",
  },
  {
    id: "card",
    label: "Card",
    icon: "💳",
    description: "Pay with Visa, Mastercard, RuPay, or other cards",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    icon: "🏦",
    description: "Pay directly from your bank account",
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: "👛",
    description: "Pay using a saved wallet (Paytm, Freecharge, etc.)",
  },
];

export const PAYMENT_STATUSES = {
  PENDING: "PENDING",
  AUTHORIZED: "AUTHORIZED",
  CAPTURED: "CAPTURED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
} as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  AUTHORIZED: "Authorized",
  CAPTURED: "Captured",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partially Refunded",
};

export const DEFAULT_PAYMENT_PROVIDER = "RAZORPAY";

export const PAYMENT_TIMEOUT_MS = 300_000; // 5 minutes

export const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const found = PAYMENT_METHODS.find((m) => m.id === method);
  return found ? found.label : method;
}
