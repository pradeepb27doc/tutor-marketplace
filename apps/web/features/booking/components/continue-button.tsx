import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ContinueButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}

export default function ContinueButton({
  onClick,
  disabled,
  loading,
  label = "Continue",
}: ContinueButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background",
        (disabled || loading) &&
          "cursor-not-allowed opacity-50 hover:transform-none hover:shadow-none",
      )}
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
      ) : (
        <ArrowRight className="size-4" aria-hidden="true" />
      )}
      {label}
    </button>
  );
}
