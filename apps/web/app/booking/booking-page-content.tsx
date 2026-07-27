"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertCircle, RefreshCw, CalendarDays } from "lucide-react";

import CalendarComponent from "@/features/booking/components/calendar";
import TimeSlotSelector from "@/features/booking/components/time-slot-selector";
import StudentDetailsForm from "@/features/booking/components/student-details-form";
import ReviewScreen from "@/features/booking/components/review-screen";
import BookingSummary from "@/features/booking/components/booking-summary";
import ContinueButton from "@/features/booking/components/continue-button";
import { useAvailability } from "@/features/booking/hooks/use-availability";
import { useCreateBooking } from "@/features/booking/hooks/use-create-booking";
import { useAuth } from "@/features/auth/components/auth-provider";
import { tutorProfileApiClient } from "@/features/tutor-profile/services/tutor-profile-service";
import type { PublicTutorDetailDto } from "@/features/tutor-profile/types";
import type { AvailabilitySlotView } from "@/features/booking/hooks/use-availability";
import {
  BOOKING_STEPS,
  STEP_LABELS,
  STEP_DESCRIPTIONS,
  INITIAL_STUDENT_DETAILS,
  PLATFORM_FEE_PERCENT,
} from "@/features/booking/constants";
import type { BookingStep } from "@/features/booking/constants";
import type { StudentDetails } from "@/types/booking";
import type { DayAvailability, TimeSlot } from "@/types/booking";

