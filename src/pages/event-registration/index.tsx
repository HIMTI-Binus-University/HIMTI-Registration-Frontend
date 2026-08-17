import { useContext, useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
  useBlocker,
  UNSAFE_DataRouterContext,
} from "react-router-dom";
import { parseApiError } from "@/api/api-error";
import axios from "axios";
import {
  useCreateRegistration,
  useRegistration,
  useRegistrationContext,
  useReplaceRegistrationResponses,
  useSubmitRegistration,
  type RegistrationDetail,
} from "@/api/registrations/queries";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { currentReturnPath, storeReturnPath } from "@/utils/return-path";
import { getSafeHttpUrl } from "@/utils/http-url";
import { createIdempotencyKey } from "@/utils/idempotency";
import { usePublicEvent } from "@/api/events/queries";
import {
  answersFromDetail,
  buildResponsePayload,
  sortedForms,
  validateAnswers,
  type Answers,
  type FormErrors,
} from "./form";

export default function EventRegistrationPage() {
  const { eventId = "", subEventId = "" } = useParams();
  const [params] = useSearchParams();
  const inviteToken = params.get("inviteToken") ?? undefined;
  const context = useRegistrationContext(subEventId, inviteToken);
  const event = usePublicEvent(eventId);
  const create = useCreateRegistration(subEventId);
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = currentReturnPath({
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  });
  const [createdId, setCreatedId] = useState<string>();

  if (event.isPending)
    return (
      <Shell>
        <State title="Checking event and activity" />
      </Shell>
    );
  if (event.isError)
    return (
      <Shell>
        <State title="Event could not be verified">
          <p>Return to the event and try again.</p>
          <Button asChild className="mt-4">
            <Link to={`/events/${encodeURIComponent(eventId)}`}>
              Back to event
            </Link>
          </Button>
        </State>
      </Shell>
    );
  if (
    event.isSuccess &&
    !event.data.subEvents.some((item) => item.id === subEventId)
  )
    return (
      <Shell>
        <State title="Activity does not belong to this event">
          <Button asChild className="mt-4">
            <Link to={`/events/${encodeURIComponent(eventId)}`}>
              Back to event
            </Link>
          </Button>
        </State>
      </Shell>
    );

  if (context.isPending)
    return (
      <Shell>
        <State title="Checking registration availability" />
      </Shell>
    );
  if (context.isError) {
    const error = parseApiError(context.error);
    const membership = error.code === "CURRENT_MEMBERSHIP_REQUIRED";
    return (
      <Shell>
        <State
          title={
            membership
              ? "HIMTI membership required"
              : "Registration unavailable"
          }
        >
          <p>{error.message}</p>
          {membership ? (
            <Button asChild className="mt-4">
              <Link to={`/register?returnTo=${encodeURIComponent(returnPath)}`}>
                Complete membership
              </Link>
            </Button>
          ) : (
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => void context.refetch()}
            >
              Try again
            </Button>
          )}
        </State>
      </Shell>
    );
  }
  const data = context.data;
  if (!data) return null;
  if (data.action === "SIGN_IN")
    return (
      <Shell>
        <State title="Sign in to continue">
          <p>Your exact place will be saved while you sign in.</p>
          <Button className="mt-5" asChild>
            <Link
              to={`/login?returnTo=${encodeURIComponent(storeReturnPath(returnPath))}`}
            >
              Sign in with Google
            </Link>
          </Button>
        </State>
      </Shell>
    );
  if (data.action === "EXTERNAL") {
    const url = getSafeHttpUrl(data.destinationUrl);
    return (
      <Shell>
        <State title="Registration continues externally">
          <p>This activity uses an external registration page.</p>
          {url && (
            <Button className="mt-5" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                Open registration <ExternalLink className="ml-2 size-4" />
              </a>
            </Button>
          )}
        </State>
      </Shell>
    );
  }
  if (data.action === "UNAVAILABLE") {
    const membership = data.code.toLowerCase().includes("member");
    return (
      <Shell>
        <State
          title={
            membership
              ? "HIMTI membership required"
              : "Registration unavailable"
          }
        >
          <p>
            {membership
              ? "Complete your HIMTI membership before registering for this internal activity."
              : "This activity cannot accept a registration right now."}
          </p>
          {membership && (
            <Button asChild className="mt-5">
              <Link to={`/register?returnTo=${encodeURIComponent(returnPath)}`}>
                Complete membership
              </Link>
            </Button>
          )}
        </State>
      </Shell>
    );
  }
  if (data.action === "VIEW_REGISTRATION" && data.registrationId) {
    navigate(`/registrations/${data.registrationId}`, { replace: true });
    return null;
  }
  if (
    (data.action === "RESUME" || createdId) &&
    (data.registrationId || createdId)
  )
    return (
      <RegistrationEditor
        registrationId={(createdId ?? data.registrationId)!}
      />
    );
  return (
    <Shell>
      <State title="Start your registration">
        <p>
          {data.package?.name ?? "Free one-seat registration"} ·{" "}
          {data.package === null || data.package.priceMinor === "0"
            ? "Free - no payment required"
            : "Paid registration is not supported yet"}
        </p>
        <Button
          className="mt-5"
          disabled={
            create.isPending ||
            (data.package !== null &&
              (data.package.priceMinor !== "0" || data.package.seatCount !== 1))
          }
          onClick={() =>
            create.mutate(
              {
                ...(data.package ? { packageId: data.package.id } : {}),
                ...(inviteToken ? { inviteToken } : {}),
              },
              { onSuccess: (registration) => setCreatedId(registration.id) },
            )
          }
        >
          {create.isPending ? "Starting..." : "Start registration"}
        </Button>
        {create.isError && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {parseApiError(create.error).message}
          </p>
        )}
      </State>
    </Shell>
  );
}

