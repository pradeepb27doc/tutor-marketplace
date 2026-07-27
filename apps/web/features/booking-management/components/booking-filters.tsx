"use client";

import React from "react";
import type { BookingQueryParams } from "../types";
import { BOOKING_STATUS_FILTERS } from "../constants";

interface BookingFiltersProps {
  filters: BookingQueryParams;
  onChange: (filters: BookingQueryParams) => void;
}

export function BookingFilters({ filters, onChange }: BookingFiltersProps) {
  const updateFilter = <Key extends keyof BookingQueryParams>(
    key: Key,
    value: BookingQueryParams[Key],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={filters.status ?? ""}
        onChange={(event) => updateFilter("status", event.target.value || undefined)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
      >
        <option value="">All Statuses</option>
        {BOOKING_STATUS_FILTERS.map((status) => (
          <option key={status} value={status}>
            {status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={filters.from ?? ""}
        onChange={(event) => updateFilter("from", event.target.value || undefined)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        placeholder="From"
      />

      <input
        type="date"
        value={filters.to ?? ""}
        onChange={(event) => updateFilter("to", event.target.value || undefined)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        placeholder="To"
      />
    </div>
  );
}