function StepIndicator({ currentStep }: { currentStep: BookingStep }) {
  const stepIndex = BOOKING_STEPS.indexOf(currentStep);

  return (
    <nav
      aria-label="Booking progress"
      className="mb-8 flex items-center justify-between"
    >
      {BOOKING_STEPS.map((key, index) => {
        const isActive = key === currentStep;
        const isComplete = index < stepIndex;

        return (
          <div key={key} className="flex flex-1">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={
                  "grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold transition-all" +
                  (isActive || isComplete
                    ? " bg-foreground text-background"
                    : " border border-border bg-background text-foreground/40")
                }
              >
                {index + 1}
              </span>
              <div className="hidden sm:block">
                <p
                  className={
                    "text-sm font-semibold" +
                    (isActive || isComplete
                      ? " text-foreground"
                      : " text-foreground/40")
                  }
                >
                  {STEP_LABELS[key]}
                </p>
                <p className="mt-0.5 text-xs text-foreground/46">
                  {STEP_DESCRIPTIONS[key]}
                </p>
              </div>
            </div>

            {index < BOOKING_STEPS.length - 1 && (
              <span
                className={
                  "mx-3 mt-0.5 h-px flex-1" +
                  (isComplete ? " bg-foreground" : " bg-border")
                }
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

function BookingNavbar({ tutorId }: { tutorId: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <nav
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8"
        aria-label="Main navigation"
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
          href={`/tutors/${encodeURIComponent(tutorId)}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/58 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" /> Back to tutor
          profile
        </Link>
      </nav>
    </header>
  );
}

function AvailabilityError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-destructive/10">
        <AlertCircle className="size-7 text-destructive" aria-hidden="true" />
      </span>
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Failed to load availability
        </h3>
        <p className="mt-1 text-sm text-foreground/56">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all hover:-translate-y-0.5 hover:shadow-xl"
      >
        <RefreshCw className="size-4" aria-hidden="true" /> Try again
      </button>
    </div>
  );
}

function AvailabilityEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-secondary">
        <CalendarDays className="size-7 text-foreground/40" aria-hidden="true" />
      </span>
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          No available slots
        </h3>
        <p className="mt-1 text-sm text-foreground/56">
          This tutor has no available time slots in the next 14 days. Please
          check back later.
        </p>
      </div>
    </div>
  );
}

function BookingError({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-destructive/10">
        <AlertCircle className="size-7 text-destructive" aria-hidden="true" />
      </span>
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Booking failed
        </h3>
        <p className="mt-1 text-sm text-foreground/56">{message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all hover:-translate-y-0.5 hover:shadow-xl"
      >
        Try again
      </button>
    </div>
  );
}

function AvailabilityLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="size-5 animate-pulse rounded bg-foreground/10" />
        <div className="h-8 w-48 animate-pulse rounded bg-foreground/10" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-3xl border border-border bg-background p-4"
          >
            <div className="h-3 w-12 rounded bg-foreground/10" />
            <div className="mt-3 h-8 w-10 rounded bg-foreground/10" />
            <div className="mt-1 h-3 w-16 rounded bg-foreground/10" />
            <div className="mt-3 h-3 w-20 rounded bg-foreground/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Convert backend availability slots to DayAvailability for the calendar
function buildDayAvailability(
  slots: AvailabilitySlotView[],
): DayAvailability[] {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const dayMap = new Map<string, AvailabilitySlotView[]>();

  for (const slot of slots) {
    const startDate = new Date(slot.startAt);
    const dateKey = startDate.toISOString().split("T")[0];
    const existing = dayMap.get(dateKey) ?? [];
    existing.push(slot);
    dayMap.set(dateKey, existing);
  }

  const days: DayAvailability[] = [];

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];
    const daySlots = dayMap.get(dateKey) ?? [];

    const timeSlots: TimeSlot[] = daySlots.map((slot) => {
      const startDate = new Date(slot.startAt);
      const timeStr = startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return {
        id: slot.id,
        time: timeStr,
        available: true,
      };
    });

    days.push({
      date: dateKey,
      dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: date.getDate(),
      monthName: date.toLocaleDateString("en-US", { month: "short" }),
      isToday: date.toDateString() === now.toDateString(),
      slots: timeSlots,
    });
  }

  return days;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutorId = searchParams.get("tutorId") ?? "";

  const { getAccessToken, user } = useAuth();
  const { state: availState, retry: retryAvailability } =
    useAvailability(tutorId);
  const { state: createState, createBooking, reset: resetCreate } =
    useCreateBooking();

  const [tutor, setTutor] = useState<PublicTutorDetailDto | null>(null);
  const [tutorLoading, setTutorLoading] = useState(true);
  const [tutorError, setTutorError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<BookingStep>("calendar");
  const [selectedDay, setSelectedDay] = useState<DayAvailability | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentDetails>(
    INITIAL_STUDENT_DETAILS,
  );

  // Fetch tutor data
  useEffect(() => {
    if (!tutorId) {
      setTutorLoading(false);
      setTutorError("No tutor ID provided");
      return;
    }

    let cancelled = false;
    setTutorLoading(true);
    setTutorError(null);

    tutorProfileApiClient
      .getTutorDetail(tutorId)
      .then((response) => {
        if (!cancelled) {
          setTutor(response.data);
          setTutorLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setTutorError(
            err instanceof Error ? err.message : "Failed to load tutor data",
          );
          setTutorLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tutorId]);

  // Redirect if no tutorId
  useEffect(() => {
    if (!tutorId) {
      router.replace("/search");
    }
  }, [tutorId, router]);

  // Build calendar days from availability
  const days = useMemo(() => {
    if (availState.status === "success") {
      return buildDayAvailability(availState.slots);
    }
    return [];
  }, [availState]);

  const selectedDaySlots = selectedDay?.slots ?? [];

  // Find the selected availability slot for booking
  const selectedAvailabilitySlot = useMemo(() => {
    if (
      availState.status !== "success" ||
      !selectedSlot
    ) {
      return null;
    }
    return (
      availState.slots.find((s) => s.id === selectedSlot.id) ?? null
    );
  }, [availState, selectedSlot]);

  // Get selected subject info
  const selectedSubject = useMemo(() => {
    if (!tutor || !studentDetails.subject) return null;
    return (
      tutor.subjects.find(
        (s) => s.subjectName === studentDetails.subject,
      ) ?? null
    );
  }, [tutor, studentDetails.subject]);

  // Calculate pricing
  const pricing = useMemo(() => {
    if (!selectedAvailabilitySlot || !selectedSubject) return null;

    const hourlyRate = selectedSubject.hourlyRate
      ? parseFloat(selectedSubject.hourlyRate)
      : 0;

    const startAt = new Date(selectedAvailabilitySlot.startAt);
    const endAt = new Date(selectedAvailabilitySlot.endAt);
    const durationMinutes = Math.round(
      (endAt.getTime() - startAt.getTime()) / 60000,
    );
    const priceAmount = (hourlyRate * durationMinutes) / 60;
    const platformFee = priceAmount * (PLATFORM_FEE_PERCENT / 100);
    const total = priceAmount + platformFee;

    return {
      hourlyRate,
      durationMinutes,
      priceAmount: priceAmount.toFixed(2),
      platformFee: platformFee.toFixed(2),
      total: total.toFixed(2),
      currency: tutor?.currency ?? "INR",
    };
  }, [selectedAvailabilitySlot, selectedSubject, tutor]);

  const isDetailsValid = useCallback(() => {
    return (
      studentDetails.studentName.trim().length >= 2 &&
      /\S+@\S+\.\S+/.test(studentDetails.studentEmail) &&
      studentDetails.studentPhone.trim().length > 0 &&
      studentDetails.ageOrGrade.trim().length > 0 &&
      studentDetails.subject.trim().length > 0
    );
  }, [studentDetails]);

  const canContinueCalendar = selectedDay !== null && selectedSlot !== null;

  const handleDaySelect = (day: DayAvailability) => {
    setSelectedDay(day);
    setSelectedSlot(null);
  };

  const handleContinue = async () => {
    if (currentStep === "calendar") {
      setCurrentStep("details");
    } else if (currentStep === "details") {
      setCurrentStep("review");
    } else if (currentStep === "review") {
      // Submit booking
      if (
        !tutor ||
        !selectedAvailabilitySlot ||
        !selectedSubject ||
        !pricing
      ) {
        return;
      }

      const accessToken = getAccessToken();
      if (!accessToken) {
        router.push("/login");
        return;
      }

      // We need a studentId - for now use the user's id as a fallback
      // In production, the user would select from their students
      const studentId = user?.id ?? "";

      const booking = await createBooking({
        studentId,
        tutorId: tutor.id,
        subjectId: selectedSubject.subjectId,
        tutorSubjectId: selectedSubject.id,
        availabilitySlotId: selectedAvailabilitySlot.id,
        accessToken,
      });

      if (booking) {
        const params = new URLSearchParams({
          bookingId: booking.publicId,
          tutorName: tutor.displayName ?? "Tutor",
          subject: studentDetails.subject,
          date: formatDate(selectedAvailabilitySlot.startAt),
          time: formatTime(selectedAvailabilitySlot.startAt),
          amount: `${pricing.currency} ${pricing.total}`,
        });
        router.push(`/booking/success?${params.toString()}`);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === "details") {
      setCurrentStep("calendar");
    } else if (currentStep === "review") {
      setCurrentStep("details");
    }
  };

  const getContinueLabel = () => {
    switch (currentStep) {
      case "calendar":
        return "Continue to details";
      case "details":
        return "Continue to review";
      case "review":
        return "Confirm booking";
      default:
        return "Continue";
    }
  };

  const isContinueDisabled = () => {
    switch (currentStep) {
      case "calendar":
        return !canContinueCalendar;
      case "details":
        return !isDetailsValid();
      case "review":
        return createState.status === "loading";
      default:
        return false;
    }
  };

  // Handle loading/error states
  if (tutorLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <BookingNavbar tutorId={tutorId} />
        <section className="px-5 py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center py-20">
              <div className="size-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (tutorError || !tutor) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <BookingNavbar tutorId={tutorId} />
        <section className="px-5 py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <AvailabilityError
              message={tutorError ?? "Tutor not found"}
              onRetry={() => window.location.reload()}
            />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BookingNavbar tutorId={tutorId} />

      <section className="px-5 py-10 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_23rem]">
          {/* Main Content */}
          <div>
            {createState.status === "error" ? (
              <BookingError
                message={createState.message}
                onDismiss={resetCreate}
              />
            ) : (
              <>
                <StepIndicator currentStep={currentStep} />

                <div className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)] sm:p-8">
                  {currentStep === "calendar" && (
                    <>
                      {availState.status === "loading" && (
                        <AvailabilityLoading />
                      )}
                      {availState.status === "error" && (
                        <AvailabilityError
                          message={availState.message}
                          onRetry={retryAvailability}
                        />
                      )}
                      {availState.status === "empty" && (
                        <AvailabilityEmpty />
                      )}
                      {availState.status === "success" && (
                        <>
                          <CalendarComponent
                            days={days}
                            selectedDay={selectedDay}
                            onDaySelect={handleDaySelect}
                          />
                          {selectedDay && (
                            <TimeSlotSelector
                              slots={selectedDaySlots}
                              selectedSlot={selectedSlot}
                              onSlotSelect={setSelectedSlot}
                            />
                          )}
                        </>
                      )}
                    </>
                  )}

                  {currentStep === "details" && (
                    <StudentDetailsForm
                      details={studentDetails}
                      onChange={setStudentDetails}
                    />
                  )}

                  {currentStep === "review" && (
                    <ReviewScreen
                      selectedDay={selectedDay}
                      selectedSlot={selectedSlot}
                      studentDetails={studentDetails}
                    />
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-6 flex items-center justify-between gap-4">
                  {currentStep !== "calendar" && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                    >
                      <ChevronLeft className="size-4" aria-hidden="true" />{" "}
                      Back
                    </button>
                  )}

                  <div className="ml-auto">
                    <div className="w-full min-w-[220px]">
                      <ContinueButton
                        onClick={handleContinue}
                        disabled={isContinueDisabled()}
                        loading={createState.status === "loading"}
                        label={getContinueLabel()}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <BookingSummary
            selectedDay={selectedDay}
            selectedSlot={selectedSlot}
            studentDetails={studentDetails}
          />
        </div>
      </section>
    </main>
  );
}
