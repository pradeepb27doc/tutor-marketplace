"use client";

import { useCallback, useState } from "react";
import {
  paymentApiClient,
  PaymentApiError,
} from "../services/payment-service";
import type { PaymentOrderDto } from "../types";

export type CreatePaymentOrderState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; order: PaymentOrderDto }
  | {
      status: "error";
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };

interface CreatePaymentOrderParams {
  bookingId: string;
  accessToken: string;
  provider?: string;
  idempotencyKey?: string;
}

export function useCreatePaymentOrder() {
  const [state, setState] = useState<CreatePaymentOrderState>({
    status: "idle",
  });

  const createOrder = useCallback(
    async (params: CreatePaymentOrderParams) => {
      setState({ status: "loading" });

      try {
        const order = await paymentApiClient.createPaymentOrder(
          params.bookingId,
          params.accessToken,
          params.provider,
          params.idempotencyKey,
        );

        setState({ status: "success", order });
        return order;
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

  return { state, createOrder, reset };
}
