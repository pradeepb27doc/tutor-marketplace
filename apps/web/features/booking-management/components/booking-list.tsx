"use client";

import React from "react";
import type { BookingManagementResponse } from "../types";
import { BookingListItem } from "./booking-list-item";
import { SkeletonRow } from "./skeleton-row";
import { ErrorState } from "./error-state";
import { EmptyState } from "./empty-state";

interface BookingListProps {
  loading: boolean;
  error: string | null;
  bookings: { data: BookingManagementResponse[] } | { data: never[] };
  activeTab: string;
  onRetry: () => void;
}

export function BookingList({
  loading,
  error,
  bookings,
  activeTab,
  onRetry,
}: BookingListProps) {
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (loading) {
    return (
      <ul className="divide-y divide-gray-100">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </ul>
    );
  }

  const items = "data" in bookings ? bookings.data : [];

  if (items.length === 0) {
    return <EmptyState tab={activeTab} />;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {items.map((booking) => (
        <BookingListItem
          key={booking.id}
          booking={booking}
          href={`/bookings/${booking.id}`}
        />
      ))}
    </ul>
  );
}