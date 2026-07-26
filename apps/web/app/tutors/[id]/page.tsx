import type { LucideIcon } from "lucide-react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  GraduationCap,
  Heart,
  Languages,
  MapPin,
  MessageCircle,
  MonitorPlay,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  Video,
  WalletCards
} from "lucide-react";
import Link from "next/link";

const tutor = {
  name: "Dr. Aanya Sharma",
  initials: "AS",
  title: "Senior Mathematics & Physics Tutor",
  badge: "Top verified tutor",
  rating: "4.98",
  reviewCount: 284,
  subjects: ["Mathematics", "Physics", "JEE Foundation", "CBSE Grade 8-12"],
  experience: "11 years",
  location: "South Delhi · Online worldwide",
  teachingMode: "Online + Offline",
  hourlyRate: "₹1,250/hr",
  trialRate: "₹499 trial class",
  availability: "Earliest slot today at 6:30 PM",
  responseTime: "Usually responds in 20 minutes",
  shortBio:
    "A calm, structured educator helping middle and senior school learners build deep conceptual clarity, exam confidence, and consistent study habits."
};

const heroStats = [
  { label: "Learning hours", value: "9,800+" },
  { label: "Repeat families", value: "92%" },
  { label: "Board coverage", value: "CBSE · ICSE · IB" }
];

const qualifications = [
  "PhD in Applied Mathematics, University of Delhi",
  "MSc Physics with distinction",
  "Certified online teaching specialist",
  "Former senior faculty for JEE foundation programs"
];

const subjectBoards = [
  { subject: "Mathematics", boards: "CBSE, ICSE, IB, IGCSE", levels: "Grades 8-12" },
  { subject: "Physics", boards: "CBSE, ICSE, State Board", levels: "Grades 9-12" },
  { subject: "JEE Foundation", boards: "Olympiad + entrance prep", levels: "Grades 8-10" }
];

const experience = [
  { role: "Independent Premium Tutor", detail: "Designed personalized learning plans for 450+ students across school and exam goals.", years: "2018 - Present" },
  { role: "Senior STEM Faculty", detail: "Led foundation batches with weekly assessments, parent updates, and concept labs.", years: "2013 - 2018" },
  { role: "University Teaching Assistant", detail: "Supported undergraduate mathematics tutorials and peer mentoring programs.", years: "2011 - 2013" }
];

const languages = ["English", "Hindi", "Conversational Punjabi"];

const teachingStyle = [
  { title: "Diagnostic first class", description: "Begins with a friendly concept audit to identify gaps, learning style, and exam priorities." },
  { title: "Visual concept building", description: "Uses diagrams, real-life models, and short problem sets before moving to advanced practice." },
  { title: "Weekly progress notes", description: "Shares clear next steps with families after milestone lessons and test reviews." }
];

const availability = [
  { day: "Mon", slots: ["7:00 PM", "8:30 PM"] },
  { day: "Tue", slots: ["6:30 PM"] },
  { day: "Wed", slots: ["5:00 PM", "7:30 PM"] },
  { day: "Thu", slots: ["Booked"] },
  { day: "Fri", slots: ["6:00 PM", "8:00 PM"] },
  { day: "Sat", slots: ["10:00 AM", "12:30 PM"] },
  { day: "Sun", slots: ["11:00 AM"] }
];

const reviews = [
  {
    name: "Anika Rao",
    role: "Parent of Grade 9 student",
    rating: "5.0",
    quote:
      "Dr. Aanya made mathematics feel approachable again. The lessons are organized, warm, and focused on real understanding."
  },
  {
    name: "Vihaan Mehta",
    role: "JEE foundation learner",
    rating: "5.0",
    quote:
      "Her shortcuts never skip the basics. I finally understand why formulas work and my test scores are more consistent."
  },
  {
    name: "Neha Kapoor",
    role: "Parent of CBSE student",
    rating: "4.9",
    quote:
      "The weekly updates are excellent. We always know what was covered, what needs practice, and what comes next."
  }
];

const similarTutors = [
  { name: "Meera Iyer", initials: "MI", focus: "Chemistry · Biology", rating: "4.91", price: "₹1,050/hr" },
  { name: "Rohan Mehta", initials: "RM", focus: "Coding · Python", rating: "4.94", price: "₹900/hr" },
  { name: "Kabir Khan", initials: "KK", focus: "English · IELTS", rating: "4.89", price: "₹1,400/hr" }
];

const trustBadges = ["Identity verified", "Credentials reviewed", "Secure booking", "Parent recommended"];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="group flex items-center gap-3" aria-label="Tutor Marketplace home">
          <span className="grid size-9 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:scale-105">
            <span className="size-2.5 rounded-full bg-background" />
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">Tutor Marketplace</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-foreground/62 md:flex">
          <Link href="/search" className="transition-colors hover:text-foreground">Search</Link>
          <Link href="/#subjects" className="transition-colors hover:text-foreground">Subjects</Link>
          <Link href="/#become-a-tutor" className="transition-colors hover:text-foreground">Become a Tutor</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/search" className="hidden rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary sm:inline-flex">
            Back to Search
          </Link>
          <Link href="#booking" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-transform duration-300 hover:-translate-y-0.5">
            Book Trial
          </Link>
        </div>
      </nav>
    </header>
  );
}

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

function SectionCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function TutorHero() {
  return (
    <section className="border-b border-border bg-secondary/30 px-5 py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <Link href="/search" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-foreground/58 transition-colors hover:text-foreground">
          <ChevronLeft className="size-4" aria-hidden="true" /> Back to search results
        </Link>

        <div className="grid gap-8 rounded-[2.5rem] border border-border bg-background p-5 shadow-[0_28px_90px_rgba(15,23,42,0.08)] lg:grid-cols-[1fr_22rem] lg:p-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="relative shrink-0">
              <div className="grid size-28 place-items-center rounded-[2rem] bg-foreground text-3xl font-semibold text-background sm:size-36">
                {tutor.initials}
              </div>
              <span className="absolute -bottom-2 -right-2 grid size-10 place-items-center rounded-full border-4 border-background bg-emerald-500 text-white">
                <CheckCircle2 className="size-5" aria-hidden="true" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground/68">
                  <ShieldCheck className="size-3.5" aria-hidden="true" /> {tutor.badge}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground/68">
                  <Star className="size-3.5 fill-foreground text-foreground" aria-hidden="true" /> {tutor.rating} · {tutor.reviewCount} reviews
                </span>
              </div>

              <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl">{tutor.name}</h1>
              <p className="mt-3 text-lg font-medium text-foreground/62">{tutor.title}</p>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-foreground/58">{tutor.shortBio}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {tutor.subjects.map((subject) => <Pill key={subject}>{subject}</Pill>)}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoItem icon={Award} label="Experience" value={tutor.experience} />
                <InfoItem icon={MapPin} label="Location" value={tutor.location} />
                <InfoItem icon={Video} label="Mode" value={tutor.teachingMode} />
                <InfoItem icon={WalletCards} label="Rate" value={tutor.hourlyRate} />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-secondary/35 p-5">
            <p className="text-sm font-semibold text-foreground/52">Premium profile</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground">{tutor.hourlyRate}</p>
            <p className="mt-2 text-sm text-foreground/52">{tutor.trialRate}</p>
            <div className="mt-6 grid gap-3">
              <Link href="#booking" className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-4 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                <CalendarDays className="size-4" aria-hidden="true" /> Book Trial Class
              </Link>
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-4 text-sm font-semibold transition-colors hover:bg-secondary">
                <Heart className="size-4" aria-hidden="true" /> Save Tutor
              </button>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-background p-3">
                  <p className="text-lg font-semibold tracking-[-0.04em] text-foreground">{stat.value}</p>
                  <p className="mt-1 text-[0.7rem] font-medium text-foreground/44">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BookingSidebar() {
  return (
    <aside id="booking" className="lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_28px_90px_rgba(15,23,42,0.10)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">Booking</p>
        <div className="mt-4 flex items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-4xl font-semibold tracking-[-0.055em] text-foreground">{tutor.hourlyRate}</p>
            <p className="mt-1 text-sm text-foreground/50">Transparent placeholder pricing</p>
          </div>
          <Sparkles className="size-6 text-foreground" aria-hidden="true" />
        </div>

        <div className="mt-5 grid gap-3">
          <button className="rounded-full bg-foreground px-6 py-4 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">Trial class · ₹499</button>
          <button className="rounded-full border border-border px-6 py-4 text-sm font-semibold transition-colors hover:bg-secondary">Book now</button>
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-secondary/35 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><Clock3 className="size-4" aria-hidden="true" /> Availability summary</p>
          <p className="mt-2 text-sm leading-6 text-foreground/56">{tutor.availability}. Weekday evenings and weekend mornings are open this week.</p>
          <p className="mt-3 text-xs font-semibold text-foreground/46">{tutor.responseTime}</p>
        </div>

        <div className="mt-6 space-y-3">
          {trustBadges.map((badge) => (
            <div key={badge} className="flex items-center gap-3 text-sm font-medium text-foreground/62">
              <BadgeCheck className="size-4 text-foreground" aria-hidden="true" /> {badge}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function TutorProfilePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <TutorHero />

      <section className="px-5 py-10 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_23rem]">
          <div className="space-y-6">
            <SectionCard eyebrow="About" title="A focused tutor for confident STEM learning.">
              <p className="text-lg leading-8 text-foreground/60">
                Dr. Aanya combines academic depth with patient, high-touch mentoring. Her lessons are structured around concept mastery, guided practice, and reflective revision so students can connect classroom work with competitive exam expectations.
              </p>
            </SectionCard>

            <SectionCard eyebrow="Qualifications" title="Reviewed credentials and specialist training.">
              <div className="grid gap-3 sm:grid-cols-2">
                {qualifications.map((item) => (
                  <div key={item} className="flex gap-3 rounded-3xl border border-border bg-secondary/25 p-4 text-sm font-medium text-foreground/64">
                    <GraduationCap className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden="true" /> {item}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard eyebrow="Subjects & Boards" title="Board-aligned support across priority subjects.">
              <div className="grid gap-4">
                {subjectBoards.map((item) => (
                  <article key={item.subject} className="rounded-3xl border border-border p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-xl font-semibold tracking-[-0.035em]">{item.subject}</h3>
                      <Pill>{item.levels}</Pill>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-foreground/56">{item.boards}</p>
                  </article>
                ))}
              </div>
            </SectionCard>

            <SectionCard eyebrow="Experience" title="A decade of teaching and mentoring outcomes.">
              <div className="space-y-4">
                {experience.map((item) => (
                  <article key={item.role} className="grid gap-4 rounded-3xl border border-border p-5 sm:grid-cols-[9rem_1fr]">
                    <p className="text-sm font-semibold text-foreground/44">{item.years}</p>
                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.035em]">{item.role}</h3>
                      <p className="mt-2 leading-7 text-foreground/58">{item.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </SectionCard>

            <SectionCard eyebrow="Languages" title="Comfortable learning in multiple languages.">
              <div className="flex flex-wrap gap-3">
                {languages.map((language) => (
                  <span key={language} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground/64">
                    <Languages className="size-4 text-foreground" aria-hidden="true" /> {language}
                  </span>
                ))}
              </div>
            </SectionCard>

            <SectionCard eyebrow="Teaching Style" title="Premium structure without pressure.">
              <div className="grid gap-4 md:grid-cols-3">
                {teachingStyle.map((item) => (
                  <article key={item.title} className="rounded-3xl border border-border bg-secondary/25 p-5">
                    <BookOpen className="size-5 text-foreground" aria-hidden="true" />
                    <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-foreground/56">{item.description}</p>
                  </article>
                ))}
              </div>
            </SectionCard>

            <SectionCard eyebrow="Availability Calendar" title="Open slots this week (UI only).">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
                {availability.map((day) => (
                  <div key={day.day} className="rounded-3xl border border-border bg-secondary/25 p-4">
                    <p className="font-semibold text-foreground">{day.day}</p>
                    <div className="mt-4 space-y-2">
                      {day.slots.map((slot) => (
                        <span key={slot} className="block rounded-full bg-background px-3 py-2 text-center text-xs font-semibold text-foreground/62">
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard eyebrow="Student Reviews" title="Trusted by families and exam learners.">
              <div className="grid gap-4 lg:grid-cols-3">
                {reviews.map((review) => (
                  <figure key={review.name} className="rounded-3xl border border-border p-5">
                    <div className="flex items-center justify-between gap-4">
                      <Quote className="size-5 text-foreground/42" aria-hidden="true" />
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground"><Star className="size-4 fill-foreground" aria-hidden="true" /> {review.rating}</span>
                    </div>
                    <blockquote className="mt-5 leading-7 text-foreground/62">“{review.quote}”</blockquote>
                    <figcaption className="mt-6">
                      <p className="font-semibold text-foreground">{review.name}</p>
                      <p className="mt-1 text-sm text-foreground/46">{review.role}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </SectionCard>

            <SectionCard eyebrow="Similar Tutors" title="Other premium educators you may like.">
              <div className="grid gap-4 md:grid-cols-3">
                {similarTutors.map((similarTutor) => (
                  <article key={similarTutor.name} className="rounded-3xl border border-border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
                    <div className="flex items-center gap-4">
                      <div className="grid size-14 place-items-center rounded-2xl bg-foreground font-semibold text-background">{similarTutor.initials}</div>
                      <div>
                        <h3 className="text-lg font-semibold tracking-[-0.03em]">{similarTutor.name}</h3>
                        <p className="mt-1 text-sm text-foreground/50">{similarTutor.focus}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm font-semibold text-foreground/62">
                      <span className="inline-flex items-center gap-1"><Star className="size-4 fill-foreground text-foreground" aria-hidden="true" /> {similarTutor.rating}</span>
                      <span>{similarTutor.price}</span>
                    </div>
                  </article>
                ))}
              </div>
            </SectionCard>
          </div>

          <BookingSidebar />
        </div>
      </section>

      <section className="px-5 pb-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 rounded-[2rem] border border-border bg-secondary/35 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [MonitorPlay, "Online-ready", "Clean virtual classroom workflow"],
            [UsersRound, "Family trusted", "Consistent progress communication"],
            [MessageCircle, "Fast replies", tutor.responseTime],
            [ShieldCheck, "Verified profile", "Placeholder trust and safety UI"]
          ].map(([Icon, title, description]) => {
            const CardIcon = Icon as LucideIcon;
            return (
              <div key={title as string} className="rounded-3xl bg-background p-5">
                <CardIcon className="size-5 text-foreground" aria-hidden="true" />
                <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em]">{title as string}</h3>
                <p className="mt-2 text-sm text-foreground/52">{description as string}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}