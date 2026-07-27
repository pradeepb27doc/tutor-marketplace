import { RAZORPAY_CHECKOUT_URL } from "../constants";

let loadPromise: Promise<void> | null = null;

/**
 * Load the Razorpay checkout script dynamically.
 * Returns a promise that resolves when the script is loaded.
 * Idempotent: multiple calls return the same promise.
 */
export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay script can only be loaded in browser"));
  }

  if (typeof window.Razorpay !== "undefined") {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (typeof window.Razorpay !== "undefined") {
        resolve();
      } else {
        reject(new Error("Razorpay script loaded but window.Razorpay is not available"));
      }
    };

    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Razorpay checkout script"));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

export interface RazorpayCheckoutOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  method?: Record<string, boolean>;
  [key: string]: unknown;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayInstance {
  open(): void;
  close(): void;
}

/**
 * Create a Razorpay checkout instance with the given options.
 * Requires the Razorpay script to be loaded first.
 */
export function createRazorpayCheckout(
  options: RazorpayCheckoutOptions,
): RazorpayInstance {
  if (typeof window === "undefined" || typeof window.Razorpay === "undefined") {
    throw new Error("Razorpay is not loaded. Call loadRazorpayScript() first.");
  }

  const RazorpayConstructor = window.Razorpay as unknown as new (
    options: RazorpayCheckoutOptions,
  ) => RazorpayInstance;

  return new RazorpayConstructor(options);
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Razorpay: unknown;
  }
}
