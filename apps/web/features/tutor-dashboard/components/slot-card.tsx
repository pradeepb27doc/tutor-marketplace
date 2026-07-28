"use client";

import { Edit, Trash2 } from "lucide-react";
import { SERVICE_MODE_LABELS } from "../constants";
import { formatTimeRange } from "../lib/format";
import type { WeeklySlot } from "../types";

interface SlotCardProps {
  slot: WeeklySlot;
  onEdit: (slot: WeeklySlot) => void;
  onDelete: (slot: WeeklySlot) => void;
}

export function SlotCard({ slot, onEdit, onDelete }: SlotCardProps) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {formatTimeRange(slot.startTime, slot.endTime)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium">
              {SERVICE_MODE_LABELS[slot.serviceMode] ?? slot.serviceMode}
            </span>
            {slot.capacity ? (
              <span>· {slot.capacity} student(s)</span>
            ) : null}
            {slot.timezone ? <span>· {slot.timezone}</span> : null}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(slot)}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Edit slot"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(slot)}
            className="rounded-md p-1 text-gray-500 hover:bg-red-100 hover:text-red-600"
            aria-label="Delete slot"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
