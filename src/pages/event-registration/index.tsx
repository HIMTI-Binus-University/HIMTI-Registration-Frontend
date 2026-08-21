import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { parseApiError } from "@/api/api-error";
import axios from "axios";
import {
  useCreateRegistration,
  useRegistration,
  useRegistrationContext,
  useReplaceRegistrationResponses,
  useSubmitRegistration,
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
import { formatPackageAmount } from "@/utils/money";
import {
  DirtyNavigationGuard,
  DynamicAnswersReview,
  DynamicQuestionField,
} from "@/components/dynamic-form";
import {
  isCompletedSubmissionOutcome,
  isCorrection,
  isCorrectionExpired,
  revisionFingerprint,
} from "./lifecycle";
import { readinessMessage } from "./readiness";
import { reconcilePackageSelection } from "./package-selection";

export default function EventRegistrationPage() {
  const { registrationId } = useParams();
  if (registrationId)
    return <RegistrationEditor registrationId={registrationId} />;
  return <NewEventRegistrationPage />;
}

function NewEventRegistrationPage() {
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
  const [packageChoice, setPackageChoice] = useState("");
  const packageIds = context.data?.packages.map((item) => item.id) ?? [];
  const selectedPackageId = reconcilePackageSelection(
    packageIds,
    packageChoice,
  );

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
        {data.packages.length > 0 ? (
          <fieldset className="mt-5 text-left">
            <legend className="font-bold text-brand-navy">
              Choose an eligible package
            </legend>
            <div className="mt-3 space-y-3">
              {data.packages.map((item) => {
                const checked = selectedPackageId === item.id;
                return (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${checked ? "border-brand-blue bg-brand-pale" : "border-brand-blue/15"}`}
                  >
                    <input
                      type="radio"
                      name="package"
                      value={item.id}
                      checked={checked}
                      onChange={() => setPackageChoice(item.id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block font-bold text-brand-navy">
                        {item.name}
                      </span>
                      <span className="text-sm text-brand-slate">
                        {formatPackageAmount(item)} total · exactly{" "}
                        {item.seatCount}{" "}
                        {item.seatCount === 1 ? "seat" : "seats"}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <p>Free one-seat registration · Free - no payment required</p>
        )}
        <Button
          className="mt-5"
          disabled={
            create.isPending || (data.packages.length > 0 && !selectedPackageId)
          }
          onClick={() =>
            create.mutate(
              {
                ...(selectedPackageId ? { packageId: selectedPackageId } : {}),
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
    const revisions = revisionFingerprint(detail);
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
  const correction = isCorrection(detail);
  const correctionExpired = isCorrectionExpired(detail);
  const canSave =
    detail.viewer.capabilities.includes("SAVE_BUYER") ||
    detail.viewer.capabilities.includes("SAVE_OWN_MEMBER");
  const canSubmit =
    detail.viewer.role === "BUYER" &&
    detail.viewer.capabilities.includes("SUBMIT");
  const rosterReadyForSubmit = detail.readiness.submittable;
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
    const previousRevisions = loadedRevisions.current;
    try {
      const saved = await replace.mutateAsync(
        buildResponsePayload(detail, answers),
      );
      loadedRevisions.current = revisionFingerprint(saved);
      setDirty(false);
      setNotice(correction ? "Corrections saved." : "Draft saved.");
      return saved;
    } catch (error) {
      if (axios.isAxiosError(error) && !error.response) {
        setNotice("Save outcome is unknown. Checking the server...");
        const refreshed = await query.refetch();
        if (
          refreshed.data &&
          revisionFingerprint(refreshed.data) !== previousRevisions
        ) {
          loadedRevisions.current = revisionFingerprint(refreshed.data);
          setAnswers(answersFromDetail(refreshed.data));
          setDirty(false);
          replace.reset();
          setNotice(correction ? "Corrections saved." : "Draft saved.");
          return refreshed.data;
        }
        setNotice("The save could not be confirmed. Retry without reloading.");
        return false;
      }
      handleDomainError(error);
      return false;
    }
  };
  const submitRegistration = async () => {
    let latest = detail;
    if (dirty) {
      const saved = await saveDraft(true);
      if (!saved) return;
      latest = saved;
    }
    if (!latest.readiness.submittable) {
      setNotice(readinessMessage(latest.readiness));
      return;
    }
    setSavedPendingSubmit(true);
    try {
      const submitted = await submit.mutateAsync(idempotencyKey.current);
      setSavedPendingSubmit(false);
      if (isCompletedSubmissionOutcome(submitted))
        navigate(`/registrations/${registrationId}`, { replace: true });
      else
        setNotice(
          correction
            ? "The server still marks this registration as needing correction. Review the latest detail before retrying."
            : "Submission was not completed. Review the latest draft before retrying.",
        );
    } catch (error) {
      if (axios.isAxiosError(error) && !error.response) {
        setNotice(
          "Submission outcome is unknown. Checking the registration before retrying...",
        );
        const refreshed = await query.refetch();
        if (refreshed.data && isCompletedSubmissionOutcome(refreshed.data))
          navigate(`/registrations/${registrationId}`, { replace: true });
        else
          setNotice(
            correction
              ? "Your corrections remain open and resubmission was not confirmed. Retry with the same request key."
              : "Your draft is saved. Retry submission with the same request key.",
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
          {correction && (
            <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-bold">Organizer requested corrections</p>
              <p className="mt-1 whitespace-pre-wrap">
                {detail.correctionReason ??
                  "Review and correct your responses."}
              </p>
              <p className="mt-2 font-semibold">
                {detail.correctionDeadlineAt
                  ? `Due ${new Intl.DateTimeFormat("en-ID", { dateStyle: "full", timeStyle: "short" }).format(new Date(detail.correctionDeadlineAt))}`
                  : "No correction deadline was provided."}
              </p>
              {correctionExpired && (
                <p role="alert" className="mt-2 font-bold text-red-700">
                  The correction deadline has passed. Changes can no longer be
                  saved or resubmitted.
                </p>
              )}
            </div>
          )}
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
                    <DynamicQuestionField
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
            <DynamicAnswersReview forms={detail.forms} answers={answers} />
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
              disabled={
                correctionExpired ||
                !canSave ||
                (review && canSubmit && !dirty && !rosterReadyForSubmit) ||
                replace.isPending ||
                submit.isPending
              }
              onClick={() =>
                review
                  ? canSubmit
                    ? void submitRegistration()
                    : void saveDraft(true).then((saved) => {
                        if (saved) navigate(`/registrations/${registrationId}`);
                      })
                  : continueToReview()
              }
            >
              {review
                ? submit.isPending
                  ? "Submitting..."
                  : canSubmit
                    ? correction
                      ? "Resubmit corrections"
                      : "Submit registration"
                    : correction
                      ? "Save my corrections"
                      : "Save my responses"
                : "Review answers"}
            </Button>
            {!review && (
              <Button
                variant="outline"
                disabled={
                  correctionExpired || !canSave || !dirty || replace.isPending
                }
                onClick={() => void saveDraft(false)}
              >
                {replace.isPending
                  ? "Saving..."
                  : correction
                    ? "Save corrections"
                    : "Save draft"}
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
            {detail.package.name} · {formatPackageAmount(detail.package)} total
          </p>
          <p className="mt-1 text-sm text-blue-100">
            Exactly {detail.package.seatCount}{" "}
            {detail.package.seatCount === 1 ? "seat" : "seats"}
          </p>
          <p className="mt-4 text-xs leading-5 text-blue-200">
            {detail.package.priceMinor === "0"
              ? "No payment is required. Your draft stays editable until submission."
              : "After submission, continue to your registration detail to transfer payment and upload proof."}
          </p>
          {canSubmit && !rosterReadyForSubmit && (
            <p className="mt-4 rounded-lg bg-white/10 p-3 text-xs leading-5 text-blue-100">
              {readinessMessage(detail.readiness)}
            </p>
          )}
        </aside>
      </section>
    </Shell>
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
