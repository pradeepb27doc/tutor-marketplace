import type { ReactNode } from "react";

interface SectionCardProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
}

export function SectionCard({ eyebrow, title, children }: SectionCardProps) {
  return (
    <section className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}