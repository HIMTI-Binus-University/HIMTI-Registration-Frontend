import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/config/api-client";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/api/auth";
import { parseApiError } from "@/api/api-error";
import { sanitizeReturnPath, storeReturnPath } from "@/utils/return-path";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.2L6.5 14Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.9c1.6 0 3 .5 4.1 1.6L19 4.7A9.7 9.7 0 0 0 3.1 7.4l3.4 2.7A5.9 5.9 0 0 1 12 5.9Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [devLoginEnabled, setDevLoginEnabled] = useState(false);
  const [devLoading, setDevLoading] = useState(false);
  const [devError, setDevError] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  useEffect(() => {
    let active = true;
    void apiClient
      .get<{ enabled: boolean }>("/api/auth/dev-login")
      .then(({ data }) => {
        if (active) setDevLoginEnabled(data.enabled === true);
      })
      .catch(() => {
        if (active) setDevLoginEnabled(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const devLogin = async () => {
    setDevLoading(true);
    setDevError(false);
    try {
      await apiClient.post(
        "/api/auth/dev-login",
        {},
        { withCredentials: true },
      );
      navigate("/auth/callback", { replace: true });
    } catch {
      setDevError(true);
      setDevLoading(false);
    }
  };
  const [params] = useSearchParams();
  const location = useLocation();
  const stateFrom = (location.state as { from?: unknown } | null)?.from;
  const returnTo = storeReturnPath(
    sanitizeReturnPath(params.get("returnTo") ?? stateFrom, "/dashboard"),
  );
  const googleLogin = async () => {
    setGoogleLoading(true);
    setGoogleError("");
    try {
      await signInWithGoogle(returnTo);
    } catch (error) {
      const parsed = parseApiError(error);
      const message =
        error instanceof Error &&
        !("response" in error) &&
        error.message !== "Network Error"
          ? error.message
          : parsed.code ||
              parsed.message !== "Something went wrong. Please try again."
            ? parsed.message
            : "Could not connect to Google sign-in. Please try again.";
      setGoogleError(message);
      setGoogleLoading(false);
    }
  };
  return (
    <AuthLayout>
      <section className="p-5 text-center sm:p-8">
        <h1 className="text-3xl font-bold tracking-[-0.04em] text-brand-navy">
          Sign in to HIMTI
        </h1>
        <p className="mt-3 text-sm leading-6 text-brand-slate">
          Use your Google account to register or return to your member
          dashboard.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-8 h-12 w-full gap-3 border-brand-blue/20 bg-white text-brand-ink hover:bg-brand-pale"
          disabled={googleLoading}
          onClick={() => void googleLogin()}
        >
          <GoogleMark />{" "}
          {googleLoading ? "Signing in..." : "Continue with Google"}
        </Button>
        {googleError && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {googleError}
          </p>
        )}
        {devLoginEnabled && (
          <Button
            type="button"
            className="mt-3 h-12 w-full"
            disabled={devLoading}
            onClick={() => void devLogin()}
          >
            {devLoading ? "Signing in..." : "Development System login"}
          </Button>
        )}
        {devError && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            Development sign-in failed. Please try again.
          </p>
        )}
        <p className="mt-5 text-center text-xs leading-5 text-brand-slate">
          By continuing, you agree to provide the information required for HIMTI
          membership.
        </p>
        <Link
          className="mt-7 flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-brand-blue focus:outline-none focus:ring-2 focus:ring-ring"
          to="/"
        >
          <ArrowLeft className="size-4" /> Back to home
        </Link>
      </section>
    </AuthLayout>
  );
}
