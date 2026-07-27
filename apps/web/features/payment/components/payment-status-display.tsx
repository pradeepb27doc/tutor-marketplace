import { AlertCircle, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import type { PaymentProcessState } from "../types";

interface PaymentStatusDisplayProps {
  state: PaymentProcessState;
  onRetry?: () => void;
  onReturnHome?: () => void;
}

export default function PaymentStatusDisplay({
  state,
  onRetry,
  onReturnHome,
}: PaymentStatusDisplayProps) {
  switch (state.status) {
    case "idle":
    case "creating_order":
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="size-14 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {state.status === "creating_order"
                ? "Creating payment order..."
                : "Preparing payment..."}
            </h3>
            <p className="mt-1 text-sm text-foreground/56">
              {state.status === "creating_order"
                ? "Please wait while we set up your secure payment."
                : "Initializing payment gateway..."}
            </p>
          </div>
        </div>
      );

    case "pending":
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="size-14 animate-pulse rounded-full bg-emerald-500/10">
            <div className="grid size-14 place-items-center">
              <div className="size-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Complete your payment
            </h3>
            <p className="mt-1 text-sm text-foreground/56">
              Complete the payment in the Razorpay window to proceed.
            </p>
          </div>
        </div>
      );

    case "processing":
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="size-14 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Verifying payment...
            </h3>
            <p className="mt-1 text-sm text-foreground/56">
              Please do not close this page while we verify your payment.
            </p>
          </div>
        </div>
      );

    case "success":
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="size-10 text-emerald-500" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              Payment successful!
            </h3>
            <p className="mt-2 text-sm text-foreground/56">
              Your payment has been processed successfully.
            </p>
          </div>
        </div>
      );

    case "failure":
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-destructive/10">
            <XCircle className="size-7 text-destructive" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Payment failed
            </h3>
            <p className="mt-1 text-sm text-foreground/56">
              {state.reason || "Your payment could not be processed."}
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <RefreshCw className="size-4" aria-hidden="true" /> Retry payment
            </button>
          )}
          {onReturnHome && (
            <button
              type="button"
              onClick={onReturnHome}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Return to booking
            </button>
          )}
        </div>
      );

    case "cancelled":
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-muted/10">
            <AlertCircle className="size-7 text-foreground/40" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Payment cancelled
            </h3>
            <p className="mt-1 text-sm text-foreground/56">
              You cancelled the payment. You can retry at any time.
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <RefreshCw className="size-4" aria-hidden="true" /> Retry payment
            </button>
          )}
        </div>
      );

    case "timeout":
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-destructive/10">
            <AlertCircle className="size-7 text-destructive" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Payment timed out
            </h3>
            <p className="mt-1 text-sm text-foreground/56">
              The payment session expired. Please try again.
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <RefreshCw className="size-4" aria-hidden="true" /> Retry payment
            </button>
          )}
        </div>
      );

    default:
      return null;
  }
}
