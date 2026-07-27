"use client";

import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

export function ProfileNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-5 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-secondary">
        <SearchX className="size-8 text-foreground/60" aria-hidden="true" />
      </span>
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold tracking-[-0.04em]">
          Tutor not found
        </h1>
        <p className="mt-3 leading-7 text-foreground/58">
          The tutor you are looking for does not exist or is no longer
          available. It may have been removed or the link may be incorrect.
        </p>
      </div>
      <Link
        href="/search"
        className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Browse Tutors
      </Link>
    </main>
  );
}