import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({
  message = "Something went wrong while fetching tutors. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-border bg-background px-6 py-20 text-center">
      <div className="grid size-20 place-items-center rounded-full bg-red-50 dark:bg-red-950/30">
        <AlertTriangle className="size-10 text-red-500" aria-hidden="true" />
      </div>
      <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">Unable to load tutors</h3>
      <p className="mt-3 max-w-md text-lg leading-7 text-foreground/58">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      >
        Try again
      </button>
    </div>
  );
}