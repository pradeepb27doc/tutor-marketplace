"use client";

import { BookingTable } from "@/features/admin/components/bookings/booking-table";

export default function AdminBookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage all bookings. Filter by status and cancel bookings when necessary.
        </p>
      </div>
      <BookingTable />
    </div>
  );
}
