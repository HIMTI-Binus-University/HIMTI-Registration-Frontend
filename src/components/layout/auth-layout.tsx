import type { ReactNode } from "react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { gsap, motionEase, useGSAP } from "@/lib/motion";

export function AuthLayout({ children }: { children: ReactNode }) {
  const layoutRef = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const items = layoutRef.current?.querySelectorAll("[data-auth-motion]");
      if (!items?.length) return;
      gsap.from(items, {
        y: reduce ? 0 : 14,
        autoAlpha: 0,
        duration: reduce ? 0.16 : 0.34,
        stagger: reduce ? 0 : 0.05,
        ease: motionEase,
      });
    },
    { scope: layoutRef },
  );

  return (
    <main
      ref={layoutRef}
      className="grid min-h-dvh place-items-center bg-brand-pale px-3 py-5 sm:px-6 sm:py-8"
    >
      <div
        data-auth-motion
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-[0_16px_32px_-20px_rgba(0,33,79,0.45)]"
      >
        <Link
          to="/"
          className="flex justify-center border-b border-brand-blue/10 px-5 py-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-8 sm:py-6"
          aria-label="HIMTI BINUS registrations home"
        >
          <span className="flex items-center gap-3">
            <img
              data-himti-brand-target
              src="/logo-himti.png"
              alt=""
              className="size-16 object-contain"
            />
            <span className="text-left leading-tight">
              <span className="block text-[22px] font-bold tracking-tight text-brand-ink">
                HIMTI BINUS
              </span>
              <span className="block text-[17px] font-medium text-brand-slate">
                Registrations
              </span>
            </span>
          </span>
        </Link>
        {children}
      </div>
    </main>
  );
}
