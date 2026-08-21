import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  usePostRegistrationAssignment,
  useSavePostRegistrationResponse,
  useSubmitPostRegistrationResponse,
  type PostRegistrationAssignment,
} from "@/api/post-registration/queries";
import { parseApiError } from "@/api/api-error";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import {
  DirtyNavigationGuard,
  DynamicAnswersReview,
  DynamicQuestionField,
} from "@/components/dynamic-form";
import {
  validateAnswers,
  type Answers,
  type FormErrors,
} from "@/pages/event-registration/form";
import { createIdempotencyKey } from "@/utils/idempotency";
import {
  answersFromAssignment,
  assignmentForms,
  buildAssignmentPayload,
} from "./form";
import { postRegistrationOrganizerNotice } from "@/pages/registration-detail/post-registration";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function PostRegistrationFormPage() {
  const { registrationId = "", assignmentId = "" } = useParams();
  const query = usePostRegistrationAssignment(registrationId, assignmentId);
  const save = useSavePostRegistrationResponse(registrationId, assignmentId);
  const submit = useSubmitPostRegistrationResponse(
    registrationId,
    assignmentId,
  );
  const navigate = useNavigate();
  const key = useRef(createIdempotencyKey());
  const loadedRevision = useRef<number | null | undefined>(undefined);
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [dirty, setDirty] = useState(false);
  const [review, setReview] = useState(false);
  const [notice, setNotice] = useState("");
  const assignment = query.data;

  useEffect(() => {
    if (!assignment || dirty) return;
    const revision = assignment.response?.revision ?? null;
    if (loadedRevision.current !== revision) {
      setAnswers(answersFromAssignment(assignment));
      loadedRevision.current = revision;
    }
  }, [assignment, dirty]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!assignment)
    return (
      <Shell>
        <State
          title={
            query.isError ? "Form could not be loaded" : "Loading assigned form"
          }
        >
          {query.isError && (
            <>
              <p>{parseApiError(query.error).message}</p>
              <Button className="mt-4" onClick={() => void query.refetch()}>
                Try again
              </Button>
            </>
          )}
        </State>
      </Shell>
    );

  const forms = assignmentForms(assignment);
  const readOnly = !assignment.canEdit;
  const hasUnsupported = forms.some((form) =>
    form.questions.some((question) => question.fieldType === "FILE"),
  );
  const update = (id: string, value: string | string[]) => {
    if (readOnly) return;
    setAnswers((current) => ({ ...current, [id]: value }));
    setErrors((current) => ({ ...current, [id]: "" }));
    setDirty(true);
    key.current = createIdempotencyKey();
  };
  const showErrors = (next: FormErrors) => {
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first)
      requestAnimationFrame(() =>
        document.getElementById(`question-${first}`)?.focus(),
      );
    return Boolean(first);
  };
  const handleError = (error: unknown) => {
    const parsed = parseApiError(error);
    showErrors(parsed.fieldErrors);
    setReview(false);
    setNotice(
      ["REVISION_CONFLICT", "RESPONSE_REVISION_CONFLICT"].includes(
        parsed.code ?? "",
      )
        ? "This response changed on the server. Reload the latest response before editing again."
        : parsed.message,
    );
    if (!axios.isAxiosError(error) || error.response)
      key.current = createIdempotencyKey();
  };
  const saveDraft = async (requireComplete: boolean) => {
    if (!assignment.canEdit) return undefined;
    if (requireComplete && showErrors(validateAnswers(forms, answers))) {
      setReview(false);
      return undefined;
    }
    try {
      const saved = await save.mutateAsync(
        buildAssignmentPayload(assignment, answers),
      );
      loadedRevision.current = saved.response?.revision ?? null;
      setDirty(false);
      setNotice("Draft saved.");
      return saved;
    } catch (error) {
      handleError(error);
      return undefined;
    }
  };
  const submitResponse = async () => {
    let current: PostRegistrationAssignment | undefined = assignment;
    if (dirty || !assignment.response) current = await saveDraft(true);
    if (!current?.response || !current.canSubmit) return;
    try {
      await submit.mutateAsync({
        revision: current.response.revision,
        idempotencyKey: key.current,
      });
      navigate(`/registrations/${registrationId}`, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error) && !error.response) {
        setNotice(
          "Submission outcome is unknown. Checking the response before retrying...",
        );
        const refreshed = await query.refetch();
        if (refreshed.data?.completion === "LOCKED")
          navigate(`/registrations/${registrationId}`, { replace: true });
        else
          setNotice(
            "Your draft is saved. Retry submission with the same request key.",
          );
      } else handleError(error);
    }
  };
  const continueToReview = () => {
    if (!showErrors(validateAnswers(forms, answers))) setReview(true);
  };

  return (
    <Shell>
      <DirtyNavigationGuard dirty={dirty} />
      <Link
        to={`/registrations/${registrationId}`}
        className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-brand-blue"
      >
        <ArrowLeft className="size-4" /> Registration details
      </Link>
      <section className="mt-4 rounded-2xl border border-brand-blue/10 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-blue">
              {review
                ? "Review assigned form"
                : `Form version ${assignment.version}`}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-brand-navy">
              {assignment.formName}
            </h1>
            {assignment.formDescription && (
              <p className="mt-2 text-brand-slate">
                {assignment.formDescription}
              </p>
            )}
          </div>
          <span className="rounded-full bg-brand-pale px-3 py-1 text-xs font-bold text-brand-navy">
            {assignment.availability.replaceAll("_", " ")}
          </span>
        </div>
        <AssignmentNotice assignment={assignment} />
        {notice && (
          <p
            aria-live="polite"
            className="mt-4 rounded-lg bg-brand-pale p-3 text-sm text-brand-navy"
          >
            {notice}
          </p>
        )}
        {readOnly && (
          <p className="mt-5 rounded-lg bg-slate-100 p-3 text-sm text-brand-slate">
            This exact form version is read-only. Saved responses remain
            available to review.
          </p>
        )}
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
                    readOnly={readOnly}
                  />
                ))}
              </div>
            </fieldset>
          ))
        ) : (
          <DynamicAnswersReview forms={forms} answers={answers} />
        )}
        {!readOnly && (
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-brand-blue/10 pt-6 sm:flex-row sm:justify-end">
            {review && (
              <Button variant="outline" onClick={() => setReview(false)}>
                Edit answers
              </Button>
            )}
            {!review && (
              <Button
                variant="outline"
                disabled={!dirty || save.isPending}
                onClick={() => void saveDraft(false)}
              >
                {save.isPending ? "Saving..." : "Save draft"}
              </Button>
            )}
            {assignment.canSubmit && !hasUnsupported && (
              <Button
                disabled={save.isPending || submit.isPending}
                onClick={() =>
                  review ? void submitResponse() : continueToReview()
                }
              >
                {review
                  ? submit.isPending
                    ? "Submitting..."
                    : "Submit form"
                  : "Review answers"}
              </Button>
            )}
          </div>
        )}
      </section>
    </Shell>
  );
}

