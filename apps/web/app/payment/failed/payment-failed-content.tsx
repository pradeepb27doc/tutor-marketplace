"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";

export default function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get("bookingId") ?? "";
  const reason = searchParams.get("reason") ?? "";

  // Redirect if no bookingId
  useEffect(() => {
    if (!bookingId) {
      router.replace("/search");
    }
  }, [bookingId, router]);

  if (!bookingId) {
    return null;
  }

  const handleRetry = () => {
    router.push(`/payment?bookingId=${encodeURIComponent(bookingId)}`);
  };

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
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-destructive/10">
            <XCircle className="size-10 text-destructive" aria-hidden="true" />
          </span>

          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.035em]">
            Payment Failed
          </h1>
          <p className="mt-3 text-foreground/56">
            {reason ||
              "Your payment could not be processed. Please check your payment details and try again."}
          </p>

          <div className="mt-8 rounded-[2rem] border border-border bg-background p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">
                Booking ID
              </span>
              <span className="text-sm font-mono font-semibold text-foreground">
                {bookingId}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                Status
              </span>
              <span className="text-sm font-semibold text-destructive">
                Failed
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <RefreshCw className="size-4" aria-hidden="true" /> Retry Payment
            </button>
            <Link
              href={`/booking/success?bookingId=${encodeURIComponent(bookingId)}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-8 py-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="size-4" aria-hidden="true" /> Return to Booking
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