function RegistrationEditor({ registrationId }: { registrationId: string }) {
  const query = useRegistration(registrationId);
  const detail = query.data;
  const replace = useReplaceRegistrationResponses(registrationId);
  const submit = useSubmitRegistration(registrationId);
  const navigate = useNavigate();
  const idempotencyKey = useRef(createIdempotencyKey());
  const loadedRevisions = useRef("");
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [review, setReview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState("");
  const [savedPendingSubmit, setSavedPendingSubmit] = useState(false);
  const [serverChanged, setServerChanged] = useState(false);
  useEffect(() => {
    if (!detail) return;
    const revisions = detail.submissions
      .map((item) => `${item.id}:${item.revision}`)
      .join("|");
    if (
      !loadedRevisions.current ||
      (!dirty && loadedRevisions.current !== revisions)
    ) {
      setAnswers(answersFromDetail(detail));
      loadedRevisions.current = revisions;
      setServerChanged(false);
    } else if (dirty && loadedRevisions.current !== revisions) {
      setServerChanged(true);
    }
  }, [detail, dirty]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);
  if (!detail)
    return (
      <Shell>
        <State
          title={
            query.isError
              ? "Registration could not be loaded"
              : "Loading your draft"
          }
        >
          {query.isError && (
            <Button onClick={() => void query.refetch()}>Try again</Button>
          )}
        </State>
      </Shell>
    );
  const forms = sortedForms(detail.forms);
  const update = (id: string, value: string | string[]) => {
    setAnswers((old) => ({ ...old, [id]: value }));
    setErrors((old) => ({ ...old, [id]: "" }));
    setDirty(true);
    setSavedPendingSubmit(false);
    idempotencyKey.current = createIdempotencyKey();
  };
  const continueToReview = () => {
    const next = validateAnswers(forms, answers);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first)
      requestAnimationFrame(() =>
        document.getElementById(`question-${first}`)?.focus(),
      );
    else setReview(true);
  };
  const handleDomainError = (error: unknown) => {
    const parsed = parseApiError(error);
    setErrors(parsed.fieldErrors);
    const first = Object.keys(parsed.fieldErrors)[0];
    if (first) {
      setReview(false);
      requestAnimationFrame(() =>
        document.getElementById(`question-${first}`)?.focus(),
      );
    }
    if (parsed.code === "REVISION_CONFLICT")
      setNotice(
        "This draft changed on the server. Reload to discard local edits and use the latest version.",
      );
    else if (
      ["CAPACITY_EXCEEDED", "CAPACITY_FULL", "REGISTRATION_CLOSED"].includes(
        parsed.code ?? "",
      )
    )
      setNotice(
        "Registration is no longer available. Return to the event for current availability.",
      );
    else setNotice(parsed.message);
    if (!axios.isAxiosError(error) || error.response)
      idempotencyKey.current = createIdempotencyKey();
  };
  const saveDraft = async (requireComplete = false) => {
    if (requireComplete) {
      const validation = validateAnswers(forms, answers);
      if (Object.keys(validation).length) {
        setErrors(validation);
        setReview(false);
        return false;
      }
    }
    try {
      const saved = await replace.mutateAsync(
        buildResponsePayload(detail, answers),
      );
      loadedRevisions.current = saved.submissions
        .map((item) => `${item.id}:${item.revision}`)
        .join("|");
      setDirty(false);
      setNotice("Draft saved.");
      return true;
    } catch (error) {
      handleDomainError(error);
      return false;
    }
  };
  const submitRegistration = async () => {
    if (dirty && !(await saveDraft(true))) return;
    setSavedPendingSubmit(true);
    try {
      await submit.mutateAsync(idempotencyKey.current);
      setSavedPendingSubmit(false);
      navigate(`/registrations/${registrationId}`, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error) && !error.response) {
        setNotice(
          "Submission outcome is unknown. Checking the registration before retrying...",
        );
        const refreshed = await query.refetch();
        if (refreshed.data && refreshed.data.status !== "DRAFT")
          navigate(`/registrations/${registrationId}`, { replace: true });
        else
          setNotice(
            "Your draft is saved. Retry submission with the same request key.",
          );
      } else handleDomainError(error);
    }
  };
  return (
    <Shell>
      <DirtyNavigationGuard dirty={dirty} />
      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="rounded-2xl border border-brand-blue/10 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-blue">
            {review ? "Review" : "Registration form"}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">
            {detail.subEvent.name}
          </h1>
          <div aria-live="polite">
            {(notice || serverChanged) && (
              <p className="mt-4 rounded-lg bg-brand-pale p-3 text-sm text-brand-navy">
                {notice ||
                  "A newer draft was received from the server while you were editing."}{" "}
                {serverChanged && (
                  <button
                    className="font-bold underline"
                    onClick={() => {
                      setDirty(false);
                      void query.refetch();
                    }}
                  >
                    Reload server draft
                  </button>
                )}
              </p>
            )}
          </div>
          {!review ? (
            forms.map((form) => (
              <fieldset
                key={form.id}
                className="mt-8 border-t border-brand-blue/10 pt-6"
              >
                <legend className="text-xl font-bold text-brand-navy">
                  {form.name}
                </legend>
                {form.description && (
                  <p className="mt-1 text-sm text-brand-slate">
                    {form.description}
                  </p>
                )}
                <div className="mt-5 space-y-6">
                  {form.questions.map((question) => (
                    <Question
                      key={question.id}
                      question={question}
                      value={answers[question.id]}
                      error={errors[question.id]}
                      update={update}
                    />
                  ))}
                </div>
              </fieldset>
            ))
          ) : (
            <Review detail={detail} answers={answers} />
          )}
          {(replace.error || submit.error) && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {parseApiError(replace.error ?? submit.error).message}
            </p>
          )}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {review && (
              <Button variant="outline" onClick={() => setReview(false)}>
                Edit answers
              </Button>
            )}
            <Button
              disabled={replace.isPending || submit.isPending}
              onClick={() =>
                review ? void submitRegistration() : continueToReview()
              }
            >
              {review
                ? submit.isPending
                  ? "Submitting..."
                  : "Submit registration"
                : "Review answers"}
            </Button>
            {!review && (
              <Button
                variant="outline"
                disabled={!dirty || replace.isPending}
                onClick={() => void saveDraft(false)}
              >
                {replace.isPending ? "Saving..." : "Save draft"}
              </Button>
            )}
            {review && savedPendingSubmit && (
              <span className="self-center text-sm font-semibold text-emerald-700">
                Draft saved; submission pending
              </span>
            )}
          </div>
        </div>
        <aside className="h-fit rounded-2xl bg-brand-navy p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
            Registration
          </p>
          <p className="mt-3 font-bold">{detail.event.name}</p>
          <p className="mt-1 text-sm text-blue-100">
            {detail.package.name} · Free
          </p>
          <p className="mt-4 text-xs leading-5 text-blue-200">
            No payment is required. Your draft stays editable until submission.
          </p>
        </aside>
      </section>
    </Shell>
  );
}

