import type { ReactNode } from "react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { gsap, motionEase, useGSAP } from "@/lib/motion";

export function AuthLayout({ children }: { children: ReactNode }) {
  const layoutRef = useRef<HTMLElement>(null);
  useGSAP(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = layoutRef.current?.querySelectorAll("[data-auth-motion]");
    if (!items?.length) return;
    gsap.from(items, { y: reduce ? 0 : 14, autoAlpha: 0, duration: reduce ? 0.16 : 0.34, stagger: reduce ? 0 : 0.05, ease: motionEase });
  }, { scope: layoutRef });

  return (
    <main ref={layoutRef} className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-3 py-5 sm:px-6 sm:py-8">
      <div aria-hidden="true" className="hero-grid absolute inset-0" />
      <div aria-hidden="true" className="absolute -right-36 -top-36 size-96 rounded-full bg-brand-sky/20 blur-3xl" />
      <div className="relative w-full max-w-xl">
        <Link data-auth-motion
          to="/"
          className="mx-auto mb-6 flex w-fit items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="HIMTI registration home"
        >
          <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-brand-navy p-1.5">
            <img src="/himti-icon.svg" alt="" className="size-full object-contain" />
          </span>
          <span className="text-left leading-tight">
            <span className="block text-sm font-bold text-brand-ink">HIMTI</span>
            <span className="block text-[11px] font-medium text-brand-slate">Membership registration</span>
          </span>
        </Link>
        <div data-auth-motion>{children}</div>
      </div>
    </main>
  );
}
