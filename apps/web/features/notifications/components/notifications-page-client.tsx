"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationsList } from "./notifications-list";

export function NotificationsPageClient() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
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

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      router.push("/login");
    }
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-5 py-10">
          <p className="text-sm text-foreground/60">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
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
  );
}