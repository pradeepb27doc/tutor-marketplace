import React from "react";
import { DashboardSectionCard } from "./dashboard-section-card";
import { EmptyState } from "./empty-state";
import { ErrorCard } from "./error-card";
import { SkeletonCard } from "./skeleton-card";
import type { StudentResponse } from "../types";

interface StudentsSectionProps {
  loading: "idle" | "loading" | "success" | "error";
  error: string | null;
  students: { data: StudentResponse[] };
  onRetry: () => void;
}

export function StudentsSection({
  loading,
  error,
  students,
  onRetry,
}: StudentsSectionProps) {
  return (
    <DashboardSectionCard title="Students">
      {error ? (
        <ErrorCard message={error} onRetry={onRetry} />
      ) : loading === "loading" ? (
        <SkeletonCard />
      ) : students.data.length === 0 ? (
        <EmptyState section="students" />
      ) : (
        <ul className="divide-y divide-gray-100">
          {students.data.map((student) => (
            <li key={student.id} className="py-2">
              <div className="font-medium text-gray-900">{student.fullName}</div>
              <div className="text-xs text-gray-600">
                {student.grade ?? "-"} {student.curriculum ?? ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardSectionCard>
  );
}