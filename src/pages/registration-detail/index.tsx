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

const editable = new Set(["DRAFT"]);
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
              <p className="mt-2 text-sm font-semibold text-emerald-200">
                Free registration · payment is not required
              </p>
            </section>
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
                    Resume registration
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
