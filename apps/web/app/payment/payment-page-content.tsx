"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertCircle, RefreshCw } from "lucide-react";

import BookingSummaryCard from "@/features/payment/components/booking-summary-card";
import PaymentMethodSelector from "@/features/payment/components/payment-method-selector";
import PaymentStatusDisplay from "@/features/payment/components/payment-status-display";
import { useBookingDetail } from "@/features/payment/hooks/use-booking-detail";
import { usePaymentProcessor } from "@/features/payment/hooks/use-payment-processor";
import { tutorProfileApiClient } from "@/features/tutor-profile/services/tutor-profile-service";
import type { PublicTutorDetailDto } from "@/features/tutor-profile/types";
import { useAuth } from "@/features/auth/components/auth-provider";
import type { PaymentMethod } from "@/features/payment/types";

function PaymentNavbar({ bookingId }: { bookingId: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <nav
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8"
        aria-label="Payment navigation"
      >
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="Back to home"
        >
          <span className="grid size-9 place-items-center rounded-full border border-foreground/12 bg-foreground text-background transition-transform duration-300 group-hover:scale-105">
            <span className="size-2.5 rounded-full bg-background" />
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">
            Tutor Marketplace
          </span>
        </Link>
        <Link
          href={`/booking/success?bookingId=${encodeURIComponent(bookingId)}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/58 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" /> Back to booking
        </Link>
      </nav>
    </header>
  );
}

export default function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? "";
  const { getAccessToken, user } = useAuth();

  const { state: bookingState, fetchBooking } = useBookingDetail();
  const [tutor, setTutor] = useState<PublicTutorDetailDto | null>(null);

  const accessToken = getAccessToken() ?? "";

  const { state: paymentState, processPayment, reset } = usePaymentProcessor({
    bookingId,
    accessToken,
    userName: user?.displayName ?? undefined,
    userEmail: user?.email ?? undefined,
    userPhone: user?.phone ?? undefined,
  });

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  // Redirect if no bookingId
  useEffect(() => {
    if (!bookingId) {
      router.replace("/search");
    }
  }, [bookingId, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  // Fetch booking on mount
  useEffect(() => {
    if (bookingId && accessToken) {
      fetchBooking({ bookingId, accessToken });
    }
  }, [bookingId, accessToken, fetchBooking]);

  // Fetch tutor profile when booking is loaded
  useEffect(() => {
    if (bookingState.status === "success" && !tutor) {
      tutorProfileApiClient
        .getTutorDetail(bookingState.booking.tutorId)
        .then((response) => {
          setTutor(response.data);
        })
        .catch(() => {
          setTutor(null);
        });
    }
  }, [bookingState, tutor]);

  // Navigate to success page when payment succeeds
  useEffect(() => {
    if (paymentState.status === "success") {
      const params = new URLSearchParams({
        paymentId: paymentState.payment.id,
        bookingId: paymentState.payment.bookingId,
      });
      router.push(`/payment/success?${params.toString()}`);
    }
  }, [paymentState, router]);

  // Navigate to failure page when payment fails or times out
  useEffect(() => {
    if (paymentState.status === "failure") {
      const params = new URLSearchParams({
        bookingId,
        reason: paymentState.reason ?? "Payment could not be processed",
      });
      router.push(`/payment/failed?${params.toString()}`);
    } else if (paymentState.status === "timeout") {
      const params = new URLSearchParams({
        bookingId,
        reason: "Payment timed out. Please try again.",
      });
      router.push(`/payment/failed?${params.toString()}`);
    }
  }, [paymentState, bookingId, router]);

  // Find subject name from tutor profile
  const subjectName = useMemo(() => {
    if (!tutor || bookingState.status !== "success") return "";
    const booking = bookingState.booking;
    const subject =
      tutor.subjects.find((s) => s.id === booking.tutorSubjectId) ??
      tutor.subjects.find((s) => s.subjectId === booking.subjectId);
    return subject?.subjectName ?? "";
  }, [tutor, bookingState]);

  const handlePay = () => {
    if (!selectedMethod) return;
    void processPayment(selectedMethod);
  };

  const isProcessing =
    paymentState.status !== "idle" &&
    paymentState.status !== "cancelled" &&
    paymentState.status !== "timeout" &&
    paymentState.status !== "failure";

  const showStatusDisplay =
    paymentState.status !== "idle" &&
    paymentState.status !== "failure" &&
    paymentState.status !== "timeout";

  // Loading state
  if (!bookingId || !accessToken) {
    return null;
  }

  // Booking error state
  if (bookingState.status === "error") {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <PaymentNavbar bookingId={bookingId} />
        <section className="px-5 py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-destructive/10">
                <AlertCircle className="size-7 text-destructive" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Failed to load booking
                </h3>
                <p className="mt-1 text-sm text-foreground/56">
                  {bookingState.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchBooking({ bookingId, accessToken })}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <RefreshCw className="size-4" aria-hidden="true" /> Try again
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Main payment page
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PaymentNavbar bookingId={bookingId} />

      <section className="px-5 py-10 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_23rem]">
          {/* Main Content */}
          <div>
            {bookingState.status === "loading" && (
              <div className="flex items-center justify-center py-20">
                <div className="size-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
              </div>
            )}

            {bookingState.status === "success" && paymentState.status === "idle" && (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl font-semibold tracking-[-0.035em]">
                    Complete your payment
                  </h1>
                  <p className="mt-2 text-sm text-foreground/56">
                    Select a payment method and complete your transaction
                    securely.
                  </p>
                </div>

                <div className="space-y-6">
                  <PaymentMethodSelector
                    selected={selectedMethod}
                    onSelect={setSelectedMethod}
                    disabled={isProcessing}
                  />

                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={!selectedMethod || isProcessing}
                    className="w-full rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Pay now
                  </button>
                </div>
              </>
            )}

            {showStatusDisplay && (
              <PaymentStatusDisplay
                state={paymentState}
                onRetry={() => {
                  reset();
                  setSelectedMethod(null);
                }}
              />
            )}
          </div>

          {/* Booking Summary Sidebar */}
          {bookingState.status === "success" && (
            <BookingSummaryCard
              booking={bookingState.booking}
              tutor={tutor}
              subjectName={subjectName}
            />
          )}
        </div>
      </section>
    </main>
  );
}
