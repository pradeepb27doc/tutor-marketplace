import React from "react";
import { DashboardSectionCard } from "./dashboard-section-card";

interface QuickActionsSectionProps {
  profileName?: string;
}

export function QuickActionsSection({ profileName }: QuickActionsSectionProps) {
  return (
    <DashboardSectionCard title="Quick Actions">
      <div className="flex flex-wrap gap-3">
        <a
          href="/search"
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          Find Tutors
        </a>
        <a
          href="/signup"
          className="inline-flex items-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700"
        >
          {profileName ? "Edit Profile" : "Complete Profile"}
        </a>
      </div>
    </DashboardSectionCard>
  );
}