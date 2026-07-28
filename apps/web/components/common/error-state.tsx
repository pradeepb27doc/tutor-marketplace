import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

interface AppErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  homeHref?: string;
  className?: string;
}

export function AppErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  homeHref,
  className = "mx-auto max-w-3xl px-4 py-10",
}: AppErrorStateProps) {
  return (
    <div className={className} role="alert" aria-live="assertive">
      <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-red-100">
          <AlertCircle className="size-6 text-red-700" aria-hidden="true" />
        </span>
        <h2 className="mt-3 text-base font-semibold text-red-900">{title}</h2>
        <p className="mt-1 text-sm text-red-700">{message}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
            >
              <RefreshCw className="size-4" aria-hidden="true" /> Retry
            </button>
          ) : null}
          {homeHref ? (
            <Link
              href={homeHref}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-red-900 ring-1 ring-inset ring-red-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
            >
              Go back
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}