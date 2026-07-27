 "use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, Calendar, CreditCard, Clock } from "lucide-react";

import { usePayment } from "@/features/payment/hooks/use-payment";
import { useAuth } from "@/features/auth/components/auth-provider";
import {
  formatMinorUnits,
  formatTransactionTime,
} from "@/features/payment/lib/format";
import { getPaymentMethodLabel as getMethodLabel } from "@/features/payment/constants";
import type { PaymentMethod } from "@/features/payment/types";

export default function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getAccessToken } = useAuth();

  const paymentId = searchParams.get("paymentId") ?? "";
  const accessToken = getAccessToken() ?? "";

  const { state: paymentState, fetchPayment } = usePayment();

  useEffect(() => {
    if (paymentId && accessToken) {
      fetchPayment({ paymentId, accessToken });
    }
  }, [paymentId, accessToken, fetchPayment]);

  // Redirect if no paymentId
  useEffect(() => {
    if (!paymentId) {
      router.replace("/search");
    }
  }, [paymentId, router]);

  if (!paymentId || !accessToken) {
    return null;
  }

  if (paymentState.status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-5 text-foreground">
        <div className="size-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </main>
    );
  }

  if (paymentState.status === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-5 text-foreground">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Payment not found</h2>
          <p className="mt-2 text-foreground/56">{paymentState.message}</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Go Home
        </Link>
      </main>
    );
  }

  if (paymentState.status !== "success") {
    return null;
  }

  const payment = paymentState.payment;
  const grandTotal = formatMinorUnits(
    payment.amount + payment.platformFeeAmount,
    payment.currency,
  );
  const transactionTime = payment.authorizedAt
    ? formatTransactionTime(payment.authorizedAt)
    : payment.createdAt
      ? formatTransactionTime(payment.createdAt)
      : { date: "—", time: "—", full: "—" };

  return (
    <main className="flex min-h-screen flex-col items-center bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <nav
          className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Go to home page"
          >
            <span className="grid size-9 place-items-center rounded-full border border-foreground/12 bg-foreground text-background">
              <span className="size-2.5 rounded-full bg-background" />
            </span>
            <span className="text-sm font-semibold tracking-tight sm:text-base">
              Tutor Marketplace
            </span>
          </Link>
        </nav>
      </header>

      <section className="flex w-full max-w-lg flex-1 items-center justify-center px-5 py-16">
        <div className="w-full text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="size-10 text-emerald-500" aria-hidden="true" />
          </span>

          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.035em]">
            Payment Successful!
          </h1>
          <p className="mt-3 text-foreground/56">
            Your payment has been processed successfully. A confirmation has
            been sent to your registered email.
          </p>

          <div className="mt-8 space-y-4 rounded-[2rem] border border-border bg-background p-6 text-left shadow-[0_18px_60px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">
                Payment ID
              </span>
              <span className="text-sm font-mono font-semibold text-foreground">
                {payment.id}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                Booking ID
              </span>
              <span className="text-sm font-mono font-semibold text-foreground">
                {payment.bookingId}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                Amount Paid
              </span>
              <span className="text-lg font-semibold text-foreground">
                {grandTotal}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                Payment Method
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CreditCard className="size-4" aria-hidden="true" />
                {getMethodLabel(payment.provider as PaymentMethod)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                Transaction Time
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Clock className="size-4" aria-hidden="true" />
                {transactionTime.full}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <ArrowLeft className="size-4" aria-hidden="true" /> Return Home
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-8 py-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <Calendar className="size-4" aria-hidden="true" /> View Booking
            </Link>
          </div>

          <p className="mt-6 text-xs text-foreground/40">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </section>
    </main>
  );
}
