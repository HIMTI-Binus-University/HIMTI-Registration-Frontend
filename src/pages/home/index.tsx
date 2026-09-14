import { ArrowRight, Search } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { gsap, motionEase, useGSAP } from "@/lib/motion";

const eventPhotos = [
  {
    src: "/events/event1.jpg",
    alt: "HIMTI students gathering together at a community event",
    className: "collage-photo collage-photo-center",
  },
  {
    src: "/events/event2.jpg",
    alt: "A large HIMTI student gathering outdoors",
    className: "collage-photo collage-photo-top-left",
  },
  {
    src: "/events/event3.jpg",
    alt: "Students taking part in a HIMTI team activity",
    className: "collage-photo collage-photo-top-right",
  },
  {
    src: "/events/event5.jpg",
    alt: "Students celebrating at a HIMTI welcoming party",
    className: "collage-photo collage-photo-bottom-left",
  },
  {
    src: "/events/event6.jpg",
    alt: "HIMTI seminar attendees gathered in a lecture hall",
    className: "collage-photo collage-photo-bottom-right",
  },
];

function Brand() {
  return (
    <Link
      to="/"
      className="flex min-w-0 items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:gap-3"
    >
      <img
        data-himti-brand-target
        src="/logo-himti.png"
        alt=""
        className="size-8 shrink-0 object-contain sm:size-10"
      />
      <span className="leading-tight">
        <span className="block whitespace-nowrap text-xs font-bold tracking-tight text-brand-ink sm:text-sm">
          HIMTI BINUS
        </span>
        <span className="block text-[10px] font-medium text-brand-slate sm:text-[11px]">
          Registrations
        </span>
      </span>
    </Link>
  );
}

function EventCollage() {
  return (
    <div
      className="event-collage order-first md:order-none"
      aria-label="HIMTI student experiences"
    >
      {eventPhotos.map(({ src, alt, className }, index) => (
        <figure key={src} className={className}>
          <img
            src={src}
            alt={alt}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        </figure>
      ))}
      <span className="collage-label collage-label-workshop">Workshop</span>
      <span className="collage-label collage-label-competitions">
        Competitions
      </span>
      <span className="collage-label collage-label-seminars">Seminars</span>
      <span className="collage-label collage-label-welcoming">
        Welcoming Party
      </span>
    </div>
  );
}

export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ delay: 0.12, defaults: { ease: motionEase } })
          .from("nav", { y: -10, autoAlpha: 0, duration: 0.45 })
          .from(
            ".collage-photo",
            {
              y: 10,
              scale: 0.98,
              autoAlpha: 0,
              duration: 0.6,
              stagger: 0.05,
            },
            "-=0.25",
          )
          .from(
            ".collage-label",
            { scale: 0.96, autoAlpha: 0, duration: 0.35, stagger: 0.05 },
            "-=0.25",
          )
          .from(
            ".hero-copy > *",
            { y: 12, autoAlpha: 0, duration: 0.55, stagger: 0.07 },
            "-=0.35",
          );

        gsap.to(".collage-photo-top-left, .collage-photo-bottom-right", {
          y: -2,
          duration: 5.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
        gsap.to(".collage-photo-top-right, .collage-photo-bottom-left", {
          y: 2,
          duration: 6.3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
        gsap.to(".collage-photo-center", {
          y: -1,
          duration: 7,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    },
    { scope: pageRef },
  );

  return (
    <div
      ref={pageRef}
      className="home-page relative min-h-dvh overflow-x-hidden bg-background text-brand-ink"
    >
      <div aria-hidden="true" className="hero-wash absolute inset-0" />

      <header className="home-header relative z-20 px-3 pt-3 sm:px-6 sm:pt-6">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-2xl bg-white/90 px-2.5 py-2.5 shadow-[0_6px_8px_-6px_rgba(0,33,79,0.35)] backdrop-blur-xl sm:px-5 sm:py-3"
        >
          <Brand />
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            <Button
              asChild
              variant="outline"
              className="h-9 border-0 px-2 text-xs text-brand-blue sm:h-11 sm:px-4 sm:text-sm"
            >
              <Link to="/events">Events</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-9 border-0 px-2 text-xs text-brand-blue sm:h-11 sm:px-4 sm:text-sm"
            >
              <Link to="/login">Log in</Link>
            </Button>
            <Button
              asChild
              className="h-9 px-2.5 text-xs sm:h-11 sm:px-5 sm:text-sm"
            >
              <Link to="/register">
                Join HIMTI
                <ArrowRight className="ml-2 hidden size-4 sm:block" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="home-main relative z-10 mx-auto flex max-w-6xl items-center px-5 py-8 sm:px-6 sm:py-10 md:min-h-[calc(100dvh-6rem)] md:px-8 md:py-12">
        <section className="home-hero grid w-full items-center gap-7 sm:gap-10 md:grid-cols-[0.94fr_1.06fr] md:gap-8 xl:gap-16">
          <div className="hero-copy max-w-2xl">
            <h1 className="hero-heading text-balance text-[clamp(2rem,6.5vw,5.4rem)] font-bold leading-[0.98] tracking-[-0.04em] text-brand-navy">
              Join once.
              <br />
              Show up for <span className="text-brand-blue">more.</span>
            </h1>
            <p className="hero-description mt-3 max-w-xl text-pretty text-[13px] leading-5 text-brand-slate sm:mt-5 sm:text-base sm:leading-7 md:mt-7 md:text-lg md:leading-8">
              Register as a HIMTI member and become part of a community where
              students learn, connect, and create unforgettable experiences
              together.
            </p>
            <div className="hero-actions mt-3 flex gap-2 sm:mt-6 sm:gap-3 md:mt-9">
              <Button
                asChild
                variant="outline"
                className="h-10 min-h-0 flex-1 border-brand-blue/20 bg-white/70 px-3 text-sm text-brand-navy sm:h-12 sm:flex-none sm:px-7 sm:text-base"
              >
                <Link to="/events">Browse events</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 min-h-0 flex-1 border-brand-blue/20 bg-white/70 px-3 text-sm text-brand-navy sm:h-12 sm:flex-none sm:px-7 sm:text-base"
              >
                <a href="https://ofog.himtibinus.or.id">
                  <Search className="mr-2 size-4" /> Explore HIMTI
                </a>
              </Button>
              <Button
                asChild
                className="h-10 min-h-0 flex-1 px-3 text-sm sm:h-12 sm:flex-none sm:px-7 sm:text-base"
              >
                <Link to="/register">
                  Join HIMTI <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
            </div>
          </div>

          <EventCollage />
        </section>
      </main>
    </div>
  );
}
