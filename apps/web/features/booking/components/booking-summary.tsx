import { cn } from "@/lib/utils";
import { pricingBreakdown, tutor } from "@/features/booking/data";
import type { DayAvailability, StudentDetails, TimeSlot } from "@/types/booking";
import { ShieldCheck, Star } from "lucide-react";

interface BookingSummaryProps {
  selectedDay: DayAvailability | null;
  selectedSlot: TimeSlot | null;
  studentDetails: StudentDetails;
}

export default function BookingSummary({
  selectedDay,
  selectedSlot,
  studentDetails,
}: BookingSummaryProps) {
  const hasSelection = selectedDay && selectedSlot;

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_28px_90px_rgba(15,23,42,0.10)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">
          Booking summary
        </p>

        <div className="mt-5 flex items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-4xl font-semibold tracking-[-0.055em] text-foreground">
              {tutor.trialRate}
            </p>
            <p className="mt-1 text-sm text-foreground/50">
              One trial class · {tutor.hourlyRate} thereafter
            </p>
          </div>
          <ShieldCheck className="size-6 text-foreground" aria-hidden="true" />
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-foreground text-lg font-semibold text-background">
              {tutor.initials}
            </div>
            <div>
              <p className="font-semibold text-foreground">{tutor.name}</p>
              <p className="mt-1 text-sm text-foreground/50">{tutor.title}</p>
              <div className="mt-1 flex items-center gap-1">
                <Star className="size-4 fill-foreground text-foreground" aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">
                  {tutor.rating}
                </span>
                <span className="text-sm text-foreground/50">
                  · {tutor.reviewCount} reviews
                </span>
              </div>
            </div>
          </div>

          {hasSelection && (
            <div className="rounded-3xl border border-border bg-secondary/25 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                Selected slot
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {selectedDay.dayName}, {selectedDay.dayNumber}{" "}
                {selectedDay.monthName}
              </p>
              <p className="mt-1 text-sm text-foreground/56">{selectedSlot.time}</p>
            </div>
          )}

          {studentDetails.studentName && (
            <div className="rounded-3xl border border-border bg-secondary/25 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                Student
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {studentDetails.studentName}
              </p>
              <p className="mt-1 text-sm text-foreground/56">
                {studentDetails.subject} · {studentDetails.ageOrGrade}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-2 border-t border-border pt-5">
          {pricingBreakdown.map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center justify-between text-sm",
                item.label === "Total" && "font-semibold",
              )}
            >
              <span className="text-foreground/56">{item.label}</span>
              <span className="text-foreground">{item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
