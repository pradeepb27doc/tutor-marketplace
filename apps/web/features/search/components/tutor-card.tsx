import Link from "next/link";
import { memo } from "react";
import type { TutorCard as TutorCardType } from "../types";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Globe2,
  Heart,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatMode(mode: string | null): string {
  switch (mode) {
    case "ONLINE":
      return "Online";
    case "OFFLINE":
      return "Offline";
    case "HYBRID":
      return "Hybrid";
    default:
      return "Online + Offline";
  }
}

function formatFee(rate: string | null, currency: string): string {
  if (!rate) return "Contact for fee";
  const amount = Number.parseFloat(rate);
  if (Number.isNaN(amount)) return "Contact for fee";
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${Math.round(amount).toLocaleString()}/hr`;
}

function formatExperience(years: number): string {
  if (years === 0) return "Fresher";
  if (years === 1) return "1 year";
  return `${years} years`;
}

function getBadge(
  tutor: TutorCardType,
): { label: string; icon: typeof ShieldCheck } | null {
  if (tutor.isVerified) return { label: "Verified", icon: ShieldCheck };
  if (tutor.reviewCount > 200) return { label: "Top rated", icon: Star };
  if (tutor.completedClassesCount > 100)
    return { label: "Experienced", icon: Award };
  return null;
}

interface TutorCardProps {
  tutor: TutorCardType;
}

function TutorCardInner({ tutor }: TutorCardProps) {
  const badge = getBadge(tutor);
  const BadgeIcon = badge?.icon ?? ShieldCheck;

  return (
    <article className="group rounded-[2rem] border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(15,23,42,0.10)]">
      <div className="flex gap-4">
        <div className="relative shrink-0">
          <Link href={`/tutors/${tutor.id}`}>
            <div className="grid size-16 place-items-center rounded-3xl bg-foreground text-lg font-semibold text-background sm:size-20">
              {getInitials(tutor.displayName ?? "Tutor")}
            </div>
          </Link>
          {tutor.isVerified && (
            <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border-4 border-background bg-emerald-500 text-white">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/tutors/${tutor.id}`}>
                  <h3 className="text-2xl font-semibold tracking-[-0.04em] hover:underline">
                    {tutor.displayName ?? "Tutor"}
                  </h3>
                </Link>
                {badge && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground/68">
                    <BadgeIcon className="size-3.5" aria-hidden="true" />{" "}
                    {badge.label}
                  </span>
                )}
              </div>
              {tutor.headline && (
                <p className="mt-1 text-sm text-foreground/52">
                  {tutor.headline}
                </p>
              )}
              <p className="mt-2 flex items-center gap-2 text-sm text-foreground/52">
                <MapPin className="size-4" aria-hidden="true" />{" "}
                {tutor.city ?? "Remote"} · {formatMode(tutor.primaryMode)}
              </p>
            </div>
            <button
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
              aria-label={`Save ${tutor.displayName ?? "tutor"}`}
            >
              <Heart className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tutor.subjects.map((subject) => (
              <span
                key={subject.id}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground/64"
              >
                {subject.name}
              </span>
            ))}
          </div>

          <div className="mt-5 grid gap-3 text-sm text-foreground/58 sm:grid-cols-2">
            <span className="flex items-center gap-2">
              <Award className="size-4 text-foreground" aria-hidden="true" />{" "}
              {formatExperience(tutor.experienceYears)} experience
            </span>
            <span className="flex items-center gap-2">
              <Globe2 className="size-4 text-foreground" aria-hidden="true" />{" "}
              {tutor.primaryMode
                ? formatMode(tutor.primaryMode)
                : "Online + Offline"}
            </span>
            <span className="flex items-center gap-2">
              <Star
                className="size-4 fill-foreground text-foreground"
                aria-hidden="true"
              />{" "}
              {tutor.averageRating} · {tutor.reviewCount} reviews
            </span>
            <span className="flex items-center gap-2">
              <CalendarDays
                className="size-4 text-foreground"
                aria-hidden="true"
              />{" "}
              {tutor.completedClassesCount} classes completed
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                Hourly fee
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                {formatFee(
                  tutor.lowestHourlyRate ?? tutor.baseHourlyRate,
                  tutor.currency,
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/tutors/${tutor.id}`}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary sm:flex-none"
              >
                View Profile
              </Link>
              <Link
                href="/booking"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-transform duration-300 hover:-translate-y-0.5 sm:flex-none"
              >
                Book Trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export const TutorCard = memo(TutorCardInner);