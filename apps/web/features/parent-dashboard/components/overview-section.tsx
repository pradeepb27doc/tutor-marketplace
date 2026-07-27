import React from "react";
import type { DashboardStats } from "../types";

interface OverviewSectionProps {
  stats: DashboardStats;
}

export function OverviewSection({ stats }: OverviewSectionProps) {
  const items = [
    { label: "Upcoming Classes", value: stats.upcomingClasses },
    { label: "Completed Bookings", value: stats.completedBookings },
    { label: "Cancelled Bookings", value: stats.cancelledBookings },
    { label: "Students", value: stats.totalStudents },
    {
      label: "Pending Payments",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
      }).format(stats.pendingPayments),
    },
    {
      label: "Total Spent",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
      }).format(stats.totalSpent),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p className="text-sm text-gray-600">{item.label}</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}