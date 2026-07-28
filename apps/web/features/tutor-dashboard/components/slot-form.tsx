"use client";

import { useState } from "react";
import { DAY_ORDER, SERVICE_MODE_OPTIONS } from "../constants";
import { formatDayLabel } from "../lib/format";
import type {
  SlotFormData,
  FieldErrors,
  MutationResult,
} from "../types";

interface SlotFormProps {
  initialData?: Partial<SlotFormData>;
  onSubmit: (data: SlotFormData) => Promise<MutationResult>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function SlotForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SlotFormProps) {
  const [formData, setFormData] = useState<SlotFormData>({
    dayOfWeek: initialData?.dayOfWeek ?? "MONDAY",
    startTime: initialData?.startTime ?? "",
    endTime: initialData?.endTime ?? "",
    serviceMode: initialData?.serviceMode ?? "ONLINE",
    timezone: initialData?.timezone ?? "",
    capacity: initialData?.capacity ?? undefined,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleChange = (
    field: keyof SlotFormData,
    value: string | number | undefined,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const result = await onSubmit(formData);
    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
    }
    if (result.success) {
      onCancel();
    }
  };

  const formError = fieldErrors._form;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{formError}</p>
        </div>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Day of week
        </label>
        <select
          value={formData.dayOfWeek}
          onChange={(e) => handleChange("dayOfWeek", e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {DAY_ORDER.map((day) => (
            <option key={day} value={day}>
              {formatDayLabel(day)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start time
          </label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => handleChange("startTime", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {fieldErrors.startTime ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.startTime}</p>
          ) : null}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End time
          </label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => handleChange("endTime", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {fieldErrors.endTime ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.endTime}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Service mode
        </label>
        <select
          value={formData.serviceMode}
          onChange={(e) => handleChange("serviceMode", e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {SERVICE_MODE_OPTIONS.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
        {fieldErrors.serviceMode ? (
          <p className="mt-1 text-xs text-red-600">
            {fieldErrors.serviceMode}
          </p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Timezone (optional)
        </label>
        <input
          type="text"
          placeholder="Asia/Kolkata"
          value={formData.timezone ?? ""}
          onChange={(e) =>
            handleChange("timezone", e.target.value || undefined)
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {fieldErrors.timezone ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.timezone}</p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Capacity (optional)
        </label>
        <input
          type="number"
          min="1"
          max="999"
          placeholder="1"
          value={formData.capacity?.toString() ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            handleChange("capacity", val ? Number(val) : undefined);
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {fieldErrors.capacity ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.capacity}</p>
        ) : null}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
