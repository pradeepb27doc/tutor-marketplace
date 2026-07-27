"use client";

import { cn } from "@/lib/utils";
import { subjectOptions } from "@/features/booking/data";
import type { StudentDetails } from "@/types/booking";
import { useState } from "react";

interface StudentDetailsFormProps {
  details: StudentDetails;
  onChange: (details: StudentDetails) => void;
}

interface FormErrors {
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  ageOrGrade?: string;
  subject?: string;
}

const validateField = (field: keyof StudentDetails, value: string): string => {
  switch (field) {
    case "studentName":
      if (!value.trim()) return "Student name is required";
      if (value.trim().length < 2) return "Enter at least 2 characters";
      return "";
    case "studentEmail":
      if (!value.trim()) return "Email is required";
      if (!/\S+@\S+\.\S+/.test(value)) return "Enter a valid email address";
      return "";
    case "studentPhone":
      if (!value.trim()) return "Phone number is required";
      return "";
    case "ageOrGrade":
      if (!value.trim()) return "Age or grade is required";
      return "";
    case "subject":
      if (!value) return "Subject is required";
      return "";
    default:
      return "";
  }
};

export default function StudentDetailsForm({
  details,
  onChange,
}: StudentDetailsFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: keyof StudentDetails, value: string) => {
    onChange({ ...details, [field]: value });
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  const handleBlur = (field: keyof StudentDetails, value: string) => {
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-foreground text-background">
          <span className="size-2.5 rounded-full bg-background" />
        </span>
        <h2 className="text-2xl font-semibold tracking-[-0.035em]">
          Student details
        </h2>
      </div>

      <p className="text-sm leading-6 text-foreground/56">
        Tell us about the student so the tutor can prepare the right lesson.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="studentName"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42"
          >
            Student name
          </label>
          <input
            id="studentName"
            type="text"
            value={details.studentName}
            onChange={(e) => handleChange("studentName", e.target.value)}
            onBlur={(e) => handleBlur("studentName", e.target.value)}
            className={cn(
              "mt-2 w-full rounded-3xl border border-border bg-background px-5 py-4 text-base font-medium text-foreground outline-none placeholder:text-foreground/35 transition-colors focus:border-foreground focus:bg-secondary/30",
              errors.studentName && "border-destructive",
            )}
            placeholder="e.g. Aarav Sharma"
            aria-invalid={!!errors.studentName}
            aria-describedby={errors.studentName ? "studentName-error" : undefined}
          />
          {errors.studentName && (
            <p
              id="studentName-error"
              className="mt-2 text-xs font-medium text-destructive"
            >
              {errors.studentName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="studentEmail"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42"
          >
            Email address
          </label>
          <input
            id="studentEmail"
            type="email"
            value={details.studentEmail}
            onChange={(e) => handleChange("studentEmail", e.target.value)}
            onBlur={(e) => handleBlur("studentEmail", e.target.value)}
            className={cn(
              "mt-2 w-full rounded-3xl border border-border bg-background px-5 py-4 text-base font-medium text-foreground outline-none placeholder:text-foreground/35 transition-colors focus:border-foreground focus:bg-secondary/30",
              errors.studentEmail && "border-destructive",
            )}
            placeholder="student@example.com"
            aria-invalid={!!errors.studentEmail}
            aria-describedby={errors.studentEmail ? "studentEmail-error" : undefined}
          />
          {errors.studentEmail && (
            <p
              id="studentEmail-error"
              className="mt-2 text-xs font-medium text-destructive"
            >
              {errors.studentEmail}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="studentPhone"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42"
          >
            Phone number
          </label>
          <input
            id="studentPhone"
            type="tel"
            value={details.studentPhone}
            onChange={(e) => handleChange("studentPhone", e.target.value)}
            onBlur={(e) => handleBlur("studentPhone", e.target.value)}
            className={cn(
              "mt-2 w-full rounded-3xl border border-border bg-background px-5 py-4 text-base font-medium text-foreground outline-none placeholder:text-foreground/35 transition-colors focus:border-foreground focus:bg-secondary/30",
              errors.studentPhone && "border-destructive",
            )}
            placeholder="+91 98765 43210"
            aria-invalid={!!errors.studentPhone}
            aria-describedby={errors.studentPhone ? "studentPhone-error" : undefined}
          />
          {errors.studentPhone && (
            <p
              id="studentPhone-error"
              className="mt-2 text-xs font-medium text-destructive"
            >
              {errors.studentPhone}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="ageOrGrade"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42"
          >
            Age / Grade
          </label>
          <input
            id="ageOrGrade"
            type="text"
            value={details.ageOrGrade}
            onChange={(e) => handleChange("ageOrGrade", e.target.value)}
            onBlur={(e) => handleBlur("ageOrGrade", e.target.value)}
            className={cn(
              "mt-2 w-full rounded-3xl border border-border bg-background px-5 py-4 text-base font-medium text-foreground outline-none placeholder:text-foreground/35 transition-colors focus:border-foreground focus:bg-secondary/30",
              errors.ageOrGrade && "border-destructive",
            )}
            placeholder="e.g. 14 years / Grade 9"
            aria-invalid={!!errors.ageOrGrade}
            aria-describedby={errors.ageOrGrade ? "ageOrGrade-error" : undefined}
          />
          {errors.ageOrGrade && (
            <p
              id="ageOrGrade-error"
              className="mt-2 text-xs font-medium text-destructive"
            >
              {errors.ageOrGrade}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="subject"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42"
          >
            Subject
          </label>
          <select
            id="subject"
            value={details.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            onBlur={(e) => handleBlur("subject", e.target.value)}
            className={cn(
              "mt-2 w-full appearance-none rounded-3xl border border-border bg-background px-5 py-4 text-base font-medium text-foreground outline-none transition-colors focus:border-foreground focus:bg-secondary/30",
              errors.subject && "border-destructive",
            )}
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? "subject-error" : undefined}
          >
            <option value="" disabled>
              Select a subject
            </option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          {errors.subject && (
            <p
              id="subject-error"
              className="mt-2 text-xs font-medium text-destructive"
            >
              {errors.subject}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="learningGoals"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42"
          >
            Learning goals (optional)
          </label>
          <textarea
            id="learningGoals"
            value={details.learningGoals}
            onChange={(e) => handleChange("learningGoals", e.target.value)}
            className="mt-2 w-full rounded-3xl border border-border bg-background px-5 py-4 text-base font-medium text-foreground outline-none placeholder:text-foreground/35 transition-colors focus:border-foreground focus:bg-secondary/30"
            placeholder="What does the student want to focus on? Any specific goals or topics?"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
