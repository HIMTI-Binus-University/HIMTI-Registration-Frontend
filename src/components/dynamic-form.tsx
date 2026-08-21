import { useContext, useEffect } from "react";
import { UNSAFE_DataRouterContext, useBlocker } from "react-router-dom";
import type { RegistrationDetail } from "@/api/registrations/queries";
import {
  patternGuidance,
  sortedForms,
  type Answers,
} from "@/pages/event-registration/form";

export type DynamicQuestion =
  RegistrationDetail["forms"][number]["questions"][number];

export function DynamicQuestionField({
  question,
  value,
  error,
  update,
  readOnly = false,
}: {
  question: DynamicQuestion;
  value?: string | string[];
  error?: string;
  update: (id: string, value: string | string[]) => void;
  readOnly?: boolean;
}) {
  const id = `question-${question.id}`;
  const helpId = `${id}-help`;
  const formatId = `${id}-format`;
  const errorId = `${id}-error`;
  const formatHelp = patternGuidance(question);
  const describedBy =
    [
      question.helpText ? helpId : "",
      formatHelp ? formatId : "",
      error ? errorId : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  const common =
    "mt-2 min-h-11 w-full rounded-lg border border-brand-blue/20 bg-white px-3 py-2 text-brand-ink disabled:bg-slate-100 disabled:text-brand-slate focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20";
  const options = question.options;
  let field: React.ReactNode;
  if (question.fieldType === "TEXTAREA")
    field = (
      <textarea
        id={id}
        className={`${common} min-h-28`}
        minLength={question.validation.minLength}
        maxLength={question.validation.maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        value={String(value ?? "")}
        disabled={readOnly}
        onChange={(event) => update(question.id, event.target.value)}
      />
    );
  else if (["TEXT", "NUMBER", "DATE"].includes(question.fieldType))
    field = (
      <input
        id={id}
        type={question.fieldType.toLowerCase()}
        className={common}
        min={
          question.fieldType === "NUMBER"
            ? question.validation.min
            : question.fieldType === "DATE"
              ? question.validation.minDate
              : undefined
        }
        max={
          question.fieldType === "NUMBER"
            ? question.validation.max
            : question.fieldType === "DATE"
              ? question.validation.maxDate
              : undefined
        }
        minLength={
          question.fieldType === "TEXT"
            ? question.validation.minLength
            : undefined
        }
        maxLength={
          question.fieldType === "TEXT"
            ? question.validation.maxLength
            : undefined
        }
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        value={String(value ?? "")}
        disabled={readOnly}
        onChange={(event) => update(question.id, event.target.value)}
      />
    );
  else if (question.fieldType === "SELECT")
    field = (
      <select
        id={id}
        className={common}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        value={String(value ?? "")}
        disabled={readOnly}
        onChange={(event) => update(question.id, event.target.value)}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    );
  else if (question.fieldType === "RADIO" || question.fieldType === "CHECKBOX")
    field = (
      <fieldset
        className="mt-2 grid gap-2"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        disabled={readOnly}
      >
        <legend className="sr-only">{question.label}</legend>
        {options.map((option) => {
          const checked = Array.isArray(value)
            ? value.includes(option.id)
            : value === option.id;
          return (
            <label
              key={option.id}
              className="flex min-h-11 items-center gap-3 rounded-lg border border-brand-blue/15 px-3"
            >
              <input
                type={question.fieldType === "RADIO" ? "radio" : "checkbox"}
                name={question.id}
                checked={checked}
                onChange={() =>
                  update(
                    question.id,
                    question.fieldType === "RADIO"
                      ? option.id
                      : checked
                        ? (value as string[]).filter(
                            (item) => item !== option.id,
                          )
                        : [...(Array.isArray(value) ? value : []), option.id],
                  )
                }
              />
              {option.label}
            </label>
          );
        })}
      </fieldset>
    );
  else
    field = (
      <p
        role="alert"
        className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800"
      >
        {question.fieldType === "FILE"
          ? "File upload questions are not supported yet. This form cannot be submitted here."
          : `Unsupported question type: ${question.fieldType}`}
      </p>
    );
  return (
    <div>
      <label htmlFor={id} className="font-semibold text-brand-navy">
        {question.label}
        {question.isRequired && <span className="text-red-700"> *</span>}
      </label>
      {question.helpText && (
        <p id={helpId} className="mt-1 text-sm text-brand-slate">
          {question.helpText}
        </p>
      )}
      {formatHelp && (
        <p id={formatId} className="mt-1 text-sm text-brand-slate">
          Format: {formatHelp}
        </p>
      )}
      {field}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function DynamicAnswersReview({
  forms,
  answers,
}: {
  forms: RegistrationDetail["forms"];
  answers: Answers;
}) {
  return (
    <div className="mt-7 space-y-6">
      {sortedForms(forms).map((form) => (
        <section key={form.id}>
          <h2 className="text-xl font-bold text-brand-navy">{form.name}</h2>
          <dl className="mt-3 divide-y divide-brand-blue/10 rounded-xl border border-brand-blue/10">
            {form.questions.map((question) => {
              const raw = answers[question.id];
              const values = Array.isArray(raw) ? raw : [raw];
              const display = ["SELECT", "RADIO", "CHECKBOX"].includes(
                question.fieldType,
              )
                ? values
                    .map(
                      (id) =>
                        question.options.find((option) => option.id === id)
                          ?.label,
                    )
                    .filter(Boolean)
                    .join(", ")
                : String(raw ?? "");
              return (
                <div key={question.id} className="p-4">
                  <dt className="text-xs font-bold uppercase tracking-wide text-brand-slate">
                    {question.label}
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap text-brand-navy">
                    {display || "Not provided"}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}

export function DirtyNavigationGuard({ dirty }: { dirty: boolean }) {
  const dataRouter = useContext(UNSAFE_DataRouterContext);
  return dataRouter ? (
    <DataRouterDirtyGuard dirty={dirty} />
  ) : (
    <LegacyDirtyGuard dirty={dirty} />
  );
}

function DataRouterDirtyGuard({ dirty }: { dirty: boolean }) {
  const blocker = useBlocker(dirty);
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (confirm("Leave this page? Unsaved form changes will be lost."))
      blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  return null;
}

function LegacyDirtyGuard({ dirty }: { dirty: boolean }) {
  useEffect(() => {
    if (!dirty) return;
    const click = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (
        anchor &&
        anchor.origin === location.origin &&
        !confirm("Leave this page? Unsaved form changes will be lost.")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, [dirty]);
  return null;
}