type QuestionType = RegistrationDetail["forms"][number]["questions"][number];
function Question({
  question,
  value,
  error,
  update,
}: {
  question: QuestionType;
  value?: string | string[];
  error?: string;
  update: (id: string, value: string | string[]) => void;
}) {
  const id = `question-${question.id}`;
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy =
    [question.helpText ? helpId : "", error ? errorId : ""]
      .filter(Boolean)
      .join(" ") || undefined;
  const common =
    "mt-2 min-h-11 w-full rounded-lg border border-brand-blue/20 bg-white px-3 py-2 text-brand-ink focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20";
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
        onChange={(e) => update(question.id, e.target.value)}
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
        onChange={(e) => update(question.id, e.target.value)}
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
        onChange={(e) => update(question.id, e.target.value)}
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
                        ? (value as string[]).filter((id) => id !== option.id)
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
          ? "File upload questions are not supported yet. You cannot submit this form."
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
      {field}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function DirtyNavigationGuard({ dirty }: { dirty: boolean }) {
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
    if (confirm("Leave this page? Unsaved registration changes will be lost."))
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
        !confirm("Leave this page? Unsaved registration changes will be lost.")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const pop = () => {
      if (
        !confirm("Leave this page? Unsaved registration changes will be lost.")
      )
        history.forward();
    };
    document.addEventListener("click", click, true);
    addEventListener("popstate", pop);
    return () => {
      document.removeEventListener("click", click, true);
      removeEventListener("popstate", pop);
    };
  }, [dirty]);
  return null;
}

