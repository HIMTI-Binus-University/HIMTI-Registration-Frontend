import { ArrowRight, CalendarDays, Check, Ticket, Users } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { gsap, motionEase, useGSAP } from "@/lib/motion";

function Brand() {
  return (
    <Link
      to="/"
      className="flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-brand-navy p-1.5 shadow-sm">
        <img
          src="/himti-icon.svg"
          alt=""
          className="size-full object-contain"
        />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-tight text-brand-ink">
          HIMTI
        </span>
        <span className="block text-[11px] font-medium text-brand-slate">
          BINUS University
        </span>
      </span>
    </Link>
  );
}

export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          gsap
            .timeline({ delay: 0.12, defaults: { ease: motionEase } })
            .from("nav", { y: -16, autoAlpha: 0, duration: 0.5 })
            .from(
              ".hero-copy > *",
              { y: 22, autoAlpha: 0, duration: 0.65, stagger: 0.09 },
              "-=0.25",
            )
            .from(
              ".hero-scene",
              { scale: 0.94, rotate: 2, autoAlpha: 0, duration: 0.85 },
              "-=0.5",
            )
            .from(
              ".orbit-item",
              { scale: 0.7, autoAlpha: 0, duration: 0.5, stagger: 0.1 },
              "-=0.4",
            );

          gsap.to(".orbit-one", {
            y: -12,
            rotate: -2,
            duration: 3.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
          gsap.to(".orbit-two", {
            y: 10,
            rotate: 3,
            duration: 3.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
          gsap.to(".hero-halo", {
            scale: 1.08,
            opacity: 0.65,
            duration: 2.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        },
        pageRef,
      );
    },
    { scope: pageRef },
  );

  return (
    <div
      ref={pageRef}
      className="home-page relative h-dvh overflow-hidden bg-background text-brand-ink"
    >
      <div aria-hidden="true" className="hero-wash absolute inset-0" />

      <header className="absolute inset-x-0 top-0 z-20 px-4 pt-4 sm:px-6 sm:pt-6">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl bg-white/85 px-3 py-3 shadow-[0_6px_24px_-14px_rgba(0,33,79,0.45)] backdrop-blur-xl sm:px-5"
        >
          <Brand />
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              asChild
              variant="outline"
              className="h-11 border-0 px-3 text-brand-blue sm:px-4"
            >
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="h-11 px-3 sm:px-5">
              <Link to="/register">
                Register <ArrowRight className="ml-2 hidden size-4 sm:block" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-5 pb-5 pt-24 sm:px-6 sm:pb-8 sm:pt-28 lg:px-8">
        <section className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="hero-copy max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-pale px-3 py-2 text-xs font-bold text-brand-blue sm:px-4 sm:text-sm">
              <span className="size-2 rounded-full bg-brand-blue" />
              Your pass to every HIMTI event
            </p>
            <h1 className="mt-5 text-balance text-[clamp(2.65rem,7vw,5.4rem)] font-bold leading-[0.98] tracking-[-0.04em] text-brand-navy sm:mt-7">
              Join once.
              <br />
              Show up for <span className="text-brand-blue">more.</span>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-brand-slate sm:mt-7 sm:text-xl sm:leading-8">
              Register as a HIMTI member to unlock event registration, new
              experiences, and your place in the community.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row">
              <Button
                asChild
                variant="outline"
                className="min-h-12 w-full border-brand-blue/20 bg-white/70 px-7 text-base text-brand-navy sm:w-auto"
              >
                <a href="https://ofog.himtibinus.or.id">Discover HIMTI</a>
              </Button>
              <Button
                asChild
                className="min-h-12 w-full px-7 text-base shadow-[0_8px_20px_-10px_rgba(0,91,204,0.9)] sm:w-auto"
              >
                <Link to="/register">
                  Start registration <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
            </div>
          </div>

          <div
            className="hero-scene relative mx-auto hidden aspect-square w-full max-w-[480px] lg:block"
            aria-hidden="true"
          >
            <div className="hero-halo absolute inset-[8%] rounded-full bg-brand-sky/25 blur-3xl" />
            <div className="absolute inset-[12%] rounded-full border border-brand-blue/10" />
            <div className="absolute inset-[23%] rounded-full border border-dashed border-brand-blue/20" />

            <div className="absolute inset-[22%] grid place-items-center rounded-full bg-brand-navy text-center text-white shadow-[0_28px_70px_-28px_rgba(0,33,79,0.7)]">
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-blue">
                  <Users className="size-7" />
                </span>
                <p className="mt-5 text-sm font-semibold text-brand-sky">
                  HIMTI membership
                </p>
                <p className="mt-1 text-2xl font-bold">Your starting point</p>
                <p className="mx-auto mt-3 flex w-fit items-center gap-2 text-sm text-blue-100">
                  <Check className="size-4" /> Register once
                </p>
              </div>
            </div>

            <div className="orbit-item orbit-one absolute left-0 top-[18%] flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_8px_28px_-12px_rgba(0,33,79,0.35)]">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-pale text-brand-blue">
                <CalendarDays className="size-5" />
              </span>
              <span>
                <span className="block text-xs font-semibold text-brand-slate">
                  Next step
                </span>
                <span className="block font-bold text-brand-navy">
                  Choose an event
                </span>
              </span>
            </div>
            <div className="orbit-item orbit-two absolute bottom-[14%] right-0 flex items-center gap-3 rounded-2xl bg-brand-blue px-4 py-3 text-white shadow-[0_10px_28px_-12px_rgba(0,91,204,0.7)]">
              <Ticket className="size-6 text-brand-sky" />
              <span>
                <span className="block text-xs font-semibold text-blue-100">
                  Member access
                </span>
                <span className="block font-bold">Event unlocked</span>
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
