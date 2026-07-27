import { memo } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  subjectInput: string;
  boardInput: string;
  locationInput: string;
  onSubjectChange: (value: string) => void;
  onBoardChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function SearchBarInner({
  subjectInput,
  boardInput,
  locationInput,
  onSubjectChange,
  onBoardChange,
  onLocationChange,
  onSubmit,
}: SearchBarProps) {
  return (
    <form onSubmit={onSubmit}>
      <div className="mx-auto flex w-fit flex-wrap items-center justify-center gap-3 rounded-[2rem] border border-border bg-background p-2 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
        <label className="rounded-3xl px-5 py-4 transition-colors hover:bg-secondary/65">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42">
            Subject
          </span>
          <input
            className="mt-1 w-full bg-transparent text-base font-medium outline-none placeholder:text-foreground/35"
            placeholder="Mathematics, Physics..."
            aria-label="Subject"
            value={subjectInput}
            onChange={(e) => onSubjectChange(e.target.value)}
          />
        </label>
        <label className="rounded-3xl px-5 py-4 transition-colors hover:bg-secondary/65">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42">
            Board
          </span>
          <input
            className="mt-1 w-full bg-transparent text-base font-medium outline-none placeholder:text-foreground/35"
            placeholder="CBSE, IB, ICSE"
            aria-label="Board"
            value={boardInput}
            onChange={(e) => onBoardChange(e.target.value)}
          />
        </label>
        <label className="rounded-3xl px-5 py-4 transition-colors hover:bg-secondary/65">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42">
            Location / Mode
          </span>
          <input
            className="mt-1 w-full bg-transparent text-base font-medium outline-none placeholder:text-foreground/35"
            placeholder="Online or your city"
            aria-label="Location or mode"
            value={locationInput}
            onChange={(e) => onLocationChange(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          <Search className="size-4" aria-hidden="true" /> Search
        </button>
      </div>
    </form>
  );
}

export const SearchBar = memo(SearchBarInner);