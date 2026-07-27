const navigationItems = ["Find Tutors", "Subjects", "Become a Tutor", "About"];

const trustItems = ["Verified Tutors", "Thousands of Learning Hours"];

const statistics = [
  { value: "50,000+", label: "Students" },
  { value: "5,000+", label: "Verified Tutors" },
  { value: "100+", label: "Subjects" },
  { value: "4.9★", label: "Average Rating" }
];

const benefits = [
  {
    title: "Verified Tutors",
    description:
      "Every tutor is reviewed for identity, expertise, teaching history, and student feedback before joining the marketplace.",
    metric: "3-step review"
  },
  {
    title: "Flexible Learning",
    description:
      "Book online or nearby sessions that fit school calendars, exam seasons, after-work schedules, and weekend routines.",
    metric: "24/7 discovery"
  },
  {
    title: "Secure Payments",
    description:
      "Transparent pricing, protected bookings, and simple receipts keep families and tutors focused on learning.",
    metric: "Protected checkout"
  }
];

const subjects = [
  "Mathematics",
  "Science",
  "Coding",
  "Languages",
  "Music",
  "Arts",
  "Competitive Exams",
  "Business"
];

const steps = [
  {
    title: "Search",
    description: "Choose a subject, location, learning goal, and availability."
  },
  {
    title: "Compare",
    description: "Review credentials, ratings, pricing, and teaching style."
  },
  {
    title: "Book",
    description: "Reserve a session with secure payment and instant confirmation."
  },
  {
    title: "Learn",
    description: "Meet your tutor, track progress, and keep improving."
  }
];

const testimonials = [
  {
    quote:
      "We found a mathematics tutor who understood our daughter's confidence issues within the first session. The entire experience felt calm and premium.",
    name: "Anika Rao",
    role: "Parent of Grade 9 student"
  },
  {
    quote:
      "The comparison tools made it easy to choose a coding mentor with real project experience. My son now looks forward to every class.",
    name: "Rahul Mehta",
    role: "Parent of coding learner"
  },
  {
    quote:
      "I use the marketplace to fill my weekly teaching calendar without chasing payments or messages across different platforms.",
    name: "Maya Fernandes",
    role: "Verified language tutor"
  }
];

const faqs = [
  {
    question: "How are tutors verified?",
    answer:
      "Tutors complete identity checks, subject review, profile screening, and ongoing quality monitoring through student feedback."
  },
  {
    question: "Can I book both online and in-person lessons?",
    answer:
      "Yes. You can filter by online, nearby, or hybrid learning options depending on the tutor's availability."
  },
  {
    question: "Are payments protected?",
    answer:
      "Bookings are processed through a secure payment flow with clear pricing, confirmations, and receipts."
  },
  {
    question: "What subjects are available?",
    answer:
      "Families can discover tutors across school subjects, exams, coding, languages, music, arts, business, and more."
  }
];

