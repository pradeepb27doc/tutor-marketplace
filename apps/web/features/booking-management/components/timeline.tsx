"use client";

import React from "react";
import type { StatusHistoryEntryResponse } from "../types";
import { bookingStatusToVariant, formatBookingStatus, type BookingManagementStatus } from "../types";

interface TimelineProps {
  history: StatusHistoryEntryResponse[];
}

export function Timeline({ history }: TimelineProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-xs text-gray-600">No status history available.</p>
      </div>
    );
  }

  const sorted = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <ol className="relative border-l border-gray-200">
      {sorted.map((entry) => {
        const date = new Date(entry.createdAt);
        return (
          <li key={entry.id} className="mb-4 ml-4">
            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-400" />
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  bookingStatusToVariant(entry.toStatus as BookingManagementStatus) === "success"
                    ? "bg-green-100 text-green-800"
                    : bookingStatusToVariant(entry.toStatus as BookingManagementStatus) === "danger"
                      ? "bg-red-100 text-red-800"
                      : bookingStatusToVariant(entry.toStatus as BookingManagementStatus) === "warning"
                        ? "bg-yellow-100 text-yellow-800"
                        : bookingStatusToVariant(entry.toStatus as BookingManagementStatus) === "info"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                }`}
              >
                {formatBookingStatus(entry.toStatus as BookingManagementStatus)}
              </span>
              <span className="text-[10px] text-gray-500">
                {date.toLocaleString()}
              </span>
            </div>
            {entry.reason && (
              <p className="mt-1 text-xs text-gray-700">{entry.reason}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}