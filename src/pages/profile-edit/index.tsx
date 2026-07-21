import axios from "axios";
import { ArrowLeft, Check, Send } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  useProfile,
  useSendVerification,
  useUpdateProfile,
} from "@/api/registration";
import type { Profile } from "@/api/registration";
import { Button } from "@/components/ui/button";

export default function ProfileEditPage() {
  const query = useProfile();
  if (!query.data) return null;
  return <ProfileEditForm profile={query.data} refetch={query.refetch} />;
}

function ProfileEditForm({
  profile,
  refetch,
}: {
  profile: Profile;
  refetch: () => Promise<unknown>;
}) {
  const updateProfile = useUpdateProfile();
  const sendVerification = useSendVerification();
  const [name, setName] = useState(profile.name);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber ?? "");
  const [lineId, setLineId] = useState(profile.lineId ?? "");
  const [binusEmail, setBinusEmail] = useState(profile.outlookEmail ?? "");
  const [verificationSent, setVerificationSent] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const emailVerified = Boolean(
    profile.outlookEmailVerified &&
      profile.outlookEmail?.toLowerCase() === binusEmail.toLowerCase(),
  );

  const save = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    updateProfile.mutate(
      { name, phoneNumber, lineId },
      {
        onSuccess: () => setSaved(true),
        onError: (requestError) => {
          const body = axios.isAxiosError(requestError)
            ? requestError.response?.data
            : null;
          setError(body?.msg ?? "Your profile could not be saved");
        },
      },
    );
  };

  if (saved)
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
        <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
          <Check className="mx-auto size-12 text-brand-blue" />
          <h1 className="mt-5 text-3xl font-bold text-brand-navy">
            Profile updated
          </h1>
          <p className="mt-3 text-sm text-brand-slate">
            Your contact information has been saved.
          </p>
          <Button asChild className="mt-7">
            <Link to="/dashboard">Return to dashboard</Link>
          </Button>
        </section>
      </main>
    );

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/dashboard"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-blue"
        >
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>
        <form
          onSubmit={save}
          className="mt-4 rounded-3xl border border-white/80 bg-white p-6 shadow-xl sm:p-9"
        >
          <p className="section-label">Member profile</p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">
            Edit contact information
          </h1>
          <p className="mt-3 text-sm leading-6 text-brand-slate">
            Registration path and academic information cannot be changed.
          </p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <Field label="Full name" value={name} onChange={setName} required />
            <Field
              label="Phone number"
              value={phoneNumber}
              onChange={setPhoneNumber}
              type="tel"
              required
            />
            <Field label="LINE ID" value={lineId} onChange={setLineId} />
            <Field
              label="Google email"
              value={profile.email}
              type="email"
              disabled
            />
          </div>

          <section className="mt-6 rounded-2xl border border-brand-blue/15 bg-brand-pale/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-brand-navy">BINUS email</h2>
                <p className="mt-1 text-xs leading-5 text-brand-slate">
                  A changed address must be verified before it is confirmed.
                </p>
              </div>
              {emailVerified && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                  Verified
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                aria-label="BINUS email"
                type="email"
                value={binusEmail}
                onChange={(event) => {
                  setBinusEmail(event.target.value);
                  setVerificationSent(false);
                }}
                className="h-11 min-w-0 flex-1 rounded-xl border border-brand-blue/15 bg-white px-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
              />
              {!emailVerified && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={!binusEmail || sendVerification.isPending}
                  onClick={() =>
                    sendVerification.mutate(binusEmail, {
                      onSuccess: () => setVerificationSent(true),
                    })
                  }
                >
                  <Send className="mr-2 size-4" /> Send verification
                </Button>
              )}
            </div>
            {verificationSent && (
              <div className="mt-3 text-sm text-brand-slate" role="status">
                Verification sent. After opening the link, return here and{" "}
                <button
                  type="button"
                  className="font-bold text-brand-blue underline"
                  onClick={() => void refetch()}
                >
                  check status
                </button>
                .
              </div>
            )}
          </section>

          {error && (
            <p role="alert" className="mt-5 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="mt-7 w-full sm:w-auto"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Save contact information"}
          </Button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="text-sm font-semibold text-brand-ink">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-brand-blue/15 bg-white px-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 disabled:bg-slate-100 disabled:text-brand-slate"
      />
    </label>
  );
}
