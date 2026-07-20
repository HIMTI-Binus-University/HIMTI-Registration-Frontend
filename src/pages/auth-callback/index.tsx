import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const destination = searchParams.get("profile") === "complete" ? "/dashboard" : "/register";
    const timeout = window.setTimeout(() => navigate(destination, { replace: true }), 500);
    return () => window.clearTimeout(timeout);
  }, [navigate, searchParams]);

  return (
    <AuthLayout>
      <section className="rounded-3xl border border-white/80 bg-white/90 p-9 text-center shadow-xl" aria-live="polite">
        <LoaderCircle className="mx-auto size-7 animate-spin text-brand-blue" />
        <h1 className="mt-5 text-xl font-bold text-brand-navy">Setting up your account</h1>
        <p className="mt-2 text-sm text-brand-slate">Checking your membership details...</p>
      </section>
    </AuthLayout>
  );
}
