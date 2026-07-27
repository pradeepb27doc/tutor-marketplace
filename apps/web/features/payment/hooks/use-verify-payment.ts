"use client";

import { useCallback, useState } from "react";
import {
  paymentApiClient,
  PaymentApiError,
} from "../services/payment-service";
import type { PaymentDto, RazorpayVerifyPayload } from "../types";

export type VerifyPaymentState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; payment: PaymentDto }
  | {
      status: "error";
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };

interface VerifyPaymentParams {
  paymentId: string;
  payload: RazorpayVerifyPayload;
  accessToken: string;
}

export function useVerifyPayment() {
  const [state, setState] = useState<VerifyPaymentState>({
    status: "idle",
  });

  const verifyPayment = useCallback(
    async (params: VerifyPaymentParams) => {
      setState({ status: "loading" });

      try {
        const payment = await paymentApiClient.verifyPayment(
          params.paymentId,
          params.payload,
          params.accessToken,
        );

        setState({ status: "success", payment });
        return payment;
      } catch (err) {
        if (err instanceof PaymentApiError) {
          setState({
            status: "error",
            code: err.code,
            message: err.message,
            details: err.details,
          });
        } else {
          setState({
            status: "error",
            code: "UNKNOWN",
            message:
              err instanceof Error
                ? err.message
                : "An unexpected error occurred",
          });
        }
        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, verifyPayment, reset };
}
