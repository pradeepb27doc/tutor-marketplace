import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  Globe2,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  UsersRound,
  Video
} from "lucide-react";
import Link from "next/link";

const filters = [
  {
    title: "Subject",
    options: ["Mathematics", "Physics", "Chemistry", "Coding", "English"]
  },
  {
    title: "Board",
    options: ["CBSE", "ICSE", "IB", "IGCSE", "State Board"]
  },
  {
    title: "Experience",
    options: ["2+ years", "5+ years", "8+ years", "10+ years"]
  },
  {
    title: "Price Range",
    options: ["Under ₹500", "₹500 - ₹800", "₹800 - ₹1,200", "₹1,200+"]
  },
  {
    title: "Rating",
    options: ["4.9+", "4.8+", "4.5+", "4.0+"]
  },
  {
    title: "Mode",
    options: ["One-on-one", "Group class", "Exam intensive", "Doubt solving"]
  },
  {
    title: "Language",
    options: ["English", "Hindi", "Tamil", "Bengali", "Marathi"]
  },
  {
    title: "Availability",
    options: ["Today", "This week", "Weekends", "Evenings"]
  },
  {
    title: "Online / Offline",
    options: ["Online", "Offline nearby", "Hybrid"]
  }
];

const tutorResults = [
  {
    name: "Dr. Aanya Sharma",
    initials: "AS",
    badge: "Top verified",
    subjects: ["Mathematics", "Physics", "JEE Foundation"],
    experience: "11 years",
    languages: ["English", "Hindi"],
    rating: "4.98",
    reviews: 284,
    fee: "₹1,250/hr",
    availability: "Today · 6:30 PM",
    mode: "Online + Offline",
    location: "South Delhi",
    highlight: "Builds strong conceptual clarity for competitive exam learners."
  },
  {
    name: "Rohan Mehta",
    initials: "RM",
    badge: "Verified mentor",
    subjects: ["Coding", "Python", "Computer Science"],
    experience: "7 years",
    languages: ["English", "Gujarati"],
    rating: "4.94",
    reviews: 196,
    fee: "₹900/hr",
    availability: "Tomorrow · 5:00 PM",
    mode: "Online",
    location: "Remote",
    highlight: "Project-led programming lessons for beginners and school students."
  },
  {
    name: "Meera Iyer",
    initials: "MI",
    badge: "Parent favorite",
    subjects: ["Chemistry", "Biology", "CBSE Science"],
    experience: "9 years",
    languages: ["English", "Tamil", "Hindi"],
    rating: "4.91",
    reviews: 231,
    fee: "₹1,050/hr",
    availability: "Sat · 10:00 AM",
    mode: "Hybrid",
    location: "Bengaluru",
    highlight: "Calm, structured coaching with weekly progress notes."
  },
  {
    name: "Kabir Khan",
    initials: "KK",
    badge: "Exam expert",
    subjects: ["English", "IELTS", "Public Speaking"],
    experience: "12 years",
    languages: ["English", "Hindi", "Urdu"],
    rating: "4.89",
    reviews: 318,
    fee: "₹1,400/hr",
    availability: "Today · 8:00 PM",
    mode: "Online",
    location: "Mumbai",
    highlight: "Premium communication coaching for school and test prep goals."
  },
  {
    name: "Nisha Banerjee",
    initials: "NB",
    badge: "Verified tutor",
    subjects: ["Economics", "Business Studies", "IB"],
    experience: "6 years",
    languages: ["English", "Bengali"],
    rating: "4.86",
    reviews: 142,
    fee: "₹850/hr",
    availability: "Wed · 7:30 PM",
    mode: "Online + Offline",
    location: "Kolkata",
    highlight: "Case-study driven lessons for senior secondary commerce students."
  },
  {
    name: "Arjun Nair",
    initials: "AN",
    badge: "Rising star",
    subjects: ["Music Theory", "Guitar", "Keyboard"],
    experience: "5 years",
    languages: ["English", "Malayalam"],
    rating: "4.84",
    reviews: 97,
    fee: "₹700/hr",
    availability: "Sun · 11:00 AM",
    mode: "Hybrid",
    location: "Kochi",
    highlight: "Warm, creative classes for children and beginner adult learners."
  }
];

