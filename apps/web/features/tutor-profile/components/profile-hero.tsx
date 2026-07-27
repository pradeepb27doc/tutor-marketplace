"use client";

import { memo } from "react";
import Link from "next/link";
import { ChevronLeft, Star, ShieldCheck, CheckCircle2, Award, MapPin, Video, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PublicTutorDetailDto } from "../types";
import { getInitials, formatFee, formatExperience, formatRating } from "../lib/format";

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground/64">{children}</span>;
}

function InfoItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-3xl border border-border bg-background p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-secondary text-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">{label}</p>
        <p className="mt-1 font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

interface ProfileHeroProps {
  tutor: PublicTutorDetailDto;
}

function ProfileHeroInner({ tutor }: ProfileHeroProps) {
  const subjectNames = tutor.subjects
    .filter((s) => s.isActive)
    .map((s) => s.subjectName);

  const location = [tutor.city, tutor.locality].filter(Boolean).join(" · ") || "Remote";

  const serviceModeLabel = (() => {
    const modes = new Set<string>();
    for (const subject of tutor.subjects) {
      for (const mode of subject.serviceModes) {
        if (mode === "ONLINE") modes.add("Online");
        else if (mode === "OFFLINE") modes.add("Offline");
        else if (mode === "HYBRID") modes.add("Hybrid");
      }
    }
    const labels = [...modes];
    return labels.length > 0 ? labels.join(" + ") : "Online + Offline";
  })();

  return (
    <section className="border-b border-border bg-secondary/30 px-5 py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/search"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-foreground/58 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" /> Back to search results
        </Link>

        <div className="grid gap-8 rounded-[2.5rem] border border-border bg-background p-5 shadow-[0_28px_90px_rgba(15,23,42,0.08)] lg:grid-cols-[1fr_22rem] lg:p-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="relative shrink-0">
              <div className="grid size-28 place-items-center rounded-[2rem] bg-foreground text-3xl font-semibold text-background sm:size-36">
                {getInitials(tutor.displayName ?? "Tutor")}
              </div>
              {tutor.isVerified && (
                <span className="absolute -bottom-2 -right-2 grid size-10 place-items-center rounded-full border-4 border-background bg-emerald-500 text-white">
                  <CheckCircle2 className="size-5" aria-hidden="true" />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {tutor.isVerified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground/68">
                    <ShieldCheck className="size-3.5" aria-hidden="true" /> Verified tutor
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground/68">
                  <Star className="size-3.5 fill-foreground text-foreground" aria-hidden="true" />{" "}
                  {formatRating(tutor.averageRating)} · {tutor.reviewCount} review{tutor.reviewCount !== 1 ? "s" : ""}
                </span>
              </div>

              <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                {tutor.displayName ?? "Tutor"}
              </h1>
              {tutor.headline && (
                <p className="mt-3 text-lg font-medium text-foreground/62">{tutor.headline}</p>
              )}
              {tutor.bio && (
                <p className="mt-5 max-w-3xl text-lg leading-8 text-foreground/58">{tutor.bio}</p>
              )}

              {subjectNames.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {subjectNames.map((name) => (
                    <Pill key={name}>{name}</Pill>
                  ))}
                </div>
              )}

              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoItem icon={Award} label="Experience" value={formatExperience(tutor.experienceYears)} />
                <InfoItem icon={MapPin} label="Location" value={location} />
                <InfoItem icon={Video} label="Mode" value={serviceModeLabel} />
                <InfoItem icon={WalletCards} label="Rate" value={formatFee(tutor.baseHourlyRate, tutor.currency)} />
              </div>
            </div>
          </div>

          <SidebarCard tutor={tutor} />
        </div>
      </div>
    </section>
  );
}

function SidebarCard({ tutor }: { tutor: PublicTutorDetailDto }) {
  return (
    <div className="rounded-[2rem] border border-border bg-secondary/35 p-5">
      <p className="text-sm font-semibold text-foreground/52">Premium profile</p>
      <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground">
        {formatFee(tutor.baseHourlyRate, tutor.currency)}
      </p>
      <div className="mt-6 grid gap-3">
        <Link
          href={`/booking?tutorId=${encodeURIComponent(tutor.id)}`}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-4 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          Book Trial Class
        </Link>
        <button className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-4 text-sm font-semibold transition-colors hover:bg-secondary">
          Save Tutor
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3 text-sm font-medium text-foreground/62">
          <ShieldCheck className="size-4 text-foreground" aria-hidden="true" />
          {tutor.isVerified ? "Identity & credentials verified" : "Verification in progress"}
        </div>
        <div className="flex items-center gap-3 text-sm font-medium text-foreground/62">
          <CheckCircle2 className="size-4 text-foreground" aria-hidden="true" />
          Secure booking
        </div>
      </div>
    </div>
  );
}

export const ProfileHero = memo(ProfileHeroInner);