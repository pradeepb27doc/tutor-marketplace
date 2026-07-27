import { useState, useEffect, useCallback } from "react";
import {
  fetchTutorDashboard,
  fetchTutorAvailability,
  fetchTutorBookings,
  fetchTutorVerificationStatus,
  acceptTutorBooking,
  rejectTutorBooking,
} from "../services/dashboard-service";
import type {
  TutorDashboardSummary,
  TutorBooking,
  TutorAvailability,
  TutorVerificationStatus,
} from "../types";

export function useTutorDashboard(accessToken: string | null) {
  const [data, setData] = useState<TutorDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchTutorDashboard(accessToken)
      .then((summary) => {
        if (!cancelled) setData(summary);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const retry = useCallback(() => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    fetchTutorDashboard(accessToken)
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load dashboard"),
      )
      .finally(() => setLoading(false));
  }, [accessToken]);

  return { data, loading, error, retry };
}

export function useTutorAvailability(accessToken: string | null) {
  const [data, setData] = useState<TutorAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchTutorAvailability(accessToken)
      .then((availability) => {
        if (!cancelled) setData(availability);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load availability");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const retry = useCallback(() => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    fetchTutorAvailability(accessToken)
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load availability"),
      )
      .finally(() => setLoading(false));
  }, [accessToken]);

  return { data, loading, error, retry };
}

export function useTutorBookings(accessToken: string | null) {
  const [bookings, setBookings] = useState<TutorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    (query?: { status?: string; from?: string; to?: string; limit?: number; cursor?: string }) => {
      if (!accessToken) return;
      setLoading(true);
      setError(null);
      fetchTutorBookings(accessToken, query)
        .then(setBookings)
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Failed to load bookings"),
        )
        .finally(() => setLoading(false));
    },
    [accessToken],
  );

  useEffect(() => {
    load();
  }, [load]);

  const accept = useCallback(
    (bookingId: string) => {
      if (!accessToken) return Promise.reject("Missing access token");
      return acceptTutorBooking(accessToken, bookingId).then(() => load());
    },
    [accessToken, load],
  );

  const reject = useCallback(
    (bookingId: string) => {
      if (!accessToken) return Promise.reject("Missing access token");
      return rejectTutorBooking(accessToken, bookingId).then(() => load());
    },
    [accessToken, load],
  );

  return { bookings, loading, error, refetch: load, accept, reject };
}

export function useTutorVerification(accessToken: string | null) {
  const [data, setData] = useState<TutorVerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchTutorVerificationStatus(accessToken)
      .then((status) => {
        if (!cancelled) setData(status);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load verification");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const retry = useCallback(() => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    fetchTutorVerificationStatus(accessToken)
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load verification"),
      )
      .finally(() => setLoading(false));
  }, [accessToken]);

  return { data, loading, error, retry };
}