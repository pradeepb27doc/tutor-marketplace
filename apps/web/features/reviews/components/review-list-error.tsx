export interface ReviewListErrorProps {
  message: string;
  onRetry: () => void;
}

export function ReviewListError({ message, onRetry }: ReviewListErrorProps) {
  return (
    <div className="rounded-2xl border border-border bg-background p-8 text-center">
      <p className="text-sm text-red-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 text-sm font-medium text-foreground underline"
      >
        Retry
      </button>
    </div>
  );
}