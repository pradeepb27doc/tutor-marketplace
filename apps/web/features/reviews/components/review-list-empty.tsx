export interface ReviewListEmptyProps {
  message?: string;
}

export function ReviewListEmpty({ message = "No reviews yet" }: ReviewListEmptyProps) {
  return (
    <div className="rounded-2xl border border-border bg-background p-8 text-center">
      <p className="text-sm text-foreground/60">{message}</p>
    </div>
  );
}