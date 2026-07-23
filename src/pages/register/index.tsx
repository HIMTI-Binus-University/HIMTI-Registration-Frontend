import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Pencil,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  useCompleteCurrentUserProfile,
  useCurrentUser,
  useSendUserEmailVerification,
  useUserRegistrationOptions,
} from "@/api/users/queries";
import {
  useMembershipStatus,
  useReregisterCurrentUser,
} from "@/api/membership/queries";
import type { UserRegistrationOptions } from "@/api/users/queries";
import {
  buildRegistrationPayload,
  type InstitutionType,
  type RegistrationData,
  type UserType,
} from "@/pages/register/payload";
import {
  clearRegistrationDraft,
  readRegistrationDraft,
  writeRegistrationDraft,
} from "@/pages/register/draft";
import axios from "axios";

const initialData: RegistrationData = {
  userType: "",
  institutionType: "",
  name: "",
  phone: "",
  personalEmail: "",
  lineId: "",
  nim: "",
  batch: "",
  binusEmail: "",
  region: "",
  major: "",
  university: "",
  institution: "",
  department: "",
  affiliation: "",
};

const steps = ["Your path", "About you", "Your institution", "Review"];
const institutionKeys: Array<keyof RegistrationData> = [
  "nim",
  "batch",
  "binusEmail",
  "region",
  "major",
  "university",
  "institution",
  "department",
  "affiliation",
];

type VerificationNotice = {
  type: "success" | "info" | "error";
  message: string;
} | null;

