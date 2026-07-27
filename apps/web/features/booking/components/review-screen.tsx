import { pricingBreakdown, tutor } from "@/features/booking/data";
import type { DayAvailability, StudentDetails, TimeSlot } from "@/types/booking";
import { CheckCircle2, Star } from "lucide-react";

interface ReviewScreenProps {
  selectedDay: DayAvailability | null;
  selectedSlot: TimeSlot | null;
  studentDetails: StudentDetails;
}

export default function ReviewScreen({
  selectedDay,
  selectedSlot,
  studentDetails,
}: ReviewScreenProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-foreground text-background">
          <span className="size-2.5 rounded-full bg-background" />
        </span>
        <h2 className="text-2xl font-semibold tracking-[-0.035em]">
          Review & confirm
        </h2>
      </div>

      <p className="text-sm leading-6 text-foreground/56">
        Please review all the details below before confirming your booking.
      </p>

      <div className="space-y-6">
        {/* Tutor Info */}
        <div className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">
            Your tutor
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-3xl bg-foreground text-xl font-semibold text-background">
              {tutor.initials}
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-[-0.03em]">
                {tutor.name}
              </h3>
              <p className="mt-1 text-sm text-foreground/56">{tutor.title}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground/68">
                  <Star className="size-3.5 fill-foreground text-foreground" aria-hidden="true" />
                  {tutor.rating} · {tutor.reviewCount} reviews
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground/68">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  {tutor.badge}
                </span>
              </div>
              <p className="mt-3 text-sm text-foreground/56">
                {tutor.experience} experience · {tutor.teachingMode}
              </p>
            </div>
          </div>
        </div>

        {/* Selected Slot */}
        {selectedDay && selectedSlot && (
          <div className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">
              Selected date & time
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                  Date
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {selectedDay.dayName}, {selectedDay.dayNumber}{" "}
                  {selectedDay.monthName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                  Time
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {selectedSlot.time}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Student Details */}
        <div className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">
            Student details
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                Name
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {studentDetails.studentName || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                Subject
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {studentDetails.subject || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                Age / Grade
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {studentDetails.ageOrGrade || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                Contact
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {studentDetails.studentEmail || "—"}
              </p>
              <p className="mt-1 text-sm text-foreground/56">
                {studentDetails.studentPhone || "—"}
              </p>
            </div>
            {studentDetails.learningGoals && (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                  Learning goals
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {studentDetails.learningGoals}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">
            Pricing
          </p>
          <div className="mt-4 space-y-3">
            {pricingBreakdown.map((item) => (
              <div
                key={item.label}
                className={
                  item.label === "Total"
                    ? "flex items-center justify-between border-t border-border pt-3 text-lg font-semibold"
                    : "flex items-center justify-between text-sm"
                }
              >
                <span className="text-foreground/56">{item.label}</span>
                <span className="text-foreground">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
