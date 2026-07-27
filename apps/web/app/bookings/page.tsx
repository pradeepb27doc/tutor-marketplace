"use client";

import React from "react";
import { useAuth } from "../../features/auth/components/auth-provider";
import { useBookingsList } from "../../features/booking-management/hooks/use-bookings-list";
import { BookingTabs } from "../../features/booking-management/components/booking-tabs";
import { BookingList } from "../../features/booking-management/components/booking-list";
import { BookingFilters } from "../../features/booking-management/components/booking-filters";

export default function BookingsPage() {
  const { user, getAccessToken, isLoading: authLoading } = useAuth();
  const accessToken = getAccessToken();
  const role = user?.primaryRole ?? null;

  const {
    data,
    loading,
    error,
    filters,
    setFilters,
    activeTab,
    setActiveTab,
    retry,
  } = useBookingsList({ accessToken, role });

  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-sm text-gray-600">Please log in to view your bookings.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
      <p className="mt-1 text-sm text-gray-600">Manage your bookings</p>

      <div className="mt-6 space-y-4">
        <BookingTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          counts={{
            upcoming: data.upcomingCount,
            pending: data.pendingCount,
            completed: data.completedCount,
            cancelled: data.cancelledCount,
          }}
        />
        <BookingFilters filters={filters} onChange={setFilters} />
        <BookingList
          loading={loading}
          error={error}
          bookings={data}
          activeTab={activeTab}
          onRetry={retry}
        />
      </div>
    </div>
  );
}