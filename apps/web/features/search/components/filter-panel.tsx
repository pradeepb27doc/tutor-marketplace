import { ChevronDown, SlidersHorizontal } from "lucide-react";

const filters = [
  {
    title: "Subject",
    options: ["Mathematics", "Physics", "Chemistry", "Coding", "English"],
  },
  {
    title: "Board",
    options: ["CBSE", "ICSE", "IB", "IGCSE", "State Board"],
  },
  {
    title: "Experience",
    options: ["2+ years", "5+ years", "8+ years", "10+ years"],
  },
  {
    title: "Price Range",
    options: ["Under ₹500", "₹500 - ₹800", "₹800 - ₹1,200", "₹1,200+"],
  },
  {
    title: "Rating",
    options: ["4.9+", "4.8+", "4.5+", "4.0+"],
  },
  {
    title: "Mode",
    options: ["One-on-one", "Group class", "Exam intensive", "Doubt solving"],
  },
  {
    title: "Language",
    options: ["English", "Hindi", "Tamil", "Bengali", "Marathi"],
  },
  {
    title: "Availability",
    options: ["Today", "This week", "Weekends", "Evenings"],
  },
  {
    title: "Online / Offline",
    options: ["Online", "Offline nearby", "Hybrid"],
  },
];

interface FilterPanelProps {
  variant?: "desktop" | "mobile";
}

export function FilterPanel({ variant = "desktop" }: FilterPanelProps) {
  return (
    <aside
      className={
        variant === "desktop"
          ? "hidden lg:block"
          : "rounded-[2rem] border border-border bg-background p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
      }
      aria-label="Tutor filters"
    >
      <div
        className={
          variant === "desktop"
            ? "sticky top-28 rounded-[2rem] border border-border bg-background p-5"
            : ""
        }
      >
        <div className="flex items-center justify-between border-b border-border pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">
              Filters
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.035em]">
              Refine tutors
            </h2>
          </div>
          <SlidersHorizontal
            className="size-5 text-foreground/50"
            aria-hidden="true"
          />
        </div>

        <div className="mt-5 space-y-5">
          {filters.map((filter) => (
            <details
              key={filter.title}
              className="group rounded-3xl border border-border bg-secondary/25 p-4"
              open={variant === "desktop"}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground">
                {filter.title}
                <ChevronDown
                  className="size-4 text-foreground/42 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="mt-4 space-y-3">
                {filter.options.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-3 text-sm text-foreground/62 transition-colors hover:text-foreground"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-border accent-foreground"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </aside>
  );
}