function Field({
  label,
  name,
  value,
  onChange,
  required = true,
  type = "text",
  placeholder,
  readOnly = false,
}: {
  label: string;
  name: keyof RegistrationData;
  value: string;
  onChange: (name: keyof RegistrationData, value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-brand-ink">
      <span>
        {label}
        {required && (
          <span className="ml-1 text-brand-blue" aria-hidden="true">
            *
          </span>
        )}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        required={required}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(event) => onChange(name, event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-brand-blue/15 bg-white px-3 text-sm font-medium text-brand-ink outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 read-only:bg-slate-100 read-only:text-brand-slate"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: keyof RegistrationData;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (name: keyof RegistrationData, value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-brand-ink">
      <span>
        {label}
        <span className="ml-1 text-brand-blue" aria-hidden="true">
          *
        </span>
      </span>
      <span className="relative mt-2 block">
        <select
          name={name}
          value={value}
          required
          onChange={(event) => onChange(name, event.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-brand-blue/15 bg-white px-3 pr-9 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
        >
          <option value="">Choose one</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3 size-5 text-brand-slate" />
      </span>
    </label>
  );
}

function Choice({
  label,
  selected,
  onClick,
  disabled = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${selected ? "border-brand-blue bg-brand-pale text-brand-blue shadow-sm" : "border-brand-blue/15 bg-white hover:border-brand-blue/40"}`}
    >
      <span className="flex items-center justify-between font-bold">
        {label}
        <span
          className={`grid size-5 place-items-center rounded-full border ${selected ? "border-brand-blue bg-brand-blue text-white" : "border-brand-blue/25"}`}
        >
          {selected && <Check className="size-3" />}
        </span>
      </span>
    </button>
  );
}

export default function RegisterPage({
  reregister = false,
}: {
  reregister?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [pathNotice, setPathNotice] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationChecking, setVerificationChecking] = useState(false);
  const [verificationNotice, setVerificationNotice] =
    useState<VerificationNotice>(null);
  const [draftReady, setDraftReady] = useState(false);
  const hydratedProfile = useRef(false);
  const firstError = useRef<HTMLDivElement>(null);
  const profile = useCurrentUser();
  const options = useUserRegistrationOptions();
  const membershipStatus = useMembershipStatus();
  const completeProfile = useCompleteCurrentUserProfile();
  const reregisterProfile = useReregisterCurrentUser();
  const sendVerification = useSendUserEmailVerification();
  const saveProfile = reregister ? reregisterProfile : completeProfile;
  const membershipPeriod = reregister
    ? membershipStatus.data?.availablePeriod
    : membershipStatus.data?.activePeriod;
  const draftContext = useMemo(
    () =>
      profile.data
        ? {
            userId: profile.data.id,
            mode: reregister ? ("reregister" as const) : ("register" as const),
            membershipPeriodId: membershipPeriod?.id ?? null,
          }
        : null,
    [membershipPeriod?.id, profile.data, reregister],
  );

  useEffect(() => {
    const user = profile.data;
    if (
      !user ||
      !draftContext ||
      membershipStatus.isPending ||
      (reregister && !options.data)
    )
      return;
    if (!hydratedProfile.current) {
      hydratedProfile.current = true;
      const profileData: RegistrationData = {
        userType:
          user.memberType === "STUDENT"
            ? "Student"
            : user.memberType === "LECTURER"
              ? "Lecturer"
              : user.memberType === "OTHER"
                ? "Other"
                : "",
        institutionType:
          user.institutionType === "BINUS"
            ? "BINUS"
            : user.institutionType === "NON_BINUS"
              ? "Non-BINUS"
              : "",
        name: user.name,
        personalEmail: user.email,
        phone: user.phoneNumber ?? "",
        lineId: user.lineId ?? "",
        nim: user.nim ?? "",
        batch: user.graduateBatch ?? "",
        binusEmail: user.outlookEmail ?? "",
        region:
          !reregister ||
          options.data?.binusRegions.some(
            (region) => region.id === user.regionId,
          )
            ? (user.regionId ?? "")
            : "",
        major:
          user.institutionType === "BINUS"
            ? !reregister ||
              options.data?.studyPrograms.some(
                (program) => program.id === user.studyProgramId,
              )
              ? (user.studyProgramId ?? "")
              : ""
            : (user.studyProgramName ?? ""),
        university: user.university?.name ?? user.universityName ?? "",
        institution: user.universityName ?? user.university?.name ?? "",
        department: user.department ?? "",
        affiliation: user.affiliation ?? "",
      };
      const draft = readRegistrationDraft(draftContext);
      const restoredData = draft
        ? { ...profileData, ...draft.data, personalEmail: user.email }
        : profileData;

      if (draft && restoredData.institutionType === "BINUS" && options.data) {
        if (
          restoredData.region &&
          !options.data.binusRegions.some(
            (region) => region.id === restoredData.region,
          )
        )
          restoredData.region = "";
        if (
          restoredData.userType === "Student" &&
          restoredData.major &&
          !options.data.studyPrograms.some(
            (program) => program.id === restoredData.major,
          )
        )
          restoredData.major = "";
      }

      setData(restoredData);
      setStep(draft?.step ?? 0);
      setVerificationSent(
        Boolean(
          draft?.verificationSentFor &&
          draft.verificationSentFor.toLowerCase() ===
            restoredData.binusEmail.toLowerCase(),
        ),
      );
      setEmailVerified(
        Boolean(
          user.outlookEmailVerified &&
          user.outlookEmail?.toLowerCase() ===
            restoredData.binusEmail.toLowerCase(),
        ),
      );
      setDraftReady(true);
    }
  }, [
    draftContext,
    membershipStatus.isPending,
    options.data,
    profile.data,
    reregister,
  ]);

  useEffect(() => {
    if (!draftReady || !draftContext || submitted) return;
    writeRegistrationDraft(draftContext, {
      step,
      data,
      verificationSentFor: verificationSent ? data.binusEmail : null,
    });
  }, [data, draftContext, draftReady, step, submitted, verificationSent]);

  useEffect(() => {
    if (errors.length) firstError.current?.focus();
  }, [errors]);
  const resetVerification = () => {
    setVerificationSent(false);
    setEmailVerified(false);
    setVerificationNotice(null);
  };
  const update = (name: keyof RegistrationData, value: string) => {
    setData((current) => ({ ...current, [name]: value }));
    if (name === "binusEmail") resetVerification();
    setErrors([]);
  };

  const sendVerificationLink = () => {
    setVerificationNotice(null);
    sendVerification.mutate(data.binusEmail, {
      onSuccess: () => {
        setVerificationSent(true);
        setVerificationNotice({
          type: "info",
          message: `A new verification link was sent to ${data.binusEmail}.`,
        });
      },
      onError: () =>
        setVerificationNotice({
          type: "error",
          message:
            "We could not send the verification link. Check your connection and try again.",
        }),
    });
  };

  const checkVerificationStatus = async () => {
    setVerificationChecking(true);
    setVerificationNotice(null);
    try {
      const { data: user } = await profile.refetch({ throwOnError: true });
      const verified = Boolean(
        user?.outlookEmailVerified &&
        user.outlookEmail?.toLowerCase() === data.binusEmail.toLowerCase(),
      );
      setEmailVerified(verified);
      setVerificationNotice({
        type: verified ? "success" : "info",
        message: verified
          ? "Your BINUS email has been verified."
          : "Your BINUS email has not been verified yet. Open the latest verification link, then check again.",
      });
    } catch {
      setVerificationNotice({
        type: "error",
        message:
          "We could not check your verification status. Check your connection and try again.",
      });
    } finally {
      setVerificationChecking(false);
    }
  };
  const changePath = (
    name: "userType" | "institutionType",
    value: UserType | InstitutionType,
  ) => {
    setData((current) => {
      const changed = Boolean(current[name]) && current[name] !== value;
      if (!changed) return { ...current, [name]: value };
      const next = { ...current, [name]: value };
      institutionKeys.forEach((key) => {
        next[key] = "";
      });
      setPathNotice(
        "Your institution details were cleared because your registration path changed.",
      );
      resetVerification();
      return next;
    });
    setErrors([]);
  };

  const verificationPanel = () => (
    <div
      className="rounded-2xl border border-brand-blue/15 bg-brand-pale/40 p-4 md:col-span-2"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-brand-navy">
            Verify your BINUS email
          </p>
          <p className="mt-1 text-xs leading-5 text-brand-slate">
            We use this to confirm your BINUS affiliation.
          </p>
        </div>
        {emailVerified && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
            <Check className="size-3" /> Verified
          </span>
        )}
      </div>
      {!emailVerified && (
        <>
          {!verificationSent ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4 min-h-11 w-full bg-white sm:w-auto"
              disabled={!data.binusEmail || sendVerification.isPending}
              onClick={sendVerificationLink}
            >
              Send verification link
            </Button>
          ) : (
            <div className="mt-4">
              <p className="break-words text-xs leading-5 text-brand-slate">
                A verification link was sent to{" "}
                <strong>{data.binusEmail}</strong>. Open the email and click the
                link, then return here.
              </p>
              <p className="mt-2 text-xs text-brand-slate">
                After opening the link, check the verification status here.
              </p>
              <Button
                type="button"
                className="mt-4 min-h-11 w-full sm:w-auto"
                disabled={verificationChecking}
                onClick={() => void checkVerificationStatus()}
              >
                {verificationChecking
                  ? "Checking..."
                  : "Check verification status"}
              </Button>
              <button
                type="button"
                className="mt-3 block min-h-11 w-full rounded-lg text-sm font-semibold text-brand-blue focus:outline-none focus:ring-2 focus:ring-ring sm:w-auto sm:px-2"
                disabled={sendVerification.isPending}
                onClick={sendVerificationLink}
              >
                {sendVerification.isPending
                  ? "Sending..."
                  : "Resend verification link"}
              </button>
            </div>
          )}
        </>
      )}
      {verificationNotice && (
        <p
          className={`mt-3 text-xs leading-5 ${
            verificationNotice.type === "success"
              ? "text-emerald-700"
              : verificationNotice.type === "error"
                ? "text-red-700"
                : "text-brand-slate"
          }`}
        >
          {verificationNotice.message}
        </p>
      )}
    </div>
  );

  const institutionFields = () => {
    if (data.userType === "Student" && data.institutionType === "BINUS")
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="NIM" name="nim" value={data.nim} onChange={update} />
          <Field
            label="BINUSian batch"
            name="batch"
            value={data.batch}
            onChange={update}
            placeholder="e.g. 28"
          />
          <Field
            label="BINUS email"
            name="binusEmail"
            value={data.binusEmail}
            onChange={update}
            type="email"
            placeholder="name@binus.ac.id"
          />
          {verificationPanel()}
          <SelectField
            label="BINUS region"
            name="region"
            value={data.region}
            options={(options.data?.binusRegions ?? []).map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            onChange={update}
          />
          <SelectField
            label="BINUS major"
            name="major"
            value={data.major}
            options={(options.data?.studyPrograms ?? []).map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            onChange={update}
          />
        </div>
      );
    if (data.userType === "Student")
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="University"
            name="university"
            value={data.university}
            onChange={update}
          />
          <Field
            label="Student ID / NIM"
            name="nim"
            value={data.nim}
            onChange={update}
          />
          <Field
            label="Major"
            name="major"
            value={data.major}
            onChange={update}
          />
        </div>
      );
    if (data.institutionType === "BINUS")
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="BINUS email"
            name="binusEmail"
            value={data.binusEmail}
            onChange={update}
            type="email"
            placeholder="name@binus.ac.id"
          />
          {verificationPanel()}
          <SelectField
            label="BINUS region"
            name="region"
            value={data.region}
            options={(options.data?.binusRegions ?? []).map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            onChange={update}
          />
          <Field
            label={
              data.userType === "Lecturer"
                ? "Department / program"
                : "Affiliation / role"
            }
            name={data.userType === "Lecturer" ? "department" : "affiliation"}
            value={
              data.userType === "Lecturer" ? data.department : data.affiliation
            }
            onChange={update}
          />
        </div>
      );
    return (
      <div className="grid gap-4">
        <Field
          label={
            data.userType === "Lecturer"
              ? "University / institution"
              : "Institution / organization"
          }
          name={data.userType === "Lecturer" ? "university" : "institution"}
          value={
            data.userType === "Lecturer" ? data.university : data.institution
          }
          onChange={update}
          placeholder="Enter Independent if needed"
        />
        <Field
          label={
            data.userType === "Lecturer"
              ? "Department / program"
              : "Affiliation / role"
          }
          name={data.userType === "Lecturer" ? "department" : "affiliation"}
          value={
            data.userType === "Lecturer" ? data.department : data.affiliation
          }
          onChange={update}
        />
      </div>
    );
  };

  const validate = () => {
    const required: Array<[keyof RegistrationData, string]> =
      step === 0
        ? [
            ["userType", "Choose a user type"],
            ["institutionType", "Choose an institution type"],
          ]
        : step === 1
          ? [
              ["name", "Enter your full name"],
              ["phone", "Enter your phone number"],
              ["personalEmail", "Your Google email is unavailable"],
            ]
          : [];
    const missing = required
      .filter(([key]) => !data[key])
      .map(([, message]) => message);
    if (step === 0 && !membershipPeriod) {
      missing.push(
        membershipStatus.isPending
          ? "Membership period is still loading"
          : "No active membership period is available",
      );
    }
    if (step === 2 && (!data.userType || !data.institutionType))
      return ["Choose your registration path first"];
    if (step === 2) {
      const values = institutionFieldsRequired();
      missing.push(
        ...values.filter(([key]) => !data[key]).map(([, message]) => message),
      );
      if (data.institutionType === "BINUS" && !emailVerified)
        missing.push("Verify your BINUS email");
    }
    return missing;
  };
  const institutionFieldsRequired = (): Array<
    [keyof RegistrationData, string]
  > => {
    if (data.userType === "Student" && data.institutionType === "BINUS")
      return [
        ["nim", "Enter your NIM"],
        ["batch", "Enter your BINUSian batch"],
        ["binusEmail", "Enter your BINUS email"],
        ["region", "Choose your BINUS region"],
        ["major", "Enter your BINUS major"],
      ];
    if (data.userType === "Student")
      return [
        ["university", "Enter your university"],
        ["nim", "Enter your student ID / NIM"],
        ["major", "Enter your major"],
      ];
    if (data.institutionType === "BINUS")
      return [
        ["binusEmail", "Enter your BINUS email"],
        ["region", "Choose your BINUS region"],
        [
          data.userType === "Lecturer" ? "department" : "affiliation",
          data.userType === "Lecturer"
            ? "Enter your department / program"
            : "Enter your affiliation / role",
        ],
      ];
    return [
      [
        data.userType === "Lecturer" ? "university" : "institution",
        data.userType === "Lecturer"
          ? "Enter your university / institution"
          : "Enter your institution / organization",
      ],
      [
        data.userType === "Lecturer" ? "department" : "affiliation",
        data.userType === "Lecturer"
          ? "Enter your department / program"
          : "Enter your affiliation / role",
      ],
    ];
  };
  const next = () => {
    const nextErrors = validate();
    if (nextErrors.length) {
      setErrors(nextErrors);
      return;
    }
    setStep((current) => Math.min(current + 1, 3));
  };
  const submit = () => {
    setErrors([]);
    if (!options.data) {
      setErrors(["Registration options could not be loaded"]);
      return;
    }
    if (
      data.institutionType === "BINUS" &&
      !options.data.universities.some((university) =>
        university.name.toLowerCase().includes("binus"),
      )
    ) {
      setErrors(["BINUS University is unavailable"]);
      return;
    }
    saveProfile.mutate(buildRegistrationPayload(data, options.data), {
      onSuccess: () => {
        if (draftContext) clearRegistrationDraft(draftContext);
        setSubmitted(true);
      },
      onError: (error) => {
        const body = axios.isAxiosError(error) ? error.response?.data : null;
        const registrationError = body?.errors?.registration;
        const fieldErrors =
          body?.errors && typeof body.errors === "object"
            ? Object.values(body.errors).flatMap((value) =>
                typeof value === "object" && value && "_errors" in value
                  ? ((value as { _errors?: string[] })._errors ?? [])
                  : [],
              )
            : [];
        setErrors([
          registrationError ||
            fieldErrors[0] ||
            body?.msg ||
            "Registration could not be saved",
        ]);
      },
    });
  };

  if (submitted)
    return (
      <div className="min-h-screen bg-background px-4 py-12">
        <div className="registration-complete mx-auto max-w-xl rounded-3xl border border-white bg-white p-8 text-center shadow-xl sm:p-12">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-pale text-brand-blue">
            <Send />
          </span>
          <p className="section-label mt-6">
            {reregister ? "Reregistration complete" : "Registration complete"}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-brand-navy">
            {reregister ? "Membership renewed." : "Welcome to HIMTI."}
          </h1>
          <p className="mt-4 text-sm leading-6 text-brand-slate">
            {reregister
              ? "Your membership details have been submitted for the new member period."
              : "Your registration is complete. You can now access your member information and community contacts."}
          </p>
          <Button asChild className="mt-8">
            <Link to="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      </div>
    );

  return (
    <main className="min-h-screen bg-background px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 rounded-lg text-sm font-bold text-brand-navy focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-brand-navy p-1">
              <img src="/himti-icon.svg" alt="" />
            </span>
            <span className="truncate">
              HIMTI {reregister ? "reregistration" : "registration"}
            </span>
          </Link>
          <Link
            to={reregister ? "/dashboard" : "/"}
            className="shrink-0 rounded-lg px-2 py-2 text-xs font-semibold text-brand-blue focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm"
          >
            {reregister ? "Dashboard" : "Back home"}
          </Link>
        </div>
        <section className="rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_24px_70px_-35px_rgba(0,33,79,0.45)] sm:rounded-3xl sm:p-8">
          <div>
            <p className="section-label">
              {reregister ? "Renew your membership" : "Join the community"}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-brand-navy sm:text-3xl">
              {reregister
                ? "Confirm your member details"
                : "Tell us about yourself"}
            </h1>
            {reregister ? (
              <p className="mt-3 text-sm text-brand-slate">
                Review the information prefilled from your current profile.
              </p>
            ) : (
              <p className="mt-3 text-sm text-brand-slate">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-brand-blue underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  Log in
                </Link>
              </p>
            )}
            <p className="mt-4 text-sm font-bold text-brand-blue sm:hidden">
              Step {step + 1} of 4{" "}
              <span className="text-brand-slate">· {steps[step]}</span>
            </p>
          </div>
          <div
            className="mt-5"
            aria-label={`Registration progress, step ${step + 1} of 4: ${steps[step]}`}
          >
            <div className="flex gap-1.5">
              {steps.map((label, index) => (
                <div
                  key={label}
                  className="flex-1"
                  aria-current={index === step ? "step" : undefined}
                >
                  <div
                    className={`h-1.5 rounded-full transition-colors ${index <= step ? "bg-brand-blue" : "bg-brand-blue/10"}`}
                  />
                  <span
                    className={`mt-2 hidden text-[11px] font-semibold sm:block ${index === step ? "text-brand-blue" : "text-brand-slate"}`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 hidden text-right text-xs font-bold text-brand-blue sm:block">
              Step {step + 1} of 4
            </p>
          </div>
          {pathNotice && (
            <div
              role="status"
              className="mt-6 rounded-xl border border-brand-blue/15 bg-brand-pale px-4 py-3 text-sm font-medium text-brand-navy"
            >
              {pathNotice}
            </div>
          )}
          {errors.length > 0 && (
            <div
              ref={firstError}
              tabIndex={-1}
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            >
              {errors[0]}. Check the highlighted fields before continuing.
            </div>
          )}
          <div className="mt-7">
            {step === 0 && (
              <div>
                <h2 className="text-lg font-bold text-brand-navy">
                  Choose your path
                </h2>
                <p className="mt-1 text-sm text-brand-slate">
                  This helps us ask only for details that apply to you.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {(["Student", "Lecturer", "Other"] as UserType[]).map(
                    (value) => (
                      <Choice
                        key={value}
                        label={value}
                        selected={data.userType === value}
                        onClick={() => changePath("userType", value)}
                      />
                    ),
                  )}
                </div>
                <h2 className="mt-8 text-lg font-bold text-brand-navy">
                  Your institution
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Choice
                    label="BINUS"
                    selected={data.institutionType === "BINUS"}
                    onClick={() => changePath("institutionType", "BINUS")}
                  />
                  <Choice
                    label="Non-BINUS"
                    selected={data.institutionType === "Non-BINUS"}
                    onClick={() => changePath("institutionType", "Non-BINUS")}
                  />
                </div>
                <label className="mt-5 block text-sm font-semibold text-brand-ink">
                  <span>Membership period</span>
                  <input
                    value={
                      membershipStatus.isPending
                        ? "Loading..."
                        : (membershipPeriod?.label ?? "No active period")
                    }
                    readOnly
                    aria-describedby="membership-period-help"
                    className="mt-2 block h-11 w-full rounded-xl border border-brand-blue/15 bg-slate-100 px-3 text-sm font-medium text-brand-slate outline-none sm:max-w-sm"
                  />
                </label>
                <p
                  id="membership-period-help"
                  className="mt-2 text-xs leading-5 text-brand-slate"
                >
                  Assigned automatically and cannot be changed here.
                </p>
                {membershipStatus.isError && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    onClick={() => void membershipStatus.refetch()}
                  >
                    Retry membership period
                  </Button>
                )}
              </div>
            )}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold text-brand-navy">
                  Personal information
                </h2>
                <p className="mt-1 text-sm text-brand-slate">
                  Use details you can access regularly.
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Field
                    label="Full name"
                    name="name"
                    value={data.name}
                    onChange={update}
                  />
                  <Field
                    label="Phone number"
                    name="phone"
                    value={data.phone}
                    onChange={update}
                    type="tel"
                  />
                  <Field
                    label="Google email"
                    name="personalEmail"
                    value={data.personalEmail}
                    onChange={update}
                    type="email"
                    readOnly
                  />
                  <Field
                    label="LINE ID"
                    name="lineId"
                    value={data.lineId}
                    onChange={update}
                  />
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-bold text-brand-navy">
                  Institution information
                </h2>
                <p className="mt-1 text-sm text-brand-slate">
                  Based on your path: {data.userType}, {data.institutionType}.
                </p>
                <div className="mt-5">{institutionFields()}</div>
              </div>
            )}
            {step === 3 && (
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-brand-navy">
                      Review your registration
                    </h2>
                    <p className="mt-1 text-sm text-brand-slate">
                      Everything look right? You can still edit any section.
                    </p>
                  </div>
                </div>
                <ReviewSection
                  title="Your path"
                  items={[
                    ["User type", data.userType],
                    ["Institution", data.institutionType],
                    [
                      "Membership period",
                      membershipPeriod?.label ?? "Unavailable",
                    ],
                  ]}
                  onEdit={() => setStep(0)}
                />
                <ReviewSection
                  title="About you"
                  items={[
                    ["Full name", data.name],
                    ["Phone", data.phone],
                    ["Google email", data.personalEmail],
                    ["LINE ID", data.lineId || "Not provided"],
                  ]}
                  onEdit={() => setStep(1)}
                />
                <ReviewSection
                  title="Institution"
                  items={institutionReviewItems(data, options.data)}
                  onEdit={() => setStep(2)}
                />
              </div>
            )}
          </div>
          <div className="mt-8 flex items-center gap-2 border-t border-brand-blue/10 pt-5">
            <Button
              type="button"
              variant="outline"
              className={`min-h-11 px-3 sm:px-5 ${step === 0 ? "invisible" : ""}`}
              onClick={() => {
                setErrors([]);
                setStep((current) => current - 1);
              }}
            >
              <ArrowLeft className="mr-1 size-4 sm:mr-2" /> Back
            </Button>
            {step < 3 ? (
              <Button
                type="button"
                className="min-h-11 flex-1 sm:ml-auto sm:flex-none"
                onClick={next}
              >
                Continue <ArrowRight className="ml-2 size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                className="min-h-11 flex-1 sm:ml-auto sm:flex-none"
                onClick={submit}
                disabled={saveProfile.isPending}
              >
                {saveProfile.isPending
                  ? "Saving..."
                  : reregister
                    ? "Submit reregistration"
                    : "Submit registration"}{" "}
                <Send className="ml-2 size-4" />
              </Button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function institutionReviewItems(
  data: RegistrationData,
  options?: UserRegistrationOptions,
): [string, string][] {
  const optionName = (
    items: UserRegistrationOptions["universities"],
    id: string,
  ) => items.find((item) => item.id === id)?.name ?? "Unavailable";

  if (data.institutionType === "BINUS") {
    const items: [string, string][] = [
      [
        "University",
        options?.universities.find((item) =>
          item.name.toLowerCase().includes("binus"),
        )?.name ?? "BINUS",
      ],
      ["BINUS region", optionName(options?.binusRegions ?? [], data.region)],
      ["BINUS email", data.binusEmail],
    ];
    if (data.userType === "Student")
      return [
        ...items,
        ["NIM", data.nim],
        ["BINUSian batch", data.batch],
        ["BINUS major", optionName(options?.studyPrograms ?? [], data.major)],
      ];
    return [
      ...items,
      data.userType === "Lecturer"
        ? ["Department / program", data.department]
        : ["Affiliation / role", data.affiliation],
    ];
  }

  if (data.userType === "Student")
    return [
      ["University", data.university],
      ["Student ID / NIM", data.nim],
      ["Major", data.major],
    ];
  if (data.userType === "Lecturer")
    return [
      ["University / institution", data.university],
      ["Department / program", data.department],
    ];
  return [
    ["Institution / organization", data.institution],
    ["Affiliation / role", data.affiliation],
  ];
}

function ReviewSection({
  title,
  items,
  onEdit,
}: {
  title: string;
  items: [string, string][];
  onEdit: () => void;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-brand-blue/10 bg-brand-pale/40 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-brand-navy">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-brand-blue focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <Pencil className="size-3" /> Edit
        </button>
      </div>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-brand-slate">{label}</dt>
            <dd className="font-semibold text-brand-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
