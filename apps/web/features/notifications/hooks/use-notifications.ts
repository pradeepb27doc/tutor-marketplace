"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { NotificationDto, CursorPage } from "../types";
import { notificationsApiClient } from "../services/notifications-service";
import { DEFAULT_NOTIFICATIONS_LIMIT } from "../constants";

export interface UseNotificationsOptions {
  limit?: number;
  unreadOnly?: boolean;
}

export interface UseNotificationsResult {
  notifications: NotificationDto[];
  page: CursorPage | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  unreadCount: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const limit = options.limit ?? DEFAULT_NOTIFICATIONS_LIMIT;
  const unreadOnly = options.unreadOnly ?? false;

  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [page, setPage] = useState<CursorPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.readAt).length,
    [notifications],
  );

  useEffect(() => {
    setNotifications([]);
    setPage(null);
    setOffset(0);
    setHasMore(false);
    setError(null);
    setIsLoading(true);

    let cancelled = false;

    async function fetchInitial() {
      try {
        const result = await notificationsApiClient.listNotifications("", {
            limit,
            offset: 0,
            unreadOnly,
          },
        );

        if (cancelled) return;
        setNotifications(result.data ?? []);
        setPage(result.page ?? null);
        setHasMore((result.page?.hasMore) ?? false);
        setOffset((result.data?.length ?? 0));
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error("Failed to load notifications"));
      } finally {
        if (!cancelled) setIsLoading(false);
        if (!cancelled) setIsFetching(false);
      }
    }

    fetchInitial();

    return () => {
      cancelled = true;
    };
  }, [limit, unreadOnly]);

  const refresh = useCallback(async () => {
    setIsFetching(true);
    try {
      const result = await notificationsApiClient.listNotifications("", {
        limit,
        offset: 0,
        unreadOnly,
      });
      setNotifications(result.data ?? []);
      setPage(result.page ?? null);
      setHasMore((result.page?.hasMore) ?? false);
      setOffset((result.data?.length ?? 0));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to refresh notifications"));
    } finally {
      setIsFetching(false);
    }
  }, [limit, unreadOnly]);

  const loadMore = useCallback(async () => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);
    try {
      const nextOffset = offset;

      const result = await notificationsApiClient.listNotifications("", {
        limit,
        offset: nextOffset,
        unreadOnly,
      });

      setNotifications((prev) => [...prev, ...(result.data ?? [])]);
      setPage(result.page ?? null);
      setHasMore((result.page?.hasMore) ?? false);
      setOffset(nextOffset + (result.data?.length ?? 0));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load more notifications"));
    } finally {
      setIsFetching(false);
    }
  }, [hasMore, isFetching, limit, offset, unreadOnly]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n)),
    );
    try {
      await notificationsApiClient.markNotificationRead("", id);
    } catch {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: undefined } : n)));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
    );
    await Promise.allSettled(
      notifications.filter((n) => !n.readAt).map((n) => notificationsApiClient.markNotificationRead("", n.id)),
    );
    refresh();
  }, [notifications, refresh]);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // Backend does not expose delete notification, so omitted.
  }, []);

  const result: UseNotificationsResult = {
    notifications,
    page,
    isLoading,
    isFetching,
    error,
    unreadCount,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    delete: deleteNotification,
  };

  return result;
}