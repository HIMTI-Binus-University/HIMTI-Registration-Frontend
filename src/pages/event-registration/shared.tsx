import type { ChangeEvent } from "react";
import type { RegistrationQuestion } from "./answers";

const inputClass =
  "mt-2 min-h-11 w-full rounded-xl border border-brand-blue/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 disabled:bg-slate-100";

export function PersonalInformation({
  values,
  missingFields = [],
  title = "Personal Information",
  description = "This information is read-only for event registration.",
}: {
  values: Record<string, string | null | undefined>;
  missingFields?: string[];
  title?: string;
  description?: string;
}) {
  const labels: Record<string, string> = {
    name: "Name",
    email: "Email",
    outlookEmail: "BINUS email",
    nim: "NIM",
    university: "University",
    studyProgram: "Study program",
    region: "Region",
    phoneNumber: "WhatsApp number",
  };
  return (
    <section className="rounded-2xl border border-brand-blue/10 bg-white p-6">
      <h2 className="text-xl font-bold text-brand-navy">{title}</h2>
      <p className="mt-1 text-sm text-brand-slate">{description}</p>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {Object.entries(labels).map(([key, label]) => (
          <div key={key}>
            <dt className="text-xs font-bold uppercase tracking-wider text-brand-slate">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">
              {values[key] || <span className="text-red-700">Missing</span>}
            </dd>
          </div>
        ))}
      </dl>
      {missingFields.length > 0 && (
        <p className="mt-4 text-sm text-red-700">
          Missing profile fields: {missingFields.join(", ")}.
        </p>
      )}
    </section>
  );
}

export function QuestionField({
  question,
  value,
  disabled,
  error,
  onChange,
}: {
  question: RegistrationQuestion;
  value: string | string[] | undefined;
  disabled: boolean;
  error?: string;
  onChange: (value: string | string[]) => void;
}) {
  const scalar = Array.isArray(value) ? "" : (value ?? "");
  const setScalar = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => onChange(event.target.value);
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="text-sm font-bold text-brand-navy">
        {question.label}{" "}
        {question.isRequired && <span className="text-red-700">*</span>}
      </legend>
      {question.type === "FILE" ? (
        <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          File questions are not supported in this registration phase.
        </p>
      ) : question.type === "TEXTAREA" ? (
        <textarea
          aria-label={question.label}
          aria-invalid={Boolean(error)}
          className={`${inputClass} min-h-28`}
          value={scalar}
          onChange={setScalar}
        />
      ) : question.type === "SELECT" ? (
        <select
          aria-label={question.label}
          aria-invalid={Boolean(error)}
          className={inputClass}
          value={scalar}
          onChange={setScalar}
        >
          <option value="">Select an option</option>
          {question.options.map((option) => (
            <option key={option.id} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : question.type === "RADIO" || question.type === "CHECKBOX" ? (
        <div className="mt-2 grid gap-2">
          {question.options.map((option) => {
            const checked =
              question.type === "CHECKBOX"
                ? (Array.isArray(value) ? value : []).includes(option.value)
                : scalar === option.value;
            return (
              <label
                key={option.id}
                className="flex min-h-11 items-center gap-3 rounded-xl border border-brand-blue/10 px-3 text-sm"
              >
                <input
                  type={question.type.toLowerCase()}
                  name={question.id}
                  value={option.value}
                  checked={checked}
                  onChange={() =>
                    onChange(
                      question.type === "CHECKBOX"
                        ? checked
                          ? (value as string[]).filter(
                              (item) => item !== option.value,
                            )
                          : [
                              ...(Array.isArray(value) ? value : []),
                              option.value,
                            ]
                        : option.value,
                    )
                  }
                />
                {option.label}
              </label>
            );
          })}
        </div>
      ) : (
        <input
          aria-label={question.label}
          aria-invalid={Boolean(error)}
          className={inputClass}
          type={question.type.toLowerCase()}
          value={scalar}
          onChange={setScalar}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </fieldset>
  );
}
