import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Pencil,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCompleteProfile, useProfile, useRegistrationOptions, useSendVerification } from "@/api/registration";
import axios from "axios";

type UserType = "Student" | "Lecturer" | "Other";
type InstitutionType = "BINUS" | "Non-BINUS";
type RegistrationData = {
  userType: UserType | "";
  institutionType: InstitutionType | "";
  name: string;
  phone: string;
  personalEmail: string;
  lineId: string;
  nim: string;
  batch: string;
  binusEmail: string;
  region: string;
  major: string;
  university: string;
  institution: string;
  department: string;
  affiliation: string;
};

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

function Field({
  label,
  name,
  value,
  onChange,
  required = true,
  type = "text",
  placeholder,
}: {
  label: string;
  name: keyof RegistrationData;
  value: string;
  onChange: (name: keyof RegistrationData, value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        onChange={(event) => onChange(name, event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-brand-blue/15 bg-white px-3 text-sm font-medium text-brand-ink outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
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
            <option key={option.value} value={option.value}>{option.label}</option>
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

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [pathNotice, setPathNotice] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const hydratedProfile = useRef(false);
  const firstError = useRef<HTMLDivElement>(null);
  const profile = useProfile();
  const options = useRegistrationOptions();
  const completeProfile = useCompleteProfile();
  const sendVerification = useSendVerification();
  const pathLocked = Boolean(profile.data?.registrationCompleted);

  useEffect(() => {
    const user = profile.data;
    if (!user) return;
     if (!hydratedProfile.current) {
       hydratedProfile.current = true;
       setData((current) => ({ ...current, name: user.name, personalEmail: user.email, phone: user.phoneNumber ?? "", lineId: user.lineId ?? "", nim: user.nim ?? "", batch: user.graduateBatch ?? "", binusEmail: user.outlookEmail ?? "", region: user.regionId ?? "", major: user.studyProgramId ?? "", university: user.university?.name ?? "", institution: user.university?.name ?? "" }));
       setEmailVerified(user.outlookEmailVerified);
     }
  }, [profile.data]);

  useEffect(() => {
    if (errors.length) firstError.current?.focus();
  }, [errors]);
  const resetVerification = () => {
    setVerificationSent(false);
    setEmailVerified(false);
  };
  const update = (name: keyof RegistrationData, value: string) => {
    setData((current) => ({ ...current, [name]: value }));
    if (name === "binusEmail") resetVerification();
    setErrors([]);
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
              onClick={() => sendVerification.mutate(data.binusEmail, { onSuccess: () => setVerificationSent(true) })}
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
                  onClick={() => void profile.refetch().then(({ data: user }) => setEmailVerified(Boolean(user?.outlookEmailVerified && user.outlookEmail?.toLowerCase() === data.binusEmail.toLowerCase())))}
              >
                Check verification status
              </Button>
              <button
                type="button"
                className="mt-3 block min-h-11 w-full rounded-lg text-sm font-semibold text-brand-blue focus:outline-none focus:ring-2 focus:ring-ring sm:w-auto sm:px-2"
                onClick={() => sendVerification.mutate(data.binusEmail)}
              >
                Resend verification link
              </button>
            </div>
          )}
        </>
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
            options={(options.data?.binusRegions ?? []).map((item) => ({ value: item.id, label: item.name }))}
            onChange={update}
          />
          <SelectField
            label="BINUS major"
            name="major"
            value={data.major}
            options={(options.data?.studyPrograms ?? []).map((item) => ({ value: item.id, label: item.name }))}
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
            options={(options.data?.binusRegions ?? []).map((item) => ({ value: item.id, label: item.name }))}
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
              ["personalEmail", "Enter your personal email"],
            ]
          : [];
    const missing = required
      .filter(([key]) => !data[key])
      .map(([, message]) => message);
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
     completeProfile.mutate({ name: data.name, nim: data.nim || undefined, universityId: options.data?.universities.find((item) => item.name === "BINUS University")?.id ?? "", studyProgramId: data.major, regionId: data.region || undefined, graduateBatch: data.batch, phoneNumber: data.phone, lineId: data.lineId, outlookEmail: data.binusEmail || undefined }, {
      onSuccess: () => setSubmitted(true),
      onError: (error) => {
        const body = axios.isAxiosError(error) ? error.response?.data : null;
        const registrationError = body?.errors?.registration;
        const fieldErrors = body?.errors && typeof body.errors === "object" ? Object.values(body.errors).flatMap((value) => typeof value === "object" && value && "_errors" in value ? (value as { _errors?: string[] })._errors ?? [] : []) : [];
        setErrors([registrationError || fieldErrors[0] || body?.msg || "Registration could not be saved"]);
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
          <p className="section-label mt-6">Registration complete</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-brand-navy">
            Welcome to HIMTI.
          </h1>
          <p className="mt-4 text-sm leading-6 text-brand-slate">
            Your registration is complete. You can now access your member
            information and community contacts.
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
            <span className="truncate">HIMTI registration</span>
          </Link>
          <Link
            to="/"
            className="shrink-0 rounded-lg px-2 py-2 text-xs font-semibold text-brand-blue focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm"
          >
            Back home
          </Link>
        </div>
        <section className="rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_24px_70px_-35px_rgba(0,33,79,0.45)] sm:rounded-3xl sm:p-8">
          <div>
            <p className="section-label">Join the community</p>
            <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-brand-navy sm:text-3xl">
              Tell us about yourself
            </h1>
            <p className="mt-3 text-sm text-brand-slate">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-brand-blue underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring">
                Log in
              </Link>
            </p>
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
                        disabled={pathLocked}
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
                    disabled={pathLocked}
                  />
                  <Choice
                    label="Non-BINUS"
                    selected={data.institutionType === "Non-BINUS"}
                    onClick={() => changePath("institutionType", "Non-BINUS")}
                    disabled={pathLocked}
                  />
                </div>
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
                    label="Personal email"
                    name="personalEmail"
                    value={data.personalEmail}
                    onChange={update}
                    type="email"
                  />
                  <Field
                    label="LINE ID"
                    name="lineId"
                    value={data.lineId}
                    onChange={update}
                    required={false}
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
                  ]}
                  onEdit={() => setStep(0)}
                />
                <ReviewSection
                  title="About you"
                  items={[
                    ["Full name", data.name],
                    ["Phone", data.phone],
                    ["Personal email", data.personalEmail],
                    ["LINE ID", data.lineId || "Not provided"],
                  ]}
                  onEdit={() => setStep(1)}
                />
                <ReviewSection
                  title="Institution"
                  items={Object.entries(data)
                    .filter(
                      ([key, value]) =>
                        value &&
                        ![
                          "userType",
                          "institutionType",
                          "name",
                          "phone",
                          "personalEmail",
                          "lineId",
                        ].includes(key),
                    )
                    .map(
                      ([key, value]) =>
                        [key.replace(/([A-Z])/g, " $1"), value] as [
                          string,
                          string,
                        ],
                    )}
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
                disabled={completeProfile.isPending}
              >
                {completeProfile.isPending ? "Saving..." : "Submit registration"} <Send className="ml-2 size-4" />
              </Button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
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
