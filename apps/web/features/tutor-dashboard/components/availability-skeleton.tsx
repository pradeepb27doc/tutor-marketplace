"use client";

import { DAY_ORDER } from "../constants";

export function AvailabilitySkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="flex gap-2">
          <div className="h-9 w-28 animate-pulse rounded-md bg-gray-200" />
          <div className="h-9 w-28 animate-pulse rounded-md bg-gray-200" />
        </div>
      </div>
      <div className="mb-4 h-4 w-64 animate-pulse rounded bg-gray-100" />
      <div className="space-y-3">
        {DAY_ORDER.map((day) => (
          <div
            key={day}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="mb-2 h-5 w-24 animate-pulse rounded bg-gray-200" />
            <div className="space-y-2">
              <div className="h-8 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-8 w-5/6 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
