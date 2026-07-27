"use client";

import { Bell, BellOff } from "lucide-react";
import type { NotificationDto } from "../types";

interface NotificationCardProps {
  notification: NotificationDto;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function formatRelativeTime(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function NotificationCard({ notification, onMarkAsRead, onDelete }: NotificationCardProps) {
  const isUnread = !notification.readAt;

  return (
    <div className="flex items-start gap-4 rounded-[2rem] border border-border bg-background px-5 py-5 transition-colors">
      <div className="mt-1 grid size-10 shrink-0 place-items-center rounded-full bg-foreground/5">
        {isUnread ? (
          <Bell className="size-5 text-foreground/80" aria-hidden="true" />
        ) : (
          <BellOff className="size-5 text-foreground/40" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">{notification.title}</p>
          <time className="whitespace-nowrap text-xs text-foreground/50" dateTime={notification.createdAt}>
            {formatRelativeTime(notification.createdAt)}
          </time>
        </div>

        <p className="mt-1 text-sm leading-7 text-foreground/68">{notification.body}</p>

        <div className="mt-3 flex items-center gap-2">
          {isUnread && (
            <span className="inline-flex items-center rounded-full bg-foreground/5 px-2.5 py-1 text-xs font-medium text-foreground/70">
              Unread
            </span>
          )}
          {isUnread && onMarkAsRead && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="inline-flex items-center rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Mark as read
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(notification.id)}
              className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground/70 transition-colors hover:text-foreground"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}