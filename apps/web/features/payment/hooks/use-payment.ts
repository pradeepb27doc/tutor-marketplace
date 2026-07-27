"use client";

import { useCallback, useState } from "react";
import {
  paymentApiClient,
  PaymentApiError,
} from "../services/payment-service";
import type { PaymentWithTransactionsDto } from "../types";

export type PaymentState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; payment: PaymentWithTransactionsDto }
  | {
      status: "error";
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };

interface GetPaymentParams {
  paymentId: string;
  accessToken: string;
}

export function usePayment() {
  const [state, setState] = useState<PaymentState>({ status: "idle" });

  const fetchPayment = useCallback(
    async (params: GetPaymentParams) => {
      setState({ status: "loading" });

      try {
        const payment = await paymentApiClient.getPayment(
          params.paymentId,
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

  return { state, fetchPayment, reset };
}