const footerGroups = [
  { title: "Company", links: ["About", "Careers", "Tutors", "Contact"] },
  { title: "Resources", links: ["Find Tutors", "Subjects", "Learning Guides", "Help Center"] },
  { title: "Legal", links: ["Privacy", "Terms", "Payments", "Safety"] },
  { title: "Social", links: ["LinkedIn", "Instagram", "X", "YouTube"] }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-transparent bg-background/78 backdrop-blur-xl supports-[backdrop-filter]:bg-background/64">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8"
        >
          <a href="#top" className="group flex items-center gap-3" aria-label="Tutor Marketplace home">
            <span className="grid size-9 place-items-center rounded-full border border-foreground/12 bg-foreground text-background transition-transform duration-300 group-hover:scale-105">
              <span className="size-2.5 rounded-full bg-background" />
            </span>
            <span className="text-sm font-semibold tracking-tight sm:text-base">Tutor Marketplace</span>
          </a>

          <div className="hidden items-center gap-9 text-sm font-medium text-foreground/68 lg:flex">
            {navigationItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} className="transition-colors hover:text-foreground">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a href="/login" className="hidden text-sm font-medium text-foreground/70 transition-colors hover:text-foreground sm:inline-flex">
              Login
            </a>
            <a
              href="/signup"
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
            >
              Sign Up
            </a>
          </div>
        </nav>
      </header>

      <section id="top" className="relative -mt-20 overflow-hidden px-6 pb-24 pt-40 sm:pb-28 lg:px-8 lg:pt-44">
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-16 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="max-w-3xl">
            <p className="mb-8 inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/70">
              Trusted tutor discovery for every learning path
            </p>
            <h1 className="text-balance text-6xl font-semibold tracking-[-0.065em] text-foreground sm:text-7xl lg:text-[5.75rem] lg:leading-[0.92]">
              Find the Right Tutor. Unlock Every Student&apos;s Potential.
            </h1>
            <p className="mt-8 max-w-2xl text-pretty text-lg leading-8 text-foreground/64 sm:text-xl">
              Connect with verified tutors for school, competitive exams, coding, music, languages, and more—all in one trusted platform.
            </p>

            <form id="search" className="mt-11 rounded-[2rem] border border-border bg-background p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)]" aria-label="Find a tutor">
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-center">
                <label className="group rounded-3xl px-5 py-4 transition-colors hover:bg-secondary/70">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42">Subject</span>
                  <input
                    className="mt-1 w-full bg-transparent text-base font-medium text-foreground outline-none placeholder:text-foreground/35"
                    placeholder="Mathematics, coding, music"
                    aria-label="Subject"
                  />
                </label>
                <label className="rounded-3xl px-5 py-4 transition-colors hover:bg-secondary/70">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42">Location</span>
                  <input
                    className="mt-1 w-full bg-transparent text-base font-medium text-foreground outline-none placeholder:text-foreground/35"
                    placeholder="Online or your city"
                    aria-label="Location"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-medium text-foreground/62">
              <span aria-label="Five star rating" className="tracking-[0.12em] text-foreground">★★★★★</span>
              <span>Trusted by Families</span>
              {trustItems.map((item) => (
                <span key={item} className="before:mr-7 before:text-foreground/24 before:content-['•']">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none" aria-hidden="true">
            <div className="absolute left-4 top-10 h-40 w-40 rounded-full border border-border" />
            <div className="absolute bottom-10 right-0 h-52 w-52 rounded-full border border-border" />
            <div className="relative rounded-[2.5rem] border border-border bg-secondary/35 p-5 shadow-[0_28px_90px_rgba(15,23,42,0.08)]">
              <div className="rounded-[2rem] border border-border bg-background p-6">
                <div className="flex items-center justify-between border-b border-border pb-5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Tutor Match</p>
                    <p className="mt-1 text-xs text-foreground/48">Personalized shortlist</p>
                  </div>
                  <div className="rounded-full border border-border px-3 py-1 text-xs font-semibold">Live</div>
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    ["Advanced Mathematics", "98% match", "₹900/hr"],
                    ["Python for Beginners", "94% match", "₹750/hr"],
                    ["Spoken French", "91% match", "₹650/hr"]
                  ].map(([title, match, price]) => (
                    <div key={title} className="flex items-center justify-between rounded-3xl border border-border p-4">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-foreground/8" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{title}</p>
                          <p className="mt-1 text-xs text-foreground/48">{match}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-foreground/72">{price}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -left-8 top-24 hidden rounded-3xl border border-border bg-background p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">Rating</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">4.9</p>
              </div>
              <div className="absolute -bottom-8 right-10 hidden rounded-3xl border border-border bg-background p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:block">
                <p className="text-sm font-semibold">Next lesson</p>
                <p className="mt-1 text-xs text-foreground/48">Today · 6:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border px-6 py-10 lg:px-8" aria-label="Featured statistics">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statistics.map((stat) => (
            <div key={stat.label} className="py-5">
              <p className="text-4xl font-semibold tracking-[-0.04em] text-foreground">{stat.value}</p>
              <p className="mt-2 text-sm font-medium text-foreground/52">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="find-tutors" className="px-6 py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/44">Why choose us</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Designed for trust from the first search.</h2>
          </div>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="group rounded-[2rem] border border-border bg-background p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <p className="text-sm font-semibold text-foreground/46">{benefit.metric}</p>
                <h3 className="mt-8 text-2xl font-semibold tracking-[-0.035em]">{benefit.title}</h3>
                <p className="mt-4 leading-7 text-foreground/58">{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="subjects" className="bg-secondary/45 px-6 py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/44">Popular subjects</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">A focused catalog for every ambition.</h2>
            </div>
            <p className="max-w-sm text-foreground/58">From foundational school support to advanced skills, discover verified experts across the subjects families ask for most.</p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((subject, index) => (
              <a key={subject} href="#search" className="group rounded-[1.75rem] border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
                <span className="text-xs font-semibold text-foreground/36">0{index + 1}</span>
                <p className="mt-8 text-xl font-semibold tracking-[-0.03em]">{subject}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="become-a-tutor" className="px-6 py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/44">How it works</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">A simple path from search to progress.</h2>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-4 lg:gap-0">
            {steps.map((step, index) => (
              <article key={step.title} className="relative border-border lg:border-t lg:px-8 lg:pt-10 first:lg:pl-0 last:lg:pr-0">
                <div className="mb-6 grid size-11 place-items-center rounded-full border border-border bg-background text-sm font-semibold lg:absolute lg:-top-5">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-semibold tracking-[-0.035em]">{step.title}</h3>
                <p className="mt-4 leading-7 text-foreground/58">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="border-y border-border px-6 py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/44">Testimonials</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Quiet confidence from families and tutors.</h2>
          </div>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.name} className="rounded-[2rem] border border-border p-8">
                <blockquote className="leading-8 text-foreground/68">“{testimonial.quote}”</blockquote>
                <figcaption className="mt-10">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="mt-1 text-sm text-foreground/48">{testimonial.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-28 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/44">FAQ</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Everything essential, answered.</h2>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-7">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold tracking-[-0.025em] focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground">
                  {faq.question}
                  <span className="text-2xl font-light transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pb-1 pt-5 leading-7 text-foreground/58">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_1.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-foreground text-background">
                <span className="size-2.5 rounded-full bg-background" />
              </span>
              <span className="font-semibold tracking-tight">Tutor Marketplace</span>
            </div>
            <p className="mt-5 max-w-sm leading-7 text-foreground/52">A trusted place to find verified tutors and build better learning outcomes.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold">{group.title}</h3>
                <ul className="mt-4 space-y-3 text-sm text-foreground/54">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a href="#top" className="transition-colors hover:text-foreground">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}