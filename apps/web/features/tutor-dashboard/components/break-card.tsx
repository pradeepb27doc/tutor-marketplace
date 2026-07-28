"use client";

import { Trash2 } from "lucide-react";
import { formatTimeRange } from "../lib/format";
import { formatDayLabel } from "../lib/format";
import type { BreakPeriod } from "../types";

interface BreakCardProps {
  breakPeriod: BreakPeriod;
  onDelete: (breakPeriod: BreakPeriod) => void;
}

export function BreakCard({ breakPeriod, onDelete }: BreakCardProps) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">
            Break: {formatTimeRange(breakPeriod.startTime, breakPeriod.endTime)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {breakPeriod.dayOfWeek ? (
              <span>{formatDayLabel(breakPeriod.dayOfWeek)}</span>
            ) : (
              <span>All days</span>
            )}
            {breakPeriod.reason ? <span>· {breakPeriod.reason}</span> : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDelete(breakPeriod)}
          className="rounded-md p-1 text-gray-500 hover:bg-red-100 hover:text-red-600"
          aria-label="Delete break period"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
