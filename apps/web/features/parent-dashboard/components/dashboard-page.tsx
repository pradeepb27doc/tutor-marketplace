"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../auth/components/auth-provider";
import { useDashboard } from "../hooks/use-dashboard";
import { OverviewSection } from "./overview-section";
import { BookingsSection } from "./bookings-section";
import { StudentsSection } from "./students-section";
import { PaymentsSection } from "./payments-section";
import { QuickActionsSection } from "./quick-actions-section";

export function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { state, loading, errors, retry } = useDashboard(true);

  if (!isAuthenticated && !authLoading) {
    router.replace("/login");
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {state.profile ? `Welcome, ${state.profile.fullName}` : "Dashboard"}
        </h1>
        <QuickActionsSection profileName={state.profile?.fullName} />
      </div>

      <OverviewSection stats={state.stats} />

      <BookingsSection
        title="Upcoming Classes"
        loading={loading.upcomingBookings}
        error={errors.upcomingBookings}
        bookings={state.upcomingBookings}
        emptySection="upcomingBookings"
        onRetry={() => retry("upcomingBookings")}
      />

      <BookingsSection
        title="Recent Bookings"
        loading={loading.recentBookings}
        error={errors.recentBookings}
        bookings={state.recentBookings}
        emptySection="recentBookings"
        onRetry={() => retry("recentBookings")}
      />

      <StudentsSection
        loading={loading.students}
        error={errors.students}
        students={state.students}
        onRetry={() => retry("students")}
      />

      <PaymentsSection
        loading={loading.payments}
        error={errors.payments}
        payments={state.payments}
        onRetry={() => retry("payments")}
      />
    </div>
  );
}
