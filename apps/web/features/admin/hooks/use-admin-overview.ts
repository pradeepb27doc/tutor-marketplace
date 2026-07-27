"use client";

import { useCallback, useEffect, useState } from "react";
import { authService } from "@/features/auth/services/auth-service";
import { adminApiClient, AdminApiError } from "../services/admin-service";
import type { AdminOverview, LoadStatus } from "../types";

export interface UseAdminOverviewResult {
  overview: AdminOverview | null;
  status: LoadStatus;
  error: string | null;
  refresh: () => void;
}

export function useAdminOverview(enabled = true): UseAdminOverviewResult {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    const accessToken = authService.getAccessToken();
    if (!accessToken) {
      setError("Unauthorized");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const res = await adminApiClient.getOverview(accessToken);
      setOverview(res.data);
      setStatus("success");
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load overview");
      }
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void fetchOverview();
  }, [enabled, fetchOverview]);

  return {
    overview,
    status,
    error,
    refresh: fetchOverview,
  };
}
