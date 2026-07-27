"use client";

import React from "react";
import { BOOKING_STATUS_TABS } from "../constants";

interface BookingTabsProps {
  activeTab: string;
  onChange: (tab: "upcoming" | "pending" | "completed" | "cancelled") => void;
  counts: {
    upcoming: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
}

export function BookingTabs({ activeTab, onChange, counts }: BookingTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-6">
        {BOOKING_STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          const count =
            tab.value === "upcoming"
              ? counts.upcoming
              : tab.value === "pending"
                ? counts.pending
                : tab.value === "completed"
                  ? counts.completed
                  : counts.cancelled;

          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}