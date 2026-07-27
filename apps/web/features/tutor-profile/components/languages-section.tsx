"use client";

import { memo } from "react";
import { Languages } from "lucide-react";
import type { PublicTutorLanguageDto } from "../types";
import { SectionCard } from "./section-card";

interface LanguagesSectionProps {
  languages: PublicTutorLanguageDto[];
}

function LanguagesSectionInner({ languages }: LanguagesSectionProps) {
  if (languages.length === 0) return null;

  return (
    <SectionCard eyebrow="Languages" title="Languages spoken">
      <div className="flex flex-wrap gap-3">
        {languages.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground/64"
          >
            <Languages className="size-4 text-foreground" aria-hidden="true" />
            {item.language}
            {item.proficiency && (
              <span className="text-xs font-medium text-foreground/44">
                {item.proficiency}
              </span>
            )}
          </span>
        ))}
      </div>
    </SectionCard>
  );
}

export const LanguagesSection = memo(LanguagesSectionInner);