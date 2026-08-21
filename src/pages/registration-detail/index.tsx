import { ArrowLeft, CalendarDays } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { parseApiError } from "@/api/api-error";
import {
  useCancelRegistration,
  useRegistration,
} from "@/api/registrations/queries";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Status } from "@/pages/registrations";
import { formatPackageAmount } from "@/utils/money";
import { PaymentPanel } from "./payment-panel";
import { usePostRegistrationAssignments } from "@/api/post-registration/queries";
import {
  postRegistrationCta,
  postRegistrationOrganizerNotice,
} from "./post-registration";

const editable = new Set(["DRAFT", "NEEDS_CORRECTION"]);
const cancellable = new Set([
  "DRAFT",
  "AWAITING_MEMBERS",
  "HOLDING",
  "SUBMITTED",
  "PENDING_PAYMENT",
  "PAYMENT_REVIEW",
  "PENDING_APPROVAL",
  "APPROVED",
  "NEEDS_CORRECTION",
  "WAITLISTED",
]);
const date = (value: string) =>
  new Intl.DateTimeFormat("en-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));

export default function RegistrationDetailPage() {
  const { registrationId = "" } = useParams();
  const query = useRegistration(registrationId);
  const cancel = useCancelRegistration(registrationId);
  const navigate = useNavigate();
  const data = query.data;
  const assignments = usePostRegistrationAssignments(
    registrationId,
    data?.status === "APPROVED",
  );
  const cancelRegistration = () => {
    if (confirm("Cancel this entire registration? This cannot be undone."))
      cancel.mutate(undefined);
  };
  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <AppHeader />
        <Link
          to="/registrations"
          className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-brand-blue"
        >
          <ArrowLeft className="size-4" />
          My registrations
        </Link>
        {query.isPending && (
          <div
            role="status"
            className="mt-4 h-96 animate-pulse rounded-2xl bg-brand-blue/10"
          />
        )}
        {query.isError && (
          <Panel title="Registration could not be loaded">
            <Button onClick={() => void query.refetch()}>Try again</Button>
          </Panel>
        )}
        {data && (
          <>
            <section className="mt-4 rounded-2xl bg-brand-navy p-6 text-white sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <Status value={data.status} />
                <span className="text-xs text-blue-200">
                  {data.orderNumber}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-bold">{data.subEvent.name}</h1>
              <p className="mt-2 text-blue-100">
                {data.event.name} · {data.package.name}
              </p>
              <p className="mt-5 flex items-center gap-2 text-sm text-blue-100">
                <CalendarDays className="size-4" />
                {date(data.subEvent.date)}
              </p>
              <p className="mt-2 text-sm font-semibold text-blue-100">
                {formatPackageAmount(data.package)}
              </p>
            </section>
            {data.package.priceMinor !== "0" && data.status !== "DRAFT" && (
              <PaymentPanel registrationId={data.id} />
            )}
            {data.status === "NEEDS_CORRECTION" && (
              <section className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-950 sm:p-8">
                <h2 className="text-xl font-bold">Corrections requested</h2>
                <p className="mt-2 whitespace-pre-wrap">
                  {data.correctionReason ??
                    "Review and correct your responses."}
                </p>
                <p className="mt-3 text-sm font-semibold">
                  {data.correctionDeadlineAt
                    ? `Submit corrections by ${date(data.correctionDeadlineAt)}.`
                    : "No correction deadline was provided."}
                </p>
              </section>
            )}
            {data.status === "APPROVED" && (
              <PostRegistrationForms
                registrationId={data.id}
                query={assignments}
              />
            )}
            <section className="mt-5 rounded-2xl border border-brand-blue/10 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-bold text-brand-navy">
                Registration details
              </h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <Info label="Status" value={data.status.replaceAll("_", " ")} />
                <Info label="Seats" value={String(data.package.seatCount)} />
                <Info
                  label="Submitted"
                  value={
                    data.submittedAt ? date(data.submittedAt) : "Not submitted"
                  }
                />
                <Info label="Created" value={date(data.createdAt)} />
              </dl>
              {data.submissions.map((submission) => {
                const form = data.forms.find((f) => f.id === submission.formId);
                return (
                  <div
                    key={submission.id}
                    className="mt-7 border-t border-brand-blue/10 pt-6"
                  >
                    <h3 className="font-bold text-brand-navy">
                      {form?.name ?? "Responses"}
                    </h3>
                    <dl className="mt-3 space-y-4">
                      {submission.answers.map((answer) => {
                        const question = form?.questions.find(
                          (q) => q.id === answer.questionId,
                        );
                        const values = Array.isArray(answer.value)
                          ? answer.value
                          : [answer.value];
                        const display =
                          question &&
                          ["SELECT", "RADIO", "CHECKBOX"].includes(
                            question.fieldType,
                          )
                            ? values
                                .map(
                                  (id) =>
                                    question.options.find((o) => o.id === id)
                                      ?.label ?? id,
                                )
                                .join(", ")
                            : values.join(", ");
                        return (
                          <div key={answer.questionId}>
                            <dt className="text-xs font-bold uppercase tracking-wide text-brand-slate">
                              {question?.label ?? "Response"}
                            </dt>
                            <dd className="mt-1 whitespace-pre-wrap text-brand-navy">
                              {display}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                );
              })}
              <div className="mt-8 flex flex-col gap-3 border-t border-brand-blue/10 pt-6 sm:flex-row sm:justify-end">
                {editable.has(data.status) && (
                  <Button
                    onClick={() =>
                      navigate(
                        `/events/${data.event.id}/subevents/${data.subEvent.id}/register`,
                      )
                    }
                  >
                    {data.status === "NEEDS_CORRECTION"
                      ? "Correct registration"
                      : "Resume registration"}
                  </Button>
                )}
                {cancellable.has(data.status) && (
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-700"
                    disabled={cancel.isPending}
                    onClick={cancelRegistration}
                  >
                    {cancel.isPending ? "Cancelling..." : "Cancel registration"}
                  </Button>
                )}
              </div>
              {cancel.isError && (
                <p role="alert" className="mt-4 text-sm text-red-700">
                  {parseApiError(cancel.error).message}
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

type AssignmentsQuery = ReturnType<typeof usePostRegistrationAssignments>;

function PostRegistrationForms({
  registrationId,
  query,
}: {
  registrationId: string;
  query: AssignmentsQuery;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-brand-blue/10 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-bold text-brand-navy">
        Post-registration forms
      </h2>
      <p className="mt-1 text-sm text-brand-slate">
        Complete assigned forms before the event. Server availability controls
        every action.
      </p>
      {query.isPending && (
        <div
          role="status"
          className="mt-5 space-y-3"
          aria-label="Loading post-registration forms"
        >
          <div className="h-28 animate-pulse rounded-xl bg-brand-blue/10" />
          <div className="h-28 animate-pulse rounded-xl bg-brand-blue/10" />
        </div>
      )}
      {query.isError && (
        <div
          role="alert"
          className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800"
        >
          <p>{parseApiError(query.error).message}</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => void query.refetch()}
          >
            Try again
          </Button>
        </div>
      )}
      {query.data?.length === 0 && (
        <p className="mt-5 rounded-xl bg-brand-pale p-5 text-sm text-brand-slate">
          No post-registration forms have been assigned.
        </p>
      )}
      {query.data && query.data.length > 0 && (
        <div className="mt-5 space-y-4">
          {[...query.data]
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((assignment) => {
              const organizerNotice =
                postRegistrationOrganizerNotice(assignment);
              return (
                <article
                  key={assignment.id}
                  className="rounded-xl border border-brand-blue/10 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-brand-navy">
                        {assignment.formName}
                      </h3>
                      {assignment.formDescription && (
                        <p className="mt-1 text-sm text-brand-slate">
                          {assignment.formDescription}
                        </p>
                      )}
                    </div>
                    <span className="rounded-full bg-brand-pale px-3 py-1 text-xs font-bold text-brand-navy">
                      {assignment.availability.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded bg-slate-100 px-2 py-1">
                      Version {assignment.version}
                    </span>
                    {assignment.isRequired && (
                      <span className="rounded bg-amber-100 px-2 py-1 text-amber-900">
                        Required
                      </span>
                    )}
                    {assignment.blocksCheckIn && (
                      <span className="rounded bg-red-100 px-2 py-1 text-red-800">
                        Blocks check-in
                      </span>
                    )}
                    <span className="rounded bg-slate-100 px-2 py-1">
                      {assignment.completion.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-brand-slate">
                    {assignment.opensAt
                      ? `Opens ${date(assignment.opensAt)}`
                      : "Available immediately"}
                    {assignment.closesAt
                      ? ` · Closes ${date(assignment.closesAt)}`
                      : " · No normal deadline"}
                    {organizerNotice?.deadlineAt
                      ? ` · ${organizerNotice.kind === "correction" ? "Correction due" : "Reopened until"} ${date(organizerNotice.deadlineAt)}`
                      : ""}
                  </p>
                  {organizerNotice && (
                    <div
                      className={`mt-3 rounded-lg p-3 text-sm ${organizerNotice.kind === "correction" ? "bg-amber-50 text-amber-900" : "bg-blue-50 text-brand-navy"}`}
                    >
                      <p className="font-bold">{organizerNotice.title}</p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {organizerNotice.reason ??
                          "The organizer has made this response available again."}
                      </p>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Button
                      asChild
                      variant={assignment.canEdit ? "primary" : "outline"}
                    >
                      <Link
                        to={`/registrations/${registrationId}/forms/${assignment.id}`}
                      >
                        {postRegistrationCta(assignment)}
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })}
        </div>
      )}
    </section>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-brand-slate">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-brand-navy">{value}</dd>
    </div>
  );
}
function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 rounded-2xl bg-white p-8 text-center">
      <h1 className="text-2xl font-bold text-brand-navy">{title}</h1>
      <div className="mt-4">{children}</div>
    </section>
  );
}
