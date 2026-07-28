"use client";

import { DAY_ORDER } from "../constants";
import { formatDayLabel } from "../lib/format";
import { SlotCard } from "./slot-card";
import { BreakCard } from "./break-card";
import type { TutorAvailability, WeeklySlot, BreakPeriod } from "../types";

interface WeeklyScheduleProps {
  availability: TutorAvailability;
  onEditSlot: (slot: WeeklySlot) => void;
  onDeleteSlot: (slot: WeeklySlot) => void;
  onCreateBreak: () => void;
  onDeleteBreak: (breakPeriod: BreakPeriod) => void;
}

export function WeeklySchedule({
  availability,
  onEditSlot,
  onDeleteSlot,
  onCreateBreak,
  onDeleteBreak,
}: WeeklyScheduleProps) {
  return (
    <div className="space-y-3">
      {DAY_ORDER.map((day) => {
        const slots = availability.weeklySlots.filter(
          (s) => s.dayOfWeek === day,
        );
        // All-day breaks (dayOfWeek === null) are shown on Monday only
        const breaks = availability.breaks.filter(
          (b) => b.dayOfWeek === day || (b.dayOfWeek === null && day === "MONDAY"),
        );
        const isEmpty = slots.length === 0 && breaks.length === 0;

        return (
          <div
            key={day}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                {formatDayLabel(day)}
              </h3>
              {day === "MONDAY" ? (
                <button
                  type="button"
                  onClick={onCreateBreak}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  + Add break
                </button>
              ) : null}
            </div>
            <div className="mt-2 space-y-2">
              {slots.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  onEdit={onEditSlot}
                  onDelete={onDeleteSlot}
                />
              ))}
              {breaks.map((b) => (
                <BreakCard
                  key={b.id}
                  breakPeriod={b}
                  onDelete={onDeleteBreak}
                />
              ))}
              {isEmpty ? (
                <p className="text-xs text-gray-500">No availability</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
