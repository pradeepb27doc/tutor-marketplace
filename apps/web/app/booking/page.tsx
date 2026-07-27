"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronLeft } from "lucide-react";

import Calendar from "@/features/booking/components/calendar";
import TimeSlotSelector from "@/features/booking/components/time-slot-selector";
import StudentDetailsForm from "@/features/booking/components/student-details-form";
import ReviewScreen from "@/features/booking/components/review-screen";
import BookingSummary from "@/features/booking/components/booking-summary";
import ContinueButton from "@/features/booking/components/continue-button";
import { generateWeekDates, tutor } from "@/features/booking/data";
import type {
  BookingStep,
  DayAvailability,
  StudentDetails,
  TimeSlot,
} from "@/types/booking";

const steps: { key: BookingStep; label: string; description: string }[] = [
  {
    key: "calendar",
    label: "Select date & time",
    description: "Choose a day and available time slot for your trial class.",
  },
  {
    key: "details",
    label: "Student details",
    description: "Tell us about the student so the tutor can prepare.",
  },
  {
    key: "review",
    label: "Review & confirm",
    description: "Review all details before confirming your booking.",
  },
];

const initialStudentDetails: StudentDetails = {
  studentName: "",
  studentEmail: "",
  studentPhone: "",
  ageOrGrade: "",
  subject: "",
  learningGoals: "",
};

function StepIndicator({ currentStep }: { currentStep: BookingStep }) {
  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <nav
      aria-label="Booking progress"
      className="mb-8 flex items-center justify-between"
    >
      {steps.map((step, index) => {
        const isActive = step.key === currentStep;
        const isComplete = index < stepIndex;

        return (
          <div key={step.key} className="flex flex-1">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={
                  "grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold transition-all" +
                  (isActive
                    ? " bg-foreground text-background"
                    : isComplete
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
                    (isActive
                      ? " text-foreground"
                      : isComplete
                        ? " text-foreground"
                        : " text-foreground/40")
                  }
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-xs text-foreground/46">
                  {step.description}
                </p>
              </div>
            </div>

            {index < steps.length - 1 && (
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

function BookingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <nav
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/tutors/1"
          className="group flex items-center gap-3"
          aria-label="Back to tutor profile"
        >
          <span className="grid size-9 place-items-center rounded-full border border-foreground/12 bg-foreground text-background transition-transform duration-300 group-hover:scale-105">
            <span className="size-2.5 rounded-full bg-background" />
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">
            Tutor Marketplace
          </span>
        </Link>

        <Link
          href="/tutors/1"
          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/58 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" /> Back to tutor
          profile
        </Link>
      </nav>
    </header>
  );
}

function ConfirmationView() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <span className="grid size-20 place-items-center rounded-full bg-foreground text-background">
        <CheckCircle2 className="size-10" aria-hidden="true" />
      </span>
      <h2 className="text-3xl font-semibold tracking-[-0.035em]">
        Booking confirmed!
      </h2>
      <p className="max-w-md text-foreground/56">
        Your trial class with {tutor.name} is booked. A confirmation email has
        been sent to your inbox. You can manage this booking from your
        dashboard.
      </p>
      <Link
        href="/tutors/1"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      >
        Back to tutor profile
      </Link>
    </div>
  );
}

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState<BookingStep>("calendar");
  const [selectedDay, setSelectedDay] = useState<DayAvailability | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [studentDetails, setStudentDetails] =
    useState<StudentDetails>(initialStudentDetails);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const days = generateWeekDates();
  const selectedDaySlots = selectedDay?.slots ?? [];

  const isDetailsValid = () => {
    return (
      studentDetails.studentName.trim().length >= 2 &&
      /\S+@\S+\.\S+/.test(studentDetails.studentEmail) &&
      studentDetails.studentPhone.trim().length > 0 &&
      studentDetails.ageOrGrade.trim().length > 0 &&
      studentDetails.subject.trim().length > 0
    );
  };

  const canContinueCalendar = selectedDay !== null && selectedSlot !== null;

  const handleDaySelect = (day: DayAvailability) => {
    setSelectedDay(day);
    setSelectedSlot(null);
  };

  const handleContinue = () => {
    if (currentStep === "calendar") {
      setCurrentStep("details");
    } else if (currentStep === "details") {
      setCurrentStep("review");
    } else if (currentStep === "review") {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setConfirmed(true);
      }, 1500);
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
        return false;
      default:
        return false;
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BookingNavbar />

      <section className="px-5 py-10 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_23rem]">
          {/* Main Content */}
          <div>
            {confirmed ? (
              <ConfirmationView />
            ) : (
              <>
                <StepIndicator currentStep={currentStep} />

                <div className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)] sm:p-8">
                  {currentStep === "calendar" && (
                    <>
                      <Calendar
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
                      <ChevronLeft className="size-4" aria-hidden="true" /> Back
                    </button>
                  )}

                  <div className="ml-auto">
                    <div className="w-full min-w-[220px]">
                      <ContinueButton
                        onClick={handleContinue}
                        disabled={isContinueDisabled()}
                        loading={loading}
                        label={getContinueLabel()}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          {!confirmed && (
            <BookingSummary
              selectedDay={selectedDay}
              selectedSlot={selectedSlot}
              studentDetails={studentDetails}
            />
          )}
        </div>
      </section>
    </main>
  );
}
