"use client";

import { memo } from "react";
import { GraduationCap } from "lucide-react";
import type { PublicTutorQualificationDto } from "../types";
import { SectionCard } from "./section-card";

interface QualificationsSectionProps {
  qualifications: PublicTutorQualificationDto[];
}

function QualificationsSectionInner({
  qualifications,
}: QualificationsSectionProps) {
  if (qualifications.length === 0) return null;

  return (
    <SectionCard
      eyebrow="Qualifications"
      title="Reviewed credentials and qualifications"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {qualifications.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 rounded-3xl border border-border bg-secondary/25 p-4 text-sm font-medium text-foreground/64"
          >
            <GraduationCap
              className="mt-0.5 size-4 shrink-0 text-foreground"
              aria-hidden="true"
            />
            <div>
              <p>{item.title}</p>
              {(item.institutionName || item.completionYear) && (
                <p className="mt-1 text-xs text-foreground/44">
                  {[item.institutionName, item.completionYear?.toString()]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export const QualificationsSection = memo(QualificationsSectionInner);