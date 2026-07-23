import axios from "axios";
import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { gsap, useGSAP } from "@/lib/motion";
import apiClient from "@/config/api-client";
import { apiPaths } from "@/constants/api";

type VerificationStatus = "loading" | "success" | "invalid" | "error";

const verificationRequests = new Map<string, Promise<void>>();

const verifyToken = (token: string) => {
  const existingRequest = verificationRequests.get(token);
  if (existingRequest) return existingRequest;

  const request = apiClient
    .get(apiPaths.verifyUserEmail, { params: { token } })
    .then(() => undefined)
    .catch((error: unknown) => {
      verificationRequests.delete(token);
      throw error;
    });

  verificationRequests.set(token, request);
  return request;
};

export default function VerifyOutlookPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<VerificationStatus>(
    token ? "loading" : "invalid",
  );
  const [attempt, setAttempt] = useState(0);
  const spinnerRef = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      if (
        status === "loading" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
        spinnerRef.current
      ) {
        gsap.to(spinnerRef.current, {
          rotation: 360,
          duration: 1,
          repeat: -1,
          ease: "none",
        });
      }
    },
    { dependencies: [status], scope: spinnerRef },
  );

  useEffect(() => {
    if (!token) return;
    verifyToken(token)
      .then(() => setStatus("success"))
      .catch((error: unknown) => {
        setStatus(
          axios.isAxiosError(error) && error.response?.status === 400
            ? "invalid"
            : "error",
        );
      });
  }, [attempt, token]);

  if (status === "loading")
    return (
      <AuthLayout>
        <section
          className="auth-card rounded-3xl border border-white/80 bg-white/90 p-9 text-center shadow-xl"
          aria-live="polite"
        >
          <LoaderCircle
            ref={spinnerRef}
            className="mx-auto size-8 text-brand-blue"
          />
          <h1 className="mt-5 text-2xl font-bold text-brand-navy">
            Confirming your email
          </h1>
          <p className="mt-3 text-sm text-brand-slate">
            Please wait while we check your verification link.
          </p>
        </section>
      </AuthLayout>
    );
  if (status === "invalid")
    return (
      <AuthLayout>
        <section className="auth-card rounded-3xl border border-white/80 bg-white/90 p-9 text-center shadow-xl">
          <CircleX className="mx-auto size-12 text-red-500" />
          <h1 className="mt-5 text-2xl font-bold text-brand-navy">
            Link unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-brand-slate">
            This verification link is invalid or has expired. Return to
            registration and request a new link.
          </p>
          <Button asChild className="mt-7">
            <Link to="/reregister">Return to registration</Link>
          </Button>
        </section>
      </AuthLayout>
    );
  if (status === "error")
    return (
      <AuthLayout>
        <section className="auth-card rounded-3xl border border-white/80 bg-white/90 p-9 text-center shadow-xl">
          <CircleX className="mx-auto size-12 text-red-500" />
          <h1 className="mt-5 text-2xl font-bold text-brand-navy">
            Verification unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-brand-slate">
            We could not verify your email right now. Check your connection and
            try again.
          </p>
          <Button
            type="button"
            className="mt-7"
            onClick={() => {
              setStatus("loading");
              setAttempt((current) => current + 1);
            }}
          >
            Try again
          </Button>
        </section>
      </AuthLayout>
    );

  return (
    <AuthLayout>
      <section className="auth-card rounded-3xl border border-white/80 bg-white/90 p-9 text-center shadow-xl">
        <CircleCheck className="mx-auto size-12 text-brand-blue" />
        <h1 className="mt-5 text-2xl font-bold text-brand-navy">
          Email confirmed
        </h1>
        <p className="mt-3 text-sm leading-6 text-brand-slate">
          Your BINUS email has been verified. You may return to the registration
          application.
        </p>
        <Button asChild className="mt-7">
          <Link to="/reregister">Return to registration</Link>
        </Button>
      </section>
    </AuthLayout>
  );
}
