"use client";

import { useEffect } from "react";
import { AppErrorState } from "@/components/common/error-state";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <AppErrorState
      title="Something went wrong"
      message="The page could not be displayed. Please try again."
      onRetry={reset}
      homeHref="/"
      className="mx-auto max-w-3xl px-4 py-16"
    />
  );
}