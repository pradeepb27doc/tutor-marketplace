import React from "react";
import { EMPTY_MESSAGES } from "../constants";

interface EmptyStateProps {
  section: keyof typeof EMPTY_MESSAGES;
}

export function EmptyState({ section }: EmptyStateProps) {
  const message = EMPTY_MESSAGES[section] ?? "No data available.";

  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}