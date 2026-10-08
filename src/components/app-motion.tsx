import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { gsap, useGSAP } from "@/lib/motion";

const introSessionKey = "himti-intro-seen";

export function AppOpening() {
  const { pathname } = useLocation();
  const intro = useRef<HTMLDivElement>(null);
  const introMark = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const target = Array.from(
          document.querySelectorAll<HTMLElement>("[data-himti-brand-target]"),
        ).find((candidate) => {
          const bounds = candidate.getBoundingClientRect();
          return (
            bounds.width > 0 &&
            bounds.height > 0 &&
            bounds.right > 0 &&
            bounds.bottom > 0 &&
            bounds.left < window.innerWidth &&
            bounds.top < window.innerHeight
          );
        });
        let seen = false;
        try {
          seen = Boolean(sessionStorage.getItem(introSessionKey));
        } catch {
          // Storage can be unavailable in privacy-restricted browsers.
        }
        if (!intro.current || !introMark.current || !target || seen) return;

        const bounds = target.getBoundingClientRect();
        const targetX = bounds.left + bounds.width / 2 - window.innerWidth / 2;
        const targetY = bounds.top + bounds.height / 2 - window.innerHeight / 2;
        const timeline = gsap.timeline({
          defaults: { ease: "power3.inOut" },
          onComplete: () => {
            try {
              sessionStorage.setItem(introSessionKey, "1");
            } catch {
              // The completed animation does not depend on storage access.
            }
          },
        });

        gsap.set(intro.current, { autoAlpha: 1 });
        gsap.set(target, { autoAlpha: 0 });
        timeline
          .to(introMark.current, {
            rotation: 360,
            duration: 0.5,
            ease: "power2.out",
          })
          .to(
            introMark.current,
            {
              x: targetX,
              y: targetY,
              scale: bounds.width / 92,
              duration: 0.42,
            },
            "-=.05",
          )
          .to(target, { autoAlpha: 1, duration: 0.12 }, "-=.12")
          .to(intro.current, { autoAlpha: 0, duration: 0.18 }, "-=.1");
      });

      return () => media.revert();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <div className="brand-intro" ref={intro} aria-hidden="true">
      <div className="brand-intro-mark" ref={introMark}>
        <img src="/logo-himti.png" width={92} height={92} alt="" />
      </div>
    </div>
  );
}

export function AppLoading({ label }: { label: string }) {
  return (
    <main className="app-loading" aria-live="polite" aria-busy="true">
      <img
        data-himti-brand-target
        src="/logo-himti.png"
        width={72}
        height={72}
        alt=""
      />
      <strong>{label}</strong>
    </main>
  );
}
