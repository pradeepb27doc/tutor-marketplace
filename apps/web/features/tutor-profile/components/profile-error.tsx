"use client";

import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ProfileErrorProps {
  message: string;
  onRetry: () => void;
}

export function ProfileError({ message, onRetry }: ProfileErrorProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-5 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-destructive/10">
        <AlertCircle className="size-8 text-destructive" aria-hidden="true" />
      </span>
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold tracking-[-0.04em]">
          Something went wrong
        </h1>
        <p className="mt-3 leading-7 text-foreground/58">{message}</p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Retry
        </button>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Search
        </Link>
      </div>
    </main>
  );
}