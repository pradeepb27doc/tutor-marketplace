"use client";

import type { NotificationDto, CursorPage } from "../types";
import { NotificationCard } from "./notification-card";

interface NotificationsListProps {
  items: NotificationDto[];
  page: CursorPage | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  onRetry: () => void;
  onLoadMore: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

export function NotificationsList({
  items,
  page,
  isLoading,
  isFetching,
  error,
  onRetry,
  onLoadMore,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}: NotificationsListProps) {
  if (isLoading) {
    return <SkeletonRows />;
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-border bg-background px-6 py-20 text-center">
        <p className="text-lg font-semibold">Unable to load notifications</p>
        <p className="mt-2 text-sm text-foreground/60">{error.message}</p>
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          Try again
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-border bg-background px-6 py-20 text-center">
        <p className="text-lg font-semibold">No notifications yet</p>
        <p className="mt-2 text-sm text-foreground/60">We’ll surface relevant updates here when they arrive.</p>
      </div>
    );
  }

  const hasUnread = items.some((n) => !n.readAt);

  return (
    <div className="space-y-6">
      {hasUnread && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-foreground/60">You have unread notifications</p>
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-semibold text-foreground/70 transition-colors hover:text-foreground"
          >
            Mark all as read
          </button>
        </div>
      )}

      <div className="space-y-3">
        {items.map((n) => (
          <NotificationCard
            key={n.id}
            notification={n}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
          />
        ))}
      </div>

      {page?.hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isFetching}
          className="w-full rounded-[2rem] border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:text-foreground disabled:opacity-60"
        >
          {isFetching ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-[2rem] border border-border bg-foreground/5" />
      ))}
    </div>
  );
}