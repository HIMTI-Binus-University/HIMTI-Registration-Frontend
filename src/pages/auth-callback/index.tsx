import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/layout/auth-layout";
import { gsap, useGSAP } from "@/lib/motion";
import { useRef } from "react";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const spinnerRef = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && spinnerRef.current) gsap.to(spinnerRef.current, { rotation: 360, duration: 1, repeat: -1, ease: "none" });
  }, { scope: spinnerRef });

  useEffect(() => {
    const destination = searchParams.get("profile") === "complete" ? "/dashboard" : "/register";
    const timeout = window.setTimeout(() => navigate(destination, { replace: true }), 500);
    return () => window.clearTimeout(timeout);
  }, [navigate, searchParams]);

  return (
    <AuthLayout>
      <section className="rounded-3xl border border-white/80 bg-white/90 p-9 text-center shadow-xl" aria-live="polite">
         <LoaderCircle ref={spinnerRef} className="mx-auto size-7 text-brand-blue" />
        <h1 className="mt-5 text-xl font-bold text-brand-navy">Setting up your account</h1>
        <p className="mt-2 text-sm text-brand-slate">Checking your membership details...</p>
      </section>
    </AuthLayout>
  );
}