function AssignmentNotice({
  assignment,
}: {
  assignment: PostRegistrationAssignment;
}) {
  const organizerNotice = postRegistrationOrganizerNotice(assignment);
  if (organizerNotice)
    return (
      <div
        className={`mt-5 rounded-xl border p-4 text-sm ${organizerNotice.kind === "correction" ? "border-amber-300 bg-amber-50 text-amber-900" : "border-blue-200 bg-blue-50 text-brand-navy"}`}
      >
        <p className="font-bold">{organizerNotice.title}</p>
        <p className="mt-1 whitespace-pre-wrap">
          {organizerNotice.reason ??
            "The organizer has made this response available again."}
        </p>
        {organizerNotice.deadlineAt && (
          <p className="mt-2 font-semibold">
            {organizerNotice.kind === "correction"
              ? "Correction due"
              : "Reopened until"}{" "}
            {formatDate(organizerNotice.deadlineAt)}
          </p>
        )}
        {organizerNotice.kind === "correction" && (
          <p className="mt-2">
            Correction access is controlled by the server even after the normal
            form window closes.
          </p>
        )}
      </div>
    );
  if (assignment.availability === "UPCOMING")
    return (
      <p className="mt-5 rounded-lg bg-blue-50 p-3 text-sm text-brand-navy">
        This form opens{" "}
        {assignment.opensAt ? formatDate(assignment.opensAt) : "later"}. You can
        review its exact questions now.
      </p>
    );
  if (assignment.availability === "OVERDUE")
    return (
      <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">
        The normal response window closed
        {assignment.closesAt ? ` on ${formatDate(assignment.closesAt)}` : ""}.
      </p>
    );
  return null;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
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
