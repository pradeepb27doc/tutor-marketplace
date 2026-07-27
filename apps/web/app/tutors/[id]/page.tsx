 "use client";

import { useParams } from "next/navigation";
import { MonitorPlay, UsersRound, MessageCircle, ShieldCheck } from "lucide-react";
import { useTutorProfile } from "../../../features/tutor-profile/hooks/use-tutor-profile";
import { ProfileSkeleton } from "../../../features/tutor-profile/components/profile-skeleton";
import { ProfileError } from "../../../features/tutor-profile/components/profile-error";
import { ProfileNotFound } from "../../../features/tutor-profile/components/profile-not-found";
import { ProfileNavbar } from "../../../features/tutor-profile/components/profile-navbar";
import { ProfileHero } from "../../../features/tutor-profile/components/profile-hero";
import { SubjectsSection } from "../../../features/tutor-profile/components/subjects-section";
import { QualificationsSection } from "../../../features/tutor-profile/components/qualifications-section";
import { LanguagesSection } from "../../../features/tutor-profile/components/languages-section";
import { ServiceAreasSection } from "../../../features/tutor-profile/components/service-areas-section";

export default function TutorProfilePage() {
  const params = useParams<{ id: string }>();
  const tutorId = params?.id ?? "";
  const { state, retry } = useTutorProfile(tutorId);

  if (state.status === "loading") {
    return <ProfileSkeleton />;
  }

  if (state.status === "error") {
    if (state.isNotFound) {
      return <ProfileNotFound />;
    }
    return <ProfileError message={state.message} onRetry={retry} />;
  }

  const tutor = state.tutor;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ProfileNavbar />
      <ProfileHero tutor={tutor} />

      <section className="px-5 py-10 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_23rem]">
          <div className="space-y-6">
            {tutor.bio && (
              <section className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">
                  About
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">
                  About {tutor.displayName ?? "the tutor"}
                </h2>
                <p className="mt-6 text-lg leading-8 text-foreground/60">
                  {tutor.bio}
                </p>
              </section>
            )}

            <SubjectsSection subjects={tutor.subjects} />
            <QualificationsSection qualifications={tutor.qualifications} />
            <LanguagesSection languages={tutor.languages} />
            <ServiceAreasSection serviceAreas={tutor.serviceAreas} />
          </div>

          {/* Right sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_28px_90px_rgba(15,23,42,0.10)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">
                Overview
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/40">
                    Experience
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {tutor.experienceYears > 0
                      ? `${tutor.experienceYears} year${tutor.experienceYears !== 1 ? "s" : ""}`
                      : "Fresher"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/40">
                    Rating
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {Number.parseFloat(tutor.averageRating).toFixed(1)} ·{" "}
                    {tutor.reviewCount} review{tutor.reviewCount !== 1 ? "s" : ""}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/40">
                    Completed classes
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {tutor.completedClassesCount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/40">
                    Verification
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {tutor.isVerified ? "Verified" : "Unverified"}
                  </p>
                  {tutor.verification.checkedTypes.length > 0 && (
                    <p className="mt-1 text-xs text-foreground/44">
                      {tutor.verification.checkedTypes.length} check
                      {tutor.verification.checkedTypes.length !== 1 ? "s" : ""}{" "}
                      completed
                    </p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="px-5 pb-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 rounded-[2rem] border border-border bg-secondary/35 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              [MonitorPlay, "Online-ready", "Virtual classroom ready"],
              [UsersRound, "Family trusted", "Professional educator"],
              [MessageCircle, "Rating", `${tutor.averageRating} · ${tutor.reviewCount} reviews`],
              [ShieldCheck, "Verified profile", tutor.isVerified ? "Identity & credentials verified" : "Verification in progress"],
            ] as const
          ).map(([Icon, title, description]) => (
            <div key={title} className="rounded-3xl bg-background p-5">
              <Icon className="size-5 text-foreground" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em]">{title}</h3>
              <p className="mt-2 text-sm text-foreground/52">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}