function FilterPanel({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  return (
    <aside
      className={
        variant === "desktop"
          ? "hidden lg:block"
          : "rounded-[2rem] border border-border bg-background p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
      }
      aria-label="Tutor filters"
    >
      <div className={variant === "desktop" ? "sticky top-28 rounded-[2rem] border border-border bg-background p-5" : ""}>
        <div className="flex items-center justify-between border-b border-border pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">Filters</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.035em]">Refine tutors</h2>
          </div>
          <SlidersHorizontal className="size-5 text-foreground/50" aria-hidden="true" />
        </div>

        <div className="mt-5 space-y-5">
          {filters.map((filter) => (
            <details key={filter.title} className="group rounded-3xl border border-border bg-secondary/25 p-4" open={variant === "desktop"}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground">
                {filter.title}
                <ChevronDown className="size-4 text-foreground/42 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="mt-4 space-y-3">
                {filter.options.map((option) => (
                  <label key={option} className="flex cursor-pointer items-center gap-3 text-sm text-foreground/62 transition-colors hover:text-foreground">
                    <input type="checkbox" className="size-4 rounded border-border accent-foreground" />
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

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8" aria-label="Main navigation">
          <Link href="/" className="group flex items-center gap-3" aria-label="Tutor Marketplace home">
            <span className="grid size-9 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:scale-105">
              <span className="size-2.5 rounded-full bg-background" />
            </span>
            <span className="text-sm font-semibold tracking-tight sm:text-base">Tutor Marketplace</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-foreground/62 md:flex">
            <Link href="/search" className="text-foreground">Search</Link>
            <Link href="/#subjects" className="transition-colors hover:text-foreground">Subjects</Link>
            <Link href="/#become-a-tutor" className="transition-colors hover:text-foreground">Become a Tutor</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" className="hidden rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary sm:inline-flex">
              Home
            </Link>
            <Link href="#results" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-transform duration-300 hover:-translate-y-0.5">
              View Tutors
            </Link>
          </div>
        </nav>
      </header>

      <section className="border-b border-border px-5 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground/60">
                <Sparkles className="size-4" aria-hidden="true" /> Premium tutor discovery
              </p>
              <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl">Find tutors who fit your learning rhythm.</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground/58">Compare verified educators by subject, board, price, rating, availability, and learning mode—using placeholder results for this UI sprint.</p>
            </div>
            <div className="grid gap-3 rounded-[2rem] border border-border bg-secondary/35 p-4 sm:grid-cols-3 lg:min-w-[28rem]">
              {[
                ["4.9★", "Avg rating"],
                ["6", "Curated tutors"],
                ["Today", "Earliest slot"]
              ].map(([value, label]) => (
                <div key={label} className="rounded-3xl bg-background p-4">
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-foreground">{value}</p>
                  <p className="mt-1 text-xs font-medium text-foreground/46">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <form className="mt-8 rounded-[2rem] border border-border bg-background p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)]" aria-label="Search tutors">
            <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr_0.9fr_auto] lg:items-center">
              <label className="rounded-3xl px-5 py-4 transition-colors hover:bg-secondary/65">
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42">Subject</span>
                <input className="mt-1 w-full bg-transparent text-base font-medium outline-none placeholder:text-foreground/35" placeholder="Mathematics, coding, English" aria-label="Subject" />
              </label>
              <label className="rounded-3xl px-5 py-4 transition-colors hover:bg-secondary/65">
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42">Board</span>
                <input className="mt-1 w-full bg-transparent text-base font-medium outline-none placeholder:text-foreground/35" placeholder="CBSE, IB, ICSE" aria-label="Board" />
              </label>
              <label className="rounded-3xl px-5 py-4 transition-colors hover:bg-secondary/65">
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42">Location / Mode</span>
                <input className="mt-1 w-full bg-transparent text-base font-medium outline-none placeholder:text-foreground/35" placeholder="Online or your city" aria-label="Location or mode" />
              </label>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                <Search className="size-4" aria-hidden="true" /> Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <section id="results" className="px-5 py-8 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[19rem_1fr]">
          <FilterPanel />

          <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/42">Search results</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">6 premium tutors available</h2>
              </div>

              <details className="group relative lg:hidden">
                <summary className="inline-flex cursor-pointer list-none items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold shadow-[0_12px_40px_rgba(15,23,42,0.07)]">
                  <Filter className="size-4" aria-hidden="true" /> Filters
                </summary>
                <div className="absolute right-0 z-30 mt-3 w-[min(92vw,24rem)]">
                  <FilterPanel variant="mobile" />
                </div>
              </details>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              {tutorResults.map((tutor) => (
                <article key={tutor.name} className="group rounded-[2rem] border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(15,23,42,0.10)]">
                  <div className="flex gap-4">
                    <div className="relative shrink-0">
                      <div className="grid size-16 place-items-center rounded-3xl bg-foreground text-lg font-semibold text-background sm:size-20">
                        {tutor.initials}
                      </div>
                      <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border-4 border-background bg-emerald-500 text-white">
                        <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-2xl font-semibold tracking-[-0.04em]">{tutor.name}</h3>
                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground/68">
                              <ShieldCheck className="size-3.5" aria-hidden="true" /> {tutor.badge}
                            </span>
                          </div>
                          <p className="mt-2 flex items-center gap-2 text-sm text-foreground/52">
                            <MapPin className="size-4" aria-hidden="true" /> {tutor.location} · {tutor.mode}
                          </p>
                        </div>
                        <button className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary" aria-label={`Save ${tutor.name}`}>
                          <Heart className="size-5" aria-hidden="true" />
                        </button>
                      </div>

                      <p className="mt-4 leading-7 text-foreground/60">{tutor.highlight}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {tutor.subjects.map((subject) => (
                          <span key={subject} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground/64">
                            {subject}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 grid gap-3 text-sm text-foreground/58 sm:grid-cols-2">
                        <span className="flex items-center gap-2"><Award className="size-4 text-foreground" aria-hidden="true" /> {tutor.experience} experience</span>
                        <span className="flex items-center gap-2"><Globe2 className="size-4 text-foreground" aria-hidden="true" /> {tutor.languages.join(", ")}</span>
                        <span className="flex items-center gap-2"><Star className="size-4 fill-foreground text-foreground" aria-hidden="true" /> {tutor.rating} · {tutor.reviews} reviews</span>
                        <span className="flex items-center gap-2"><CalendarDays className="size-4 text-foreground" aria-hidden="true" /> {tutor.availability}</span>
                      </div>

                      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">Hourly fee</p>
                          <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-foreground">{tutor.fee}</p>
                        </div>
                        <div className="flex gap-3">
                          <Link href="#" className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary sm:flex-none">
                            View Profile
                          </Link>
                          <Link href="#" className="inline-flex flex-1 items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-transform duration-300 hover:-translate-y-0.5 sm:flex-none">
                            Book Trial
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 rounded-[2rem] border border-border bg-secondary/35 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Video, "Online lessons", "Live, flexible sessions"],
            [UsersRound, "Offline options", "Nearby tutor discovery"],
            [Clock3, "Fast availability", "Slots from today"],
            [BookOpen, "Board aligned", "CBSE, ICSE, IB and more"]
          ].map(([Icon, title, description]) => (
            <div key={title as string} className="rounded-3xl bg-background p-5">
              <Icon className="size-5 text-foreground" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em]">{title as string}</h3>
              <p className="mt-2 text-sm text-foreground/52">{description as string}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}