function Review({
  detail,
  answers,
}: {
  detail: RegistrationDetail;
  answers: Answers;
}) {
  return (
    <div className="mt-7 space-y-6">
      {sortedForms(detail.forms).map((form) => (
        <section key={form.id}>
          <h2 className="text-xl font-bold text-brand-navy">{form.name}</h2>
          <dl className="mt-3 divide-y divide-brand-blue/10 rounded-xl border border-brand-blue/10">
            {form.questions.map((q) => {
              const raw = answers[q.id];
              const ids = Array.isArray(raw) ? raw : [raw];
              const display = ["SELECT", "RADIO", "CHECKBOX"].includes(
                q.fieldType,
              )
                ? ids
                    .map((id) => q.options.find((o) => o.id === id)?.label)
                    .filter(Boolean)
                    .join(", ")
                : String(raw ?? "");
              return (
                <div key={q.id} className="p-4">
                  <dt className="text-xs font-bold uppercase tracking-wide text-brand-slate">
                    {q.label}
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
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <AppHeader />
        {children}
      </div>
    </main>
  );
}
function State({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="mx-auto mt-12 max-w-xl rounded-2xl border border-brand-blue/10 bg-white p-8 text-center">
      <h1 className="text-2xl font-bold text-brand-navy">{title}</h1>
      <div className="mt-3 text-sm leading-6 text-brand-slate">{children}</div>
    </section>
  );
}
