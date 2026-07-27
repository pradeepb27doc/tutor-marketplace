import { cn } from "@/lib/utils";
import type { TimeSlot } from "@/types/booking";
import { Clock3 } from "lucide-react";

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
}

export default function TimeSlotSelector({
  slots,
  selectedSlot,
  onSlotSelect,
}: TimeSlotSelectorProps) {
  const availableSlots = slots.filter((slot) => slot.available);

  if (availableSlots.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-5">
      <div className="flex items-center gap-3">
        <Clock3 className="size-5 text-foreground" aria-hidden="true" />
        <h3 className="text-xl font-semibold tracking-[-0.03em]">
          Available time slots
        </h3>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {slots.map((slot) => {
          const isSelected = selectedSlot?.id === slot.id;

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSlotSelect(slot)}
              disabled={!slot.available}
              className={cn(
                "rounded-2xl border border-border px-5 py-4 text-center text-sm font-semibold transition-all duration-200",
                slot.available
                  ? isSelected
                    ? "border-foreground bg-foreground text-background shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                    : "bg-background text-foreground hover:border-foreground hover:bg-secondary/50"
                  : "cursor-not-allowed opacity-40",
              )}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
