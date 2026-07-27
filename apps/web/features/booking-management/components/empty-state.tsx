"use client";

import React from "react";

interface EmptyStateProps {
  tab: string;
}

export function EmptyState({ tab }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-center">
      <p className="text-sm font-medium text-gray-900">No bookings found</p>
      <p className="mt-1 text-xs text-gray-600">
        {tab === "upcoming"
          ? "You don't have any upcoming bookings."
          : tab === "pending"
            ? "You don't have any pending bookings."
            : tab === "completed"
              ? "You don't have any completed bookings."
              : "You don't have any cancelled bookings."}
      </p>
    </div>
  );
}