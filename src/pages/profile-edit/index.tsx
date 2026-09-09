import axios from "axios";
import { ArrowLeft, Check, ChevronDown, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  useCurrentUser,
  useSendUserEmailVerification,
  useUpdateCurrentUserProfile,
  useUserRegistrationOptions,
  type UserOption,
  type UserProfile,
} from "@/api/users/queries";
import { Button } from "@/components/ui/button";
import { sanitizeReturnPath } from "@/utils/return-path";
import { buildProfilePayload, type ProfileFormData } from "./payload";

type ProfileFormState = Omit<ProfileFormData, "institutionType"> & {
  institutionType: ProfileFormData["institutionType"] | "";
};

export default function ProfileEditPage() {
  const query = useCurrentUser();
  const options = useUserRegistrationOptions();
  const [searchParams] = useSearchParams();
  const returnTo = sanitizeReturnPath(
    searchParams.get("returnTo"),
    "/dashboard",
  );

  if (!query.data) return null;
  return (
    <ProfileEditForm
      profile={query.data}
      options={options.data}
      optionsPending={options.isPending}
      refetch={query.refetch}
      returnTo={returnTo}
    />
  );
}

function ProfileEditForm({
  profile,
  options,
  optionsPending,
  refetch,
  returnTo,
}: {
  profile: UserProfile;
  options?: {
    universities: UserOption[];
    studyPrograms: UserOption[];
    binusRegions: UserOption[];
  };
  optionsPending: boolean;
  refetch: () => Promise<{ isError: boolean }>;
  returnTo: string;
}) {
  const updateProfile = useUpdateCurrentUserProfile();
  const sendVerification = useSendUserEmailVerification();
  const [data, setData] = useState<ProfileFormState>({
    institutionType: profile.institutionType ?? "",
    name: profile.name,
    phoneNumber: profile.phoneNumber ?? "",
    lineId: profile.lineId ?? "",
    universityId: profile.universityId ?? "",
    studyProgramId: profile.studyProgramId ?? "",
    regionId: profile.regionId ?? "",
    nim: profile.nim ?? "",
    universityName: profile.universityName ?? profile.university?.name ?? "",
    studyProgramName:
      profile.studyProgramName ?? profile.studyProgram?.name ?? "",
  });
  const [binusEmail, setBinusEmail] = useState(profile.outlookEmail ?? "");
  const [verificationSent, setVerificationSent] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const emailVerified = Boolean(
    profile.outlookEmailVerified &&
    profile.outlookEmail?.toLowerCase() === binusEmail.toLowerCase(),
  );
  const update = (name: keyof ProfileFormState, value: string) =>
    setData((current) => ({ ...current, [name]: value }));

  const save = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!data.institutionType) {
      setError("Choose an institution path");
      return;
    }
    if (data.institutionType === "BINUS" && !emailVerified) {
      setError("Verify your BINUS email before saving");
      return;
    }
    updateProfile.mutate(
      buildProfilePayload({ ...data, institutionType: data.institutionType }),
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
            Your event registration information has been saved.
          </p>
          <Button asChild className="mt-7">
            <Link to={returnTo}>
              {returnTo === "/dashboard" ? "Return to dashboard" : "Continue"}
            </Link>
          </Button>
        </section>
      </main>
    );

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to={returnTo}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-blue"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>
        <form
          onSubmit={save}
          className="mt-4 rounded-3xl border border-white/80 bg-white p-6 shadow-xl sm:p-9"
        >
          <p className="section-label">Member profile</p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">
            Edit registration profile
          </h1>
          <p className="mt-3 text-sm leading-6 text-brand-slate">
            Keep the personal and institution details used for event
            registration up to date.
          </p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <Field
              label="Full name"
              value={data.name}
              onChange={(value) => update("name", value)}
              required
            />
            <Field
              label="WhatsApp / phone number"
              value={data.phoneNumber}
              onChange={(value) => update("phoneNumber", value)}
              type="tel"
              required
            />
            <Field
              label="LINE ID"
              value={data.lineId}
              onChange={(value) => update("lineId", value)}
            />
            <Field label="Google email" value={profile.email} disabled />
          </div>

          <fieldset className="mt-7">
            <legend className="text-sm font-bold text-brand-navy">
              Institution path
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(["BINUS", "NON_BINUS"] as const).map((institutionType) => (
                <button
                  key={institutionType}
                  type="button"
                  aria-pressed={data.institutionType === institutionType}
                  onClick={() => update("institutionType", institutionType)}
                  className={`min-h-12 rounded-2xl border px-4 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-ring ${data.institutionType === institutionType ? "border-brand-blue bg-brand-pale text-brand-blue" : "border-brand-blue/15 text-brand-navy"}`}
                >
                  {institutionType === "BINUS" ? "BINUS" : "Non-BINUS"}
                </button>
              ))}
            </div>
          </fieldset>

          {data.institutionType === "BINUS" ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <SelectField
                label="University"
                value={data.universityId}
                options={options?.universities ?? []}
                onChange={(value) => update("universityId", value)}
                disabled={optionsPending}
              />
              <SelectField
                label="Study program"
                value={data.studyProgramId}
                options={options?.studyPrograms ?? []}
                onChange={(value) => update("studyProgramId", value)}
                disabled={optionsPending}
              />
              <SelectField
                label="Region"
                value={data.regionId}
                options={options?.binusRegions ?? []}
                onChange={(value) => update("regionId", value)}
                disabled={optionsPending}
              />
              <Field
                label="NIM"
                value={data.nim}
                onChange={(value) => update("nim", value)}
                required
              />
              <VerificationPanel
                binusEmail={binusEmail}
                emailVerified={emailVerified}
                verificationSent={verificationSent}
                verificationError={verificationError}
                pending={sendVerification.isPending}
                onEmailChange={(value) => {
                  setBinusEmail(value);
                  setVerificationSent(false);
                  setVerificationError("");
                }}
                onSend={() => {
                  setVerificationError("");
                  sendVerification.mutate(binusEmail, {
                    onSuccess: () => setVerificationSent(true),
                    onError: () =>
                      setVerificationError(
                        "Verification could not be sent. Please try again.",
                      ),
                  });
                }}
                onCheck={() => {
                  setVerificationError("");
                  void refetch().then((result) => {
                    if (result.isError)
                      setVerificationError(
                        "Verification status could not be checked. Please try again.",
                      );
                  });
                }}
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                label="University"
                value={data.universityName}
                onChange={(value) => update("universityName", value)}
                required
              />
              <Field
                label="Study program"
                value={data.studyProgramName}
                onChange={(value) => update("studyProgramName", value)}
                required
              />
            </div>
          )}

          {error && (
            <p role="alert" className="mt-5 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="mt-7 w-full sm:w-auto"
            disabled={updateProfile.isPending || optionsPending}
          >
            {updateProfile.isPending ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </div>
    </main>
  );
}

function VerificationPanel({
  binusEmail,
  emailVerified,
  verificationSent,
  verificationError,
  pending,
  onEmailChange,
  onSend,
  onCheck,
}: {
  binusEmail: string;
  emailVerified: boolean;
  verificationSent: boolean;
  verificationError: string;
  pending: boolean;
  onEmailChange: (value: string) => void;
  onSend: () => void;
  onCheck: () => void;
}) {
  return (
    <section className="rounded-2xl border border-brand-blue/15 bg-brand-pale/40 p-4 sm:col-span-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-brand-navy">BINUS Outlook email</h2>
          <p className="mt-1 text-xs leading-5 text-brand-slate">
            Your Outlook address must be verified before this profile can be
            saved.
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
          aria-label="BINUS Outlook email"
          type="email"
          value={binusEmail}
          required
          onChange={(event) => onEmailChange(event.target.value)}
          className="h-11 min-w-0 flex-1 rounded-xl border border-brand-blue/15 bg-white px-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
        />
        {!emailVerified && (
          <Button
            type="button"
            variant="outline"
            disabled={!binusEmail || pending}
            onClick={onSend}
          >
            <Send className="mr-2 size-4" /> Send verification
          </Button>
        )}
      </div>
      {verificationSent && (
        <p className="mt-3 text-sm text-brand-slate" role="status">
          Verification sent. After opening the link, return here and{" "}
          <button
            type="button"
            className="font-bold text-brand-blue underline"
            onClick={onCheck}
          >
            check status
          </button>
          .
        </p>
      )}
      {verificationError && (
        <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
          {verificationError}
        </p>
      )}
    </section>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: UserOption[];
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <label className="text-sm font-semibold text-brand-ink">
      {label}
      <span className="relative mt-2 block">
        <select
          aria-label={label}
          value={value}
          required
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-brand-blue/15 bg-white px-3 pr-9 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 disabled:bg-slate-100"
        >
          <option value="">{disabled ? "Loading..." : "Choose one"}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3 size-5 text-brand-slate" />
      </span>
    </label>
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
        aria-label={label}
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
