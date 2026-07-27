"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCreatePaymentOrder } from "./use-create-payment-order";
import { useVerifyPayment } from "./use-verify-payment";
import { loadRazorpayScript, createRazorpayCheckout } from "../lib/razorpay-loader";
import type { PaymentProcessState, PaymentMethod } from "../types";
import { PAYMENT_TIMEOUT_MS } from "../constants";

interface UsePaymentProcessorProps {
  bookingId: string;
  accessToken: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

export function usePaymentProcessor({
  bookingId,
  accessToken,
  userName,
  userEmail,
  userPhone,
}: UsePaymentProcessorProps) {
  const [state, setState] = useState<PaymentProcessState>({ status: "idle" });
  const { createOrder, state: orderState } = useCreatePaymentOrder();
  const { verifyPayment, state: verifyState } = useVerifyPayment();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearExistingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startTimeout = useCallback(() => {
    clearExistingTimeout();
    timeoutRef.current = setTimeout(() => {
      setState({ status: "timeout" });
    }, PAYMENT_TIMEOUT_MS);
  }, [clearExistingTimeout]);

  const stopTimeout = useCallback(() => {
    clearExistingTimeout();
  }, [clearExistingTimeout]);

  useEffect(() => {
    return () => clearExistingTimeout();
  }, [clearExistingTimeout]);

  // Sync order creation state
  useEffect(() => {
    if (orderState.status === "success") {
      setState({
        status: "pending",
        paymentId: orderState.order.paymentId,
        providerOrderId: orderState.order.providerOrderId,
      });
    } else if (orderState.status === "error") {
      setState({
        status: "failure",
        paymentId: null,
        reason: orderState.message,
      });
    }
  }, [orderState]);

  // Sync verification state
  useEffect(() => {
    if (verifyState.status === "success") {
      stopTimeout();
      setState({ status: "success", payment: verifyState.payment });
    } else if (verifyState.status === "error") {
      stopTimeout();
      setState({
        status: "failure",
        paymentId: null,
        reason: verifyState.message,
      });
    }
  }, [verifyState, stopTimeout]);

  const processPayment = useCallback(
    async (method: PaymentMethod) => {
      setState({ status: "creating_order" });

      try {
        await loadRazorpayScript();
      } catch {
        setState({
          status: "failure",
          paymentId: null,
          reason: "Failed to load payment gateway. Please try again.",
        });
        return;
      }

      const order = await createOrder({
        bookingId,
        accessToken,
        provider: "RAZORPAY",
      });

      if (!order) {
        // Error state is already set by the order state effect
        return;
      }

      const gatewayData = order.gatewayData;
      const key = String(gatewayData.key_id ?? gatewayData.key ?? "");
      const orderId = String(gatewayData.order_id ?? order.providerOrderId ?? "");

      if (!key || !orderId) {
        setState({
          status: "failure",
          paymentId: order.paymentId,
          reason: "Payment gateway configuration error. Please contact support.",
        });
        return;
      }

      startTimeout();

      const razorpay = createRazorpayCheckout({
        key: key,
        order_id: orderId,
        amount: order.amount,
        currency: order.currency,
        name: "Tutor Marketplace",
        description: `Payment for booking ${order.paymentId}`,
        method: { [method]: true },
        handler: (response) => {
          stopTimeout();
          setState({ status: "processing", paymentId: order.paymentId });
          verifyPayment({
            paymentId: order.paymentId,
            payload: {
              providerOrderId: response.razorpay_order_id,
              providerPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            },
            accessToken,
          });
        },
        prefill: {
          name: userName ?? undefined,
          email: userEmail ?? undefined,
          contact: userPhone ?? undefined,
        },
        theme: { color: "#000000" },
        modal: {
          ondismiss: () => {
            stopTimeout();
            setState({ status: "cancelled" });
          },
        },
      });

      razorpay.open();
    },
    [
      bookingId,
      accessToken,
      userName,
      userEmail,
      userPhone,
      createOrder,
      verifyPayment,
      startTimeout,
      stopTimeout,
    ],
  );

  const reset = useCallback(() => {
    stopTimeout();
    setState({ status: "idle" });
  }, [stopTimeout]);

  return { state, processPayment, reset };
}
