"use client";

import Link from "next/link";
import { NotificationBell } from "./notification-bell";
import { useAuth } from "@/features/auth/components/auth-provider";

const navigationItems = ["Find Tutors", "Subjects", "Become a Tutor", "About"];

export function SiteHeader() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-transparent bg-background/78 backdrop-blur-xl supports-[backdrop-filter]:bg-background/64">
      <nav aria-label="Main navigation" className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="#top" className="group flex items-center gap-3" aria-label="Tutor Marketplace home">
          <span className="grid size-9 place-items-center rounded-full border border-foreground/12 bg-foreground text-background transition-transform duration-300 group-hover:scale-105">
            <span className="size-2.5 rounded-full bg-background" />
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">Tutor Marketplace</span>
        </Link>

        <div className="hidden items-center gap-9 text-sm font-medium text-foreground/68 lg:flex">
          {navigationItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} className="transition-colors hover:text-foreground">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Link
                href="/dashboard"
                className="hidden text-sm font-medium text-foreground/70 transition-colors hover:text-foreground sm:inline-flex"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm font-medium text-foreground/70 transition-colors hover:text-foreground sm:inline-flex">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}