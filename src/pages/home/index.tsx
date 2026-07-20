import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Code2,
  GraduationCap,
  MapPin,
  Network,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const events = [
  {
    type: "Technology",
    title: "Workshops that turn curiosity into practical skills.",
    description: "Learn alongside peers through sessions built around the tools shaping our field.",
    icon: Code2,
  },
  {
    type: "Community",
    title: "A place to meet people beyond the classroom.",
    description: "Find collaborators, mentors, and friends across BINUS computing communities.",
    icon: Users,
  },
  {
    type: "Growth",
    title: "Experiences that prepare you for what comes next.",
    description: "Explore careers, leadership, and new perspectives through member-focused programs.",
    icon: GraduationCap,
  },
];

function Brand() {
  return (
    <a href="#top" className="flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
      <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-brand-navy p-1.5 shadow-sm">
        <img src="/himti-icon.svg" alt="" className="size-full object-contain" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-tight text-brand-ink">HIMTI</span>
        <span className="block text-[11px] font-medium text-brand-slate">BINUS University</span>
      </span>
    </a>
  );
}

export default function HomePage() {
  return (
    <div id="top" className="min-h-screen overflow-hidden bg-background text-brand-ink">
      <header className="fixed inset-x-0 top-4 z-50 px-4 sm:top-6">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-3 py-3 shadow-[0_16px_50px_-24px_rgba(0,33,79,0.32)] backdrop-blur-xl sm:px-5"
        >
          <Brand />
          <div className="hidden items-center gap-8 md:flex">
            <a className="nav-link" href="#about">About</a>
            <a className="nav-link" href="#events">Events</a>
            <a className="nav-link" href="#join">Membership</a>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="hidden border-brand-blue/25 px-4 text-brand-blue hover:bg-brand-pale sm:inline-flex">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="px-4 shadow-[0_10px_24px_-12px_rgba(0,91,204,0.85)] sm:px-5">
              <Link to="/register">Register <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative isolate flex min-h-[760px] items-center overflow-hidden px-6 pb-24 pt-40 sm:min-h-[820px] lg:px-8 lg:pt-44">
          <div aria-hidden="true" className="hero-grid absolute inset-0 -z-20" />
          <div aria-hidden="true" className="absolute -right-40 top-8 -z-10 size-[34rem] rounded-full bg-brand-sky/20 blur-3xl" />
          <div aria-hidden="true" className="absolute -left-40 bottom-0 -z-10 size-[28rem] rounded-full bg-brand-blue/10 blur-3xl" />

          <div className="mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="hero-copy max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-blue shadow-sm backdrop-blur-sm">
                <Sparkles className="size-4" />
                Built for BINUS computing students
              </div>
              <h1 className="mt-7 text-5xl font-bold leading-[1.04] tracking-[-0.055em] text-brand-navy sm:text-6xl lg:text-[4.65rem]">
                Find your people.<br />
                <span className="text-brand-blue">Build what&apos;s next.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-brand-slate sm:text-xl">
                HIMTI is where BINUS computing students connect, learn, and grow through a community made for technology and the people behind it.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-13 px-6 text-base shadow-[0_16px_30px_-16px_rgba(0,91,204,0.9)]">
                  <Link to="/register">Become a member <ArrowRight className="ml-2 size-5" /></Link>
                </Button>
                <Button asChild variant="outline" className="h-13 border-brand-blue/20 bg-white/60 px-6 text-base text-brand-navy backdrop-blur-sm hover:bg-white">
                  <a href="#about">Discover HIMTI <ChevronRight className="ml-1 size-5" /></a>
                </Button>
              </div>
              <p className="mt-5 text-sm font-medium text-brand-slate">One registration. Your place in the HIMTI community.</p>
            </div>

            <div className="hero-visual relative mx-auto w-full max-w-[500px] lg:mx-0 lg:justify-self-end">
              <div className="relative rounded-[2rem] border border-white/80 bg-white/60 p-4 shadow-[0_35px_80px_-38px_rgba(0,33,79,0.42)] backdrop-blur-xl sm:p-6">
                <div className="relative min-h-[410px] overflow-hidden rounded-[1.5rem] bg-brand-navy p-7 text-white sm:min-h-[460px] sm:p-9">
                  <div aria-hidden="true" className="network-lines absolute inset-0 opacity-60" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-sky">The HIMTI network</p>
                      <p className="mt-2 text-2xl font-bold tracking-tight">Learn. Connect. Contribute.</p>
                    </div>
                    <span className="grid size-11 place-items-center rounded-2xl border border-white/15 bg-white/10">
                      <Network className="size-5 text-brand-sky" />
                    </span>
                  </div>

                  <div className="relative mt-14 grid grid-cols-2 gap-3">
                    <div className="col-span-2 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                      <Users className="size-5 text-brand-sky" />
                      <p className="mt-5 text-3xl font-bold tracking-tight">One community</p>
                      <p className="mt-1 text-sm leading-6 text-blue-100">Across programs, interests, and BINUS regions.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                      <Code2 className="size-5 text-brand-sky" />
                      <p className="mt-4 font-semibold">Technology</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                      <GraduationCap className="size-5 text-brand-sky" />
                      <p className="mt-4 font-semibold">Growth</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-white bg-white/90 px-4 py-3 shadow-xl backdrop-blur-xl sm:flex">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-pale text-brand-blue"><CalendarDays className="size-5" /></span>
                <span><span className="block text-xs font-medium text-brand-slate">Always something new</span><span className="block text-sm font-bold text-brand-navy">Events for every interest</span></span>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-32 px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
            <div>
              <p className="section-label">What is HIMTI?</p>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.04em] text-brand-navy sm:text-4xl">More than an organization. A place to belong.</h2>
            </div>
            <div className="border-l-2 border-brand-blue/15 pl-7 sm:pl-10">
              <p className="text-xl leading-9 text-brand-slate sm:text-2xl sm:leading-10">
                Himpunan Mahasiswa Teknik Informatika brings together BINUS students who share a drive to understand technology, exchange ideas, and make a positive impact.
              </p>
              <div className="mt-10 grid gap-6 sm:grid-cols-3">
                {[
                  ["Connect", "Meet peers who understand your journey."],
                  ["Develop", "Grow practical and personal skills."],
                  ["Contribute", "Take part in work that matters."],
                ].map(([title, copy]) => (
                  <div key={title}>
                    <p className="font-bold text-brand-navy">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-brand-slate">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="events" className="scroll-mt-24 bg-brand-navy px-6 py-24 text-white sm:py-32 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="section-label text-brand-sky">Life at HIMTI</p>
                <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Events made for learning together.</h2>
              </div>
              <p className="max-w-sm text-base leading-7 text-blue-100">From hands-on sessions to community gatherings, every event is another reason to show up and grow.</p>
            </div>

            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {events.map(({ type, title, description, icon: Icon }) => (
                <article key={type} className="group flex min-h-[330px] flex-col rounded-3xl border border-white/10 bg-white/[0.07] p-7 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/[0.11] sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-brand-blue text-white"><Icon className="size-5" /></span>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-sky">{type}</span>
                  </div>
                  <h3 className="mt-12 text-2xl font-bold leading-8 tracking-tight">{title}</h3>
                  <p className="mt-4 text-sm leading-6 text-blue-100">{description}</p>
                  <span className="mt-auto flex items-center gap-2 pt-7 text-sm font-semibold text-brand-sky">Explore together <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="join" className="scroll-mt-24 px-6 py-24 sm:py-32 lg:px-8">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-brand-blue px-6 py-16 text-center text-white shadow-[0_30px_70px_-35px_rgba(0,91,204,0.65)] sm:px-12 sm:py-24">
            <div aria-hidden="true" className="cta-rings absolute inset-0 opacity-35" />
            <div className="relative mx-auto max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">Your community is here</p>
              <h2 className="mt-5 text-4xl font-bold tracking-[-0.05em] sm:text-6xl">There&apos;s a place for you in HIMTI.</h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-50">Register once and take your first step into a community built to help you connect, contribute, and keep growing.</p>
              <Button asChild className="mt-9 bg-white px-7 text-base text-brand-blue hover:bg-blue-50 focus:ring-white focus:ring-offset-brand-blue">
                <Link to="/register">Start your registration <ArrowRight className="ml-2 size-5" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-brand-blue/10 px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <Brand />
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-brand-slate">
            <a className="hover:text-brand-blue" href="#about">About</a>
            <a className="hover:text-brand-blue" href="#events">Events</a>
            <Link className="hover:text-brand-blue" to="/login">Member login</Link>
          </div>
          <p className="flex items-center gap-2 text-xs text-brand-slate"><MapPin className="size-4" /> BINUS University, Indonesia</p>
        </div>
      </footer>
    </div>
  );
}
