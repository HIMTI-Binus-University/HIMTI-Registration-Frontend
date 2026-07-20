import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.2L6.5 14Z" />
      <path fill="#EA4335" d="M12 5.9c1.6 0 3 .5 4.1 1.6L19 4.7A9.7 9.7 0 0 0 3.1 7.4l3.4 2.7A5.9 5.9 0 0 1 12 5.9Z" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_24px_70px_-35px_rgba(0,33,79,0.45)] backdrop-blur-xl sm:p-9">
        <p className="section-label">Member access</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-brand-navy">Continue to HIMTI</h1>
        <p className="mt-3 text-sm leading-6 text-brand-slate">
          Use your Google account to register or return to your member dashboard.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-8 h-12 w-full gap-3 border-brand-blue/20 bg-white text-brand-ink hover:bg-brand-pale"
          onClick={() => navigate("/auth/callback")}
        >
          <GoogleMark /> Continue with Google
        </Button>
        <p className="mt-5 text-center text-xs leading-5 text-brand-slate">
          By continuing, you agree to provide the information required for HIMTI membership.
        </p>
        <Link className="mt-7 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold text-brand-blue focus:outline-none focus:ring-2 focus:ring-ring" to="/">
          <ArrowLeft className="size-4" /> Back to home
        </Link>
      </section>
    </AuthLayout>
  );
}
