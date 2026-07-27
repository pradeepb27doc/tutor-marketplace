"use client";

import { memo } from "react";
import type { PublicTutorSubjectDto } from "../types";
import { formatFee } from "../lib/format";
import { SectionCard } from "./section-card";

interface SubjectsSectionProps {
  subjects: PublicTutorSubjectDto[];
}

function SubjectsSectionInner({ subjects }: SubjectsSectionProps) {
  const activeSubjects = subjects.filter((s) => s.isActive);
  if (activeSubjects.length === 0) return null;

  return (
    <SectionCard eyebrow="Subjects & Boards" title="Subjects taught across curricula">
      <div className="grid gap-4">
        {activeSubjects.map((subject) => {
          const curricula = subject.curricula.length > 0
            ? subject.curricula.join(", ")
            : null;
          const grades = subject.gradeMin != null && subject.gradeMax != null
            ? `Grades ${subject.gradeMin}-${subject.gradeMax}`
            : subject.gradeMin != null
              ? `Grade ${subject.gradeMin}+`
              : subject.gradeMax != null
                ? `Up to Grade ${subject.gradeMax}`
                : null;
          const modes = subject.serviceModes.length > 0
            ? subject.serviceModes.map((m) => m === "ONLINE" ? "Online" : m === "OFFLINE" ? "Offline" : m === "HYBRID" ? "Hybrid" : m).join(" · ")
            : null;

          return (
            <article
              key={subject.id}
              className="rounded-3xl border border-border p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.035em]">
                    {subject.subjectName}
                  </h3>
                  {grades && (
                    <span className="mt-1 inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground/64">
                      {grades}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {subject.hourlyRate && (
                    <p className="text-lg font-semibold">
                      {formatFee(subject.hourlyRate, "INR")}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-foreground/56">
                {curricula && <span>{curricula}</span>}
                {modes && <span className="text-foreground/32">·</span>}
                {modes && <span>{modes}</span>}
              </div>
            </article>
          );
        })}
      </div>
    </SectionCard>
  );
}

export const SubjectsSection = memo(SubjectsSectionInner);