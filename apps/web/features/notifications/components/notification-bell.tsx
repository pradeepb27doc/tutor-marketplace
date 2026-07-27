"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useNotifications } from "../hooks/use-notifications";
import { NOTIFICATIONS_ROUTE } from "../constants";

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();

  if (!isAuthenticated) return null;

  return (
    <Link
      href={NOTIFICATIONS_ROUTE}
      className="relative inline-flex items-center justify-center rounded-full p-2 transition-colors hover:text-foreground"
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
    >
      <Bell className="size-5" aria-hidden="true" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}