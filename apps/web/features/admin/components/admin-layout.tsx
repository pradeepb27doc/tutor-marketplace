"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "../constants";
import { useAuth } from "@/features/auth/components/auth-provider";
import { LogOutIcon, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 flex-col gap-2 overflow-y-auto bg-white border-r border-gray-200 transition-transform duration-200 lg:translate-x-0 lg:flex",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden rounded-md p-1 text-gray-500 hover:bg-gray-100"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.value}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
              {user?.displayName?.charAt(0) ?? user?.primaryRole?.charAt(0) ?? "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName ?? "Admin User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.primaryRole ?? "ADMIN"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOutIcon className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto lg:ml-0">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 bg-white border-b border-gray-200 px-4 lg:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </header>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
