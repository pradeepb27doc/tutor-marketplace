"use client";

import { useAuth } from "@/features/auth/components/auth-provider";
import { RouteGuard } from "@/features/auth/components/route-guard";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationsList } from "./notifications-list";

export function NotificationsPageClient() {
  const { isLoading: authLoading } = useAuth();
  const { notifications, page, isLoading, isFetching, error, refresh, loadMore, markAsRead, markAllAsRead, delete: deleteNotification } =
    useNotifications();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-5 py-10">
          <div className="h-10 w-48 animate-pulse rounded-full bg-foreground/5" />
        </div>
      </div>
    );
  }

  return (
    <RouteGuard>
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-[-0.04em]">Notifications</h1>
        </div>
        <div className="mt-8">
          <NotificationsList
            items={notifications}
            page={page}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error}
            onRetry={refresh}
            onLoadMore={loadMore}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
          />
        </div>
      </div>
    </div>
    </RouteGuard>
  );
}