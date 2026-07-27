"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../auth/components/auth-provider";
import { useTutorDashboard, useTutorBookings, useTutorAvailability, useTutorVerification } from "../hooks/use-tutor-dashboard";
import { ErrorCard } from "./error-card";
import { SkeletonCard } from "./skeleton-card";
import { EmptyState } from "./empty-state";
import {
  BOOKING_STATUS_COLORS,
  SERVICE_MODE_COLORS,
  VERIFICATION_STATUS_COLORS,
  DOCUMENT_STATUS_COLORS,
  DAY_ORDER,
} from "../constants";
import type { TutorBooking } from "../types";

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatTimeRange(startTime: string, endTime: string) {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

function TutorDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, getAccessToken, user } = useAuth();
  const token = getAccessToken();

  const { data: dashboard, loading: dashboardLoading, error: dashboardError, retry: retryDashboard } = useTutorDashboard(token);
  const { bookings, loading: bookingsLoading, error: bookingsError, accept, reject } = useTutorBookings(token);
  const { data: availability, loading: availabilityLoading, error: availabilityError, retry: retryAvailability } = useTutorAvailability(token);
  const { data: verification, loading: verificationLoading, error: verificationError, retry: retryVerification } = useTutorVerification(token);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  const isTutor = user && (user.primaryRole === "TUTOR" || user.roles.includes("TUTOR"));
  if (!isTutor) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState
          title="Not authorized"
          description="This dashboard is available only for tutors."
          action={
            <button
              type="button"
              onClick={() => router.replace("/dashboard")}
              className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Go to your dashboard
            </button>
          }
        />
      </div>
    );
  }

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b: TutorBooking) => b.status === "PENDING").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Tutor Dashboard</h1>

      <div className="mt-6 space-y-6">
        {dashboardError ? (
          <ErrorCard title="Dashboard error" message={dashboardError} onRetry={retryDashboard} />
        ) : dashboardLoading ? (
          <SkeletonCard />
        ) : dashboard ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-600">Profile completion</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{dashboard.profileCompletionPercent}%</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-600">Completed classes</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{dashboard.completedClassesCount}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-600">Average rating</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{dashboard.averageRating}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-600">Active subjects</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{dashboard.activeSubjectCount}</p>
            </div>
          </div>
        ) : null}

        {bookingsError ? (
          <ErrorCard title="Bookings error" message={bookingsError} />
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900">Bookings</h2>
              <p className="text-sm text-gray-600">Total: {totalBookings} · Pending: {pendingBookings}</p>
            </div>
            <div className="border-t border-gray-100 p-4">
              {bookingsLoading ? (
                <SkeletonCard />
              ) : bookings.length === 0 ? (
                <EmptyState title="No bookings" description="You do not have any booking requests yet." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 pr-4 font-medium text-gray-700">Student</th>
                        <th className="py-2 pr-4 font-medium text-gray-700">Subject</th>
                        <th className="py-2 pr-4 font-medium text-gray-700">Date</th>
                        <th className="py-2 pr-4 font-medium text-gray-700">Time</th>
                        <th className="py-2 pr-4 font-medium text-gray-700">Status</th>
                        <th className="py-2 pr-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking: TutorBooking) => {
                        const start = new Date(booking.scheduledAt);
                        const end = new Date(start.getTime() + booking.durationMinutes * 60000);
                        const startLabel = `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`;
                        const endLabel = `${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;
                        return (
                          <tr key={booking.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 pr-4 text-gray-900">{booking.studentName}</td>
                            <td className="py-3 pr-4 text-gray-700">{booking.subjectName}</td>
                            <td className="py-3 pr-4 text-gray-700">{formatDate(booking.scheduledAt)}</td>
                            <td className="py-3 pr-4 text-gray-700">{formatTimeRange(startLabel, endLabel)}</td>
                            <td className="py-3 pr-4">
                              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${BOOKING_STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-800"}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              {booking.status === "PENDING" ? (
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => accept(booking.id)}
                                    className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => reject(booking.id)}
                                    className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {availabilityError ? (
          <ErrorCard title="Availability error" message={availabilityError} onRetry={retryAvailability} />
        ) : availabilityLoading ? (
          <SkeletonCard />
        ) : availability ? (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
              <p className="text-sm text-gray-600">Manage your recurring availability and breaks.</p>
            </div>
            <div className="space-y-4 border-t border-gray-100 p-4">
              {DAY_ORDER.map((day) => {
                const slots = availability.weeklySlots.filter((slot) => slot.dayOfWeek === day);
                const breaks = availability.breaks.filter((b) => b.dayOfWeek === day);
                return (
                  <div key={day} className="rounded-md border border-gray-100 p-3">
                    <p className="text-sm font-semibold text-gray-900">{day}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {slots.map((slot) => (
                        <span
                          key={slot.id}
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${SERVICE_MODE_COLORS[slot.serviceMode] || "bg-gray-100 text-gray-800"}`}
                        >
                          {formatTimeRange(slot.startTime, slot.endTime)} · {slot.serviceMode}
                        </span>
                      ))}
                      {breaks.map((b) => (
                        <span key={b.id} className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                          Break {formatTimeRange(b.startTime, b.endTime)}
                          {b.reason ? ` · ${b.reason}` : null}
                        </span>
                      ))}
                      {slots.length === 0 && breaks.length === 0 ? (
                        <span className="text-xs text-gray-500">No availability</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {verificationError ? (
          <ErrorCard title="Verification error" message={verificationError} onRetry={retryVerification} />
        ) : verificationLoading ? (
          <SkeletonCard />
        ) : verification ? (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900">Verification</h2>
            </div>
            <div className="space-y-4 border-t border-gray-100 p-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${VERIFICATION_STATUS_COLORS[verification.status] || "bg-gray-100 text-gray-800"}`}>
                  {verification.status}
                </span>
              </div>
              {verification.rejectionReason ? (
                <div>
                  <p className="text-sm text-gray-600">Rejection reason</p>
                  <p className="mt-1 text-sm text-gray-900">{verification.rejectionReason}</p>
                </div>
              ) : null}
              <div>
                <p className="text-sm text-gray-600">Documents</p>
                <div className="mt-2 space-y-2">
                  {verification.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-md border border-gray-100 p-2">
                      <span className="text-sm text-gray-900">{doc.type}</span>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${DOCUMENT_STATUS_COLORS[doc.status] || "bg-gray-100 text-gray-800"}`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                  {verification.documents.length === 0 ? (
                    <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default TutorDashboardPage;