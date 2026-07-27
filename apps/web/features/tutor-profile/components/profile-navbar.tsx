"use client";

import Link from "next/link";

export function ProfileNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <nav
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="Tutor Marketplace home"
        >
          <span className="grid size-9 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:scale-105">
            <span className="size-2.5 rounded-full bg-background" />
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">
            Tutor Marketplace
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-foreground/62 md:flex">
          <Link href="/search" className="transition-colors hover:text-foreground">
            Search
          </Link>
          <Link href="/#subjects" className="transition-colors hover:text-foreground">
            Subjects
          </Link>
          <Link
            href="/#become-a-tutor"
            className="transition-colors hover:text-foreground"
          >
            Become a Tutor
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="hidden rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary sm:inline-flex"
          >
            Back to Search
          </Link>
        </div>
      </nav>
    </header>
  );
}