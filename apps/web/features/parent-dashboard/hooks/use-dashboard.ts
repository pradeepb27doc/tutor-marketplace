"use client";

import { useCallback, useEffect, useState } from "react";
import { authService } from "../../auth/services/auth-service";
import { dashboardApiClient, DashboardApiError } from "../services/dashboard-service";
import type {
  DashboardState,
  DashboardLoadingState,
  DashboardErrorState,
  ParentProfileResponse,
  StudentResponse,
  BookingResponse,
  PaymentResponse,
  ListResponse,
  DashboardStats,
} from "../types";
import { DASHBOARD_PAGE_SIZE, STUDENT_LIMIT } from "../constants";

const nowIso = (): string => new Date().toISOString();

function emptyList<T>(): ListResponse<T> {
  return { data: [], hasMore: false };
}

function buildStats(
  profile: ParentProfileResponse | null,
  students: ListResponse<StudentResponse>,
  upcomingBookings: ListResponse<BookingResponse>,
  recentBookings: ListResponse<BookingResponse>,
  payments: ListResponse<PaymentResponse>,
): DashboardStats {
  const completed = recentBookings.data.filter((b) =>
    b.status === "COMPLETED",
  ).length;
  const cancelled = recentBookings.data.filter((b) =>
    ["CANCELLED_BY_PARENT", "CANCELLED_BY_TUTOR", "REJECTED"].includes(
      b.status,
    ),
  ).length;

  const pendingAmount = payments.data
    .filter((p) => ["PENDING", "AUTHORIZED", "CREATED"].includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0);

  const totalSpent = payments.data
    .filter((p) => p.status === "CAPTURED")
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    upcomingClasses: upcomingBookings.data.length,
    completedBookings: completed,
    cancelledBookings: cancelled,
    totalStudents: students.data.length,
    pendingPayments: pendingAmount,
    totalSpent,
  };
}

export function useDashboard(enabled = true) {
  const [state, setState] = useState<DashboardState>({
    profile: null,
    students: emptyList<StudentResponse>(),
    upcomingBookings: emptyList<BookingResponse>(),
    recentBookings: emptyList<BookingResponse>(),
    payments: emptyList<PaymentResponse>(),
    stats: {
      upcomingClasses: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalStudents: 0,
      pendingPayments: 0,
      totalSpent: 0,
    },
  });

  const [loading, setLoading] = useState<DashboardLoadingState>({
    profile: "idle",
    students: "idle",
    upcomingBookings: "idle",
    recentBookings: "idle",
    payments: "idle",
  });

  const [errors, setErrors] = useState<DashboardErrorState>({
    profile: null,
    students: null,
    upcomingBookings: null,
    recentBookings: null,
    payments: null,
  });

  const setPartState = useCallback(
    <K extends keyof DashboardState>(
      key: K,
      updater: (prev: DashboardState[K]) => DashboardState[K],
    ) => {
      setState((prev) => ({ ...prev, [key]: updater(prev[key]) }));
    },
    [],
  );

  const setPartLoading = useCallback(
    (key: keyof DashboardLoadingState, value: DashboardLoadingState[keyof DashboardLoadingState]) => {
      setLoading((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setPartError = useCallback(
    (key: keyof DashboardErrorState, value: string | null) => {
      setErrors((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const refresh = useCallback(async () => {
    const accessToken = authService.getAccessToken();
    if (!accessToken) {
      setPartState("profile", () => null);
      setPartLoading("profile", "error");
      setPartError("profile", "Unauthorized");
      return;
    }

    try {
      // Profile
      setPartLoading("profile", "loading");
      setPartError("profile", null);
      const profileRes = await dashboardApiClient.getProfile(accessToken);
      setPartState("profile", () => profileRes.data);
      setPartLoading("profile", "success");

      // Students
      setPartLoading("students", "loading");
      setPartError("students", null);
      const studentsRes = await dashboardApiClient.listStudents(
        accessToken,
        STUDENT_LIMIT,
      );
      setPartState("students", () => ({
        data: studentsRes.data,
        hasMore: false,
      }));
      setPartLoading("students", "success");

      // Upcoming bookings (ACCEPTED future)
      setPartLoading("upcomingBookings", "loading");
      setPartError("upcomingBookings", null);
      const upcoming = await dashboardApiClient.listBookings(accessToken, {
        status: "ACCEPTED",
        from: nowIso(),
        limit: DASHBOARD_PAGE_SIZE,
      });
      setPartState("upcomingBookings", () => upcoming);
      setPartLoading("upcomingBookings", "success");

      // Recent bookings (recent history)
      setPartLoading("recentBookings", "loading");
      setPartError("recentBookings", null);
      const recent = await dashboardApiClient.listBookings(accessToken, {
        limit: DASHBOARD_PAGE_SIZE,
      });
      setPartState("recentBookings", () => recent);
      setPartLoading("recentBookings", "success");

      // Payments
      setPartLoading("payments", "loading");
      setPartError("payments", null);
      const payments = await dashboardApiClient.listPayments(accessToken, {
        limit: DASHBOARD_PAGE_SIZE,
      });
      setPartState("payments", () => payments);
      setPartLoading("payments", "success");

      // Stats
      setState((prev) => {
        const stats = buildStats(
          prev.profile ?? profileRes.data,
          studentsRes.data.length ? { data: studentsRes.data, hasMore: false } : prev.students,
          upcoming,
          recent,
          payments,
        );
        return { ...prev, stats };
      });
    } catch (error) {
      if (error instanceof DashboardApiError) {
        if (!state.profile) setPartError("profile", error.message);
        if (!state.students.data.length) setPartError("students", error.message);
        if (!state.upcomingBookings.data.length)
          setPartError("upcomingBookings", error.message);
        if (!state.recentBookings.data.length)
          setPartError("recentBookings", error.message);
        if (!state.payments.data.length) setPartError("payments", error.message);
      }
    } finally {
      setLoading((prev) => {
        const next = { ...prev };
        (Object.keys(next) as Array<keyof DashboardLoadingState>).forEach((key) => {
          if (next[key] === "loading") next[key] = "success";
        });
        return next;
      });
    }
  }, [setPartState, setPartLoading, setPartError, state.profile, state.students.data.length, state.upcomingBookings.data.length, state.recentBookings.data.length, state.payments.data.length]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
  }, [enabled, refresh]);

  const retry = useCallback(
    (key: keyof DashboardErrorState) => {
      setPartError(key, null);
      refresh();
    },
    [setPartError, refresh],
  );

  return {
    state,
    loading,
    errors,
    refresh,
    retry,
  };
}