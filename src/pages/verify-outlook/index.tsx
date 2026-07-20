import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { gsap, useGSAP } from "@/lib/motion";
import apiClient from "@/config/api-client";
import { apiPaths } from "@/constants/api";

export default function VerifyOutlookPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState(params.get("status") ?? "loading");
  const spinnerRef = useRef<SVGSVGElement>(null);
  useGSAP(() => {
    if (status === "loading" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && spinnerRef.current) {
      gsap.to(spinnerRef.current, { rotation: 360, duration: 1, repeat: -1, ease: "none" });
    }
  }, { dependencies: [status], scope: spinnerRef });

  useEffect(() => {
    if (!params.get("status")) {
      const timeout = window.setTimeout(() => {
        apiClient.get(apiPaths.verifyEmail, { params: { token: params.get("token") } })
          .then(() => setStatus("success"))
          .catch(() => setStatus("invalid"));
      }, 700);
      return () => window.clearTimeout(timeout);
    }
  }, [params]);

  if (status === "loading") return <AuthLayout><section className="auth-card rounded-3xl border border-white/80 bg-white/90 p-9 text-center shadow-xl" aria-live="polite"><LoaderCircle ref={spinnerRef} className="mx-auto size-8 text-brand-blue" /><h1 className="mt-5 text-2xl font-bold text-brand-navy">Confirming your email</h1><p className="mt-3 text-sm text-brand-slate">Please wait while we check your verification link.</p></section></AuthLayout>;
  if (status === "invalid") return <AuthLayout><section className="auth-card rounded-3xl border border-white/80 bg-white/90 p-9 text-center shadow-xl"><CircleX className="mx-auto size-12 text-red-500" /><h1 className="mt-5 text-2xl font-bold text-brand-navy">Link unavailable</h1><p className="mt-3 text-sm leading-6 text-brand-slate">This verification link is invalid or has expired. Return to registration and request a new link.</p><Button asChild className="mt-7"><Link to="/register">Return to registration</Link></Button></section></AuthLayout>;

  return (
    <AuthLayout>
      <section className="auth-card rounded-3xl border border-white/80 bg-white/90 p-9 text-center shadow-xl">
        <CircleCheck className="mx-auto size-12 text-brand-blue" />
        <h1 className="mt-5 text-2xl font-bold text-brand-navy">Email confirmed</h1>
        <p className="mt-3 text-sm leading-6 text-brand-slate">Your BINUS email has been verified. You may return to the registration application.</p>
        <Button asChild className="mt-7"><Link to="/register">Return to registration</Link></Button>
      </section>
    </AuthLayout>
  );
}
