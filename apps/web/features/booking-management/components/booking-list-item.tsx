"use client";

import React from "react";
import type { BookingManagementResponse } from "../types";
import { bookingStatusToVariant, formatBookingStatus } from "../types";

interface BookingListItemProps {
  booking: BookingManagementResponse;
  href: string;
}

export function BookingListItem({ booking, href }: BookingListItemProps) {
  const start = new Date(booking.startAt);
  const end = new Date(booking.endAt);
  const durationMinutes = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 60000),
  );

  return (
    <li className="py-3">
      <a
        href={href}
        className="flex items-center justify-between gap-3 rounded-md px-2 py-2 transition hover:bg-gray-50"
      >
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {booking.publicId}
          </p>
          <p className="text-xs text-gray-600 truncate">
            Subject ID: {booking.subjectId}
          </p>
          <p className="text-xs text-gray-500">
            {start.toLocaleString()} • {durationMinutes} mins
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
                    : bookingStatusToVariant(booking.status) === "info"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
            }`}
          >
            {formatBookingStatus(booking.status)}
          </span>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: booking.currency,
            }).format(Number(booking.priceAmount))}
          </p>
        </div>
      </a>
    </li>
  );
}