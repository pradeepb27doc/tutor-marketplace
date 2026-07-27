import { cn } from "@/lib/utils";
import type { DayAvailability } from "@/types/booking";
import { CalendarDays } from "lucide-react";

interface CalendarProps {
  days: DayAvailability[];
  selectedDay: DayAvailability | null;
  onDaySelect: (day: DayAvailability) => void;
}

export default function Calendar({ days, selectedDay, onDaySelect }: CalendarProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <CalendarDays className="size-5 text-foreground" aria-hidden="true" />
        <h2 className="text-2xl font-semibold tracking-[-0.035em]">Select a date</h2>
      </div>

      <p className="text-sm leading-6 text-foreground/56">
        Choose a day to see available time slots. Weekday evenings and weekend
        mornings are open this week.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((day) => {
          const isSelected = selectedDay?.date === day.date;
          const hasSlots = day.slots.some((slot) => slot.available);

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onDaySelect(day)}
              disabled={!hasSlots}
              className={cn(
                "group rounded-3xl border border-border bg-background p-4 text-left transition-all duration-300",
                isSelected &&
                  "border-foreground bg-secondary/50 shadow-[0_18px_50px_rgba(15,23,42,0.06)]",
                !hasSlots && "cursor-not-allowed opacity-50",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                  {day.dayName}
                </span>
                {day.isToday && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-xs font-semibold text-background">
                    Today
                  </span>
                )}
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">
                {day.dayNumber}
              </p>
              <p className="mt-1 text-sm text-foreground/46">{day.monthName}</p>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-foreground/30" />
                <span className="text-xs font-medium text-foreground/56">
                  {day.slots.filter((s) => s.available).length} slots available
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
