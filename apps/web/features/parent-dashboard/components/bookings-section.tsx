import React from "react";
import { DashboardSectionCard } from "./dashboard-section-card";
import { EmptyState } from "./empty-state";
import { ErrorCard } from "./error-card";
import { SkeletonCard } from "./skeleton-card";
import { bookingStatusToVariant, formatBookingStatus } from "../types";
import type { BookingResponse } from "../types";

interface BookingsSectionProps {
  title: string;
  loading: "idle" | "loading" | "success" | "error";
  error: string | null;
  bookings: { data: BookingResponse[] };
  emptySection: "upcomingBookings" | "recentBookings";
  onRetry: () => void;
}

export function BookingsSection({
  title,
  loading,
  error,
  bookings,
  emptySection,
  onRetry,
}: BookingsSectionProps) {
  return (
    <DashboardSectionCard title={title}>
      {error ? (
        <ErrorCard message={error} onRetry={onRetry} />
      ) : loading === "loading" ? (
        <SkeletonCard />
      ) : bookings.data.length === 0 ? (
        <EmptyState section={emptySection} />
      ) : (
        <ul className="divide-y divide-gray-100">
          {bookings.data.map((booking) => (
            <li key={booking.id} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {booking.subjectName ?? "Booking"}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {booking.tutor?.fullName
                      ? `Tutor: ${booking.tutor.fullName}`
                      : `Student: ${booking.student?.fullName ?? "-"}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(booking.scheduledStart).toLocaleString()} •{" "}
                    {booking.durationMinutes} mins
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      bookingStatusToVariant(booking.status) === "success"
                        ? "bg-green-100 text-green-800"
                        : bookingStatusToVariant(booking.status) === "danger"
                          ? "bg-red-100 text-red-800"
                          : bookingStatusToVariant(booking.status) === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {formatBookingStatus(booking.status)}
                  </span>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: booking.currency,
                    }).format(booking.amount)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardSectionCard>
  );
}