import { ArrowLeft } from "lucide-react";
import { PaymentSection } from "./payment";
import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useCancelMyEventRegistration,
  useLeaveMyBundle,
  useMyEventRegistration,
  useReplaceMyEventRegistrationAnswers,
  useReplaceMyBundleCode,
} from "@/api/event-registrations/queries";
import { parseApiError } from "@/api/api-error";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import {
  allQuestions,
  buildAnswerPayload,
  emptyAnswers,
  formatIdr,
  restoreAnswers,
  validateAnswers,
  type AnswerValues,
  type StoredAnswer,
} from "@/pages/event-registration/answers";
import {
  PersonalInformation,
  QuestionField,
} from "@/pages/event-registration/shared";

type MemberData = {
  snapshotName?: string | null;
  snapshotNim?: string | null;
  snapshotOutlookEmail?: string | null;
  snapshotEmail?: string | null;
  snapshotUniversity?: string | null;
  snapshotStudyProgram?: string | null;
  snapshotRegion?: string | null;
  snapshotPhoneNumber?: string | null;
  submissions?: { answers?: StoredAnswer[] }[];
};
type Registration = NonNullable<
  ReturnType<typeof useMyEventRegistration>["data"]
>;
type RegistrationSections = NonNullable<
  NonNullable<Registration["members"][number]["submissions"]>[number]["form"]
>["sections"];

const statusCopy: Record<string, string> = {
  ASSEMBLING:
    "Your registration is assembling. Complete your answers and, for Bundles, wait for every seat to be filled and ready.",
  PENDING_PAYMENT:
    "Payment acknowledgement is required. Upload the requested proof before the deadline.",
  PAYMENT_REVIEW: "Your payment is under organizer review.",
  CONFIRMED:
    "Your registration is confirmed. Your active ticket is ready below.",
  REJECTED: "Payment was rejected and this registration is no longer active.",
  EXPIRED: "The registration or payment deadline expired.",
  CANCELLED: "This registration was cancelled.",
};

const memberData = (member: unknown): MemberData => {
  return typeof member === "object" && member !== null
    ? (member as MemberData)
    : {};
};

export default function RegistrationDetailPage() {
  const { registrationId = "" } = useParams();
  const registration = useMyEventRegistration(registrationId);
  if (registration.isPending) return <Status>Loading registration...</Status>;
  if (registration.isError || !registration.data)
    return <Status>Registration could not be loaded.</Status>;
  const member = registration.data.members.find((item) => item.isCurrentUser);
  if (!member) return <Status>Registration access is unavailable.</Status>;
  const sections = member?.submissions?.[0]?.form.sections ?? [];
  return (
    <RegistrationDetail
      key={`${registration.data.id}:${registration.data.revision}:${member?.submissions?.[0]?.formVersion ?? "none"}`}
      registration={registration.data}
      sections={sections}
      refetch={() => void registration.refetch()}
    />
  );
}

function RegistrationDetail({
  registration,
  sections,
  refetch,
}: {
  registration: Registration;
  sections: RegistrationSections;
  refetch: () => void;
}) {
  const replace = useReplaceMyEventRegistrationAnswers(registration.id);
  const cancel = useCancelMyEventRegistration(registration.id);
  const leave = useLeaveMyBundle(registration.id);
  const replaceCode = useReplaceMyBundleCode(registration.id);
  const navigate = useNavigate();
  const cancelDialog = useRef<HTMLDialogElement>(null);
  const replaceCodeDialog = useRef<HTMLDialogElement>(null);
  const cancelling = useRef(false);
  const ownMember = registration.members.find((item) => item.isCurrentUser)!;
  const member = memberData(ownMember);
  const questions = allQuestions(sections);
  const stored = member.submissions?.[0]?.answers ?? [];
  const hasAddedQuestions = Boolean(
    ownMember?.supplementalRequests?.some((request) => !request.withdrawnAt),
  );
  const [values, setValues] = useState<AnswerValues>(() => ({
    ...emptyAnswers(questions),
    ...restoreAnswers(stored, questions),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const editable = registration.status === "ASSEMBLING";
  const isBundle = registration.seatCount > 1;
  const bundleCode = registration.bundleCode;
  const hasFileQuestion = questions.some(({ type }) => type === "FILE");
  const canCancel =
    !isBundle &&
    ["ASSEMBLING", "PENDING_PAYMENT"].includes(registration.status) &&
    (!registration.event.cancellationClosesAt ||
      new Date(registration.event.cancellationClosesAt) > new Date());
  const save = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateAnswers(questions, values);
    setErrors(nextErrors);
    setSaved(false);
    if (Object.keys(nextErrors).length) return;
    replace.mutate(
      {
        answers: buildAnswerPayload(questions, values),
        expectedRevision: registration.revision,
      },
      {
        onSuccess: () => {
          setSaved(true);
          refetch();
        },
      },
    );
  };
  const requestError = replace.error ?? cancel.error;
  const profile = registration.profile;
  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <AppHeader />
        <Link
          to={`/events/${registration.eventId}`}
          className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-brand-blue"
        >
          <ArrowLeft className="size-4" /> Back to event
        </Link>
        <section className="my-4 rounded-3xl bg-brand-navy p-6 text-white sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-sky">
            Order {registration.orderNumber}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{registration.event.name}</h1>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <Info label="Package" value={registration.ticketPackage.name} />
            <Info
              label="Order status"
              value={registration.status.replaceAll("_", " ")}
            />
            <Info label="Total" value={formatIdr(registration.totalMinor)} />
          </div>
        </section>
        <p className="rounded-2xl border border-brand-blue/10 bg-white p-5 text-sm leading-6 text-brand-slate">
          {statusCopy[registration.status]}
        </p>

        {registration.status === "CONFIRMED" &&
          ownMember.ticket?.status === "ACTIVE" && (
            <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <h2 className="text-xl font-bold text-brand-navy">
                Your ticket is ready
              </h2>
              <p className="mt-2 text-sm text-brand-slate">
                Keep the QR and fallback code available for Event entry. Ticket
                issuance does not depend on attendance tracking.
              </p>
              <Button asChild className="mt-4">
                <Link to={`/tickets/${ownMember.ticket.id}`}>Open ticket</Link>
              </Button>
            </section>
          )}

        {Boolean(registration.payment) && (
          <PaymentSection
            registrationId={registration.id}
            onUpdated={refetch}
          />
        )}

        {isBundle && (
          <section className="mt-6 rounded-2xl border border-brand-blue/10 bg-white p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-xl font-bold text-brand-navy">
                  Bundle members
                </h2>
                <p className="mt-1 text-sm text-brand-slate">
                  All members have equal rights. Submission starts automatically
                  at {registration.seatCount} ready members.
                </p>
              </div>
              <span className="font-bold text-brand-blue">
                {
                  registration.members.filter(({ status }) =>
                    ["ACTIVE", "LOCKED"].includes(status),
                  ).length
                }
                /{registration.seatCount} seats
              </span>
            </div>
            <ul className="mt-5 grid gap-2" aria-label="Bundle readiness">
              {registration.members
                .filter(({ status }) => ["ACTIVE", "LOCKED"].includes(status))
                .map((item) => (
                  <li
                    key={item.id}
                    className="flex min-h-11 items-center justify-between rounded-xl bg-brand-pale px-4 py-2 text-sm"
                  >
                    <span className="font-semibold text-brand-navy">
                      {item.name || "Bundle member"}
                      {item.isCurrentUser ? " (you)" : ""}
                    </span>
                    <span
                      className={
                        item.ready ? "text-emerald-700" : "text-amber-800"
                      }
                    >
                      {item.ready ? "Ready" : "Answers pending"}
                    </span>
                  </li>
                ))}
            </ul>
            {bundleCode && (
              <div className="mt-5 rounded-xl border border-brand-blue/20 p-4">
                <p className="text-sm font-bold text-brand-navy">
                  Share this Bundle Code
                </p>
                <code className="mt-2 block break-all text-lg font-bold tracking-wider text-brand-blue">
                  {bundleCode}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={() => void navigator.clipboard.writeText(bundleCode)}
                >
                  Copy code
                </Button>
              </div>
            )}
            {bundleCode === null && (
              <p className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                This legacy Bundle has no recoverable code. One new code must be
                generated before it can remain visible here.
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={replaceCode.isPending}
                onClick={() =>
                  bundleCode
                    ? replaceCodeDialog.current?.showModal()
                    : replaceCode.mutate(registration.revision)
                }
              >
                {replaceCode.isPending ? "Generating..." : "Generate new code"}
              </Button>
              {editable && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-300 text-red-700"
                  disabled={leave.isPending}
                  onClick={() =>
                    leave.mutate(registration.revision, {
                      onSuccess: () =>
                        navigate(`/events/${registration.eventId}`),
                    })
                  }
                >
                  {leave.isPending ? "Leaving..." : "Leave Bundle"}
                </Button>
              )}
            </div>
            {replaceCode.error && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {parseApiError(replaceCode.error).message}
              </p>
            )}
            <dialog
              ref={replaceCodeDialog}
              aria-labelledby="replace-bundle-code-title"
              aria-describedby="replace-bundle-code-description"
              className="w-[calc(100%-2rem)] max-w-lg rounded-2xl border bg-white p-6 text-brand-navy shadow-xl backdrop:bg-black/50"
            >
              <h2 id="replace-bundle-code-title" className="text-xl font-bold">
                Generate a new code?
              </h2>
              <p
                id="replace-bundle-code-description"
                className="mt-3 text-sm text-brand-slate"
              >
                The current Bundle Code will stop working immediately.
              </p>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  autoFocus
                  disabled={replaceCode.isPending}
                  onClick={() => replaceCodeDialog.current?.close()}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={replaceCode.isPending}
                  onClick={() =>
                    replaceCode.mutate(registration.revision, {
                      onSuccess: () => replaceCodeDialog.current?.close(),
                    })
                  }
                >
                  {replaceCode.isPending
                    ? "Generating..."
                    : "Generate new code"}
                </Button>
              </div>
            </dialog>
          </section>
        )}

        {profile && (
          <div className="mt-6">
            <PersonalInformation
              values={profile.values}
              missingFields={profile.missingFields}
              title="Current profile"
              description={
                editable
                  ? "These read-only details will be saved with your registration when you complete the form. Edit your profile first if anything is incorrect."
                  : "These are your current profile details. The information used when you submitted remains securely preserved with your registration."
              }
            />
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-brand-blue/10 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-brand-navy">
            Registration answers
          </h2>
          <form onSubmit={save}>
            {!sections.length && !hasAddedQuestions && (
              <p className="mt-5 text-sm text-amber-900">
                The registration form is currently unavailable.
              </p>
            )}
            <div className="mt-6 space-y-7">
              {sections.map((section) => (
                <section key={section.id}>
                  <h3 className="text-lg font-bold text-brand-navy">
                    {section.title}
                  </h3>
                  {section.description && (
                    <p className="mt-1 text-sm text-brand-slate">
                      {section.description}
                    </p>
                  )}
                  <div className="mt-4 grid gap-5">
                    {section.questions.map((question) => (
                      <QuestionField
                        key={question.id}
                        question={question}
                        value={values[question.id]}
                        disabled={!editable || question.type === "FILE"}
                        error={errors[question.id]}
                        onChange={(value) =>
                          setValues((current) => ({
                            ...current,
                            [question.id]: value,
                          }))
                        }
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
            {requestError && (
              <p role="alert" className="mt-5 text-sm text-red-700">
                {parseApiError(requestError).message}
              </p>
            )}
            {saved && (
              <p
                role="status"
                className="mt-5 text-sm font-semibold text-emerald-700"
              >
                Answers saved.
              </p>
            )}
            {editable && (
              <Button
                className="mt-6"
                disabled={
                  replace.isPending ||
                  cancel.isPending ||
                  !questions.length ||
                  hasFileQuestion
                }
              >
                {replace.isPending ? "Submitting..." : "Submit registration"}
              </Button>
            )}
          </form>

          <AddedAnswers
            key={ownMember.supplementalRevision}
            registration={registration}
          />
        </section>

        {canCancel && (
          <section className="my-6 rounded-2xl border border-red-200 bg-white p-6">
            <h2 className="font-bold text-brand-navy">Cancel registration</h2>
            <p className="mt-1 text-sm text-brand-slate">
              Cancellation cannot be undone.
            </p>
            <Button
              variant="outline"
              className="mt-4 border-red-300 text-red-700"
              disabled={cancel.isPending || replace.isPending}
              onClick={() => {
                cancel.reset();
                cancelDialog.current?.showModal();
              }}
            >
              {cancel.isPending ? "Cancelling..." : "Cancel registration"}
            </Button>
            <dialog
              ref={cancelDialog}
              aria-labelledby="cancel-registration-title"
              aria-describedby="cancel-registration-description"
              className="w-[calc(100%-2rem)] max-w-lg rounded-2xl border bg-white p-6 text-brand-navy shadow-xl backdrop:bg-black/50"
              onCancel={(event) => {
                if (cancelling.current) event.preventDefault();
              }}
            >
              <h2 id="cancel-registration-title" className="text-xl font-bold">
                Cancel registration?
              </h2>
              <p
                id="cancel-registration-description"
                className="mt-3 text-sm text-brand-slate"
              >
                Cancel order {registration.orderNumber} for "
                {registration.event.name}" ({registration.ticketPackage.name}).
                Cancellation cannot be undone.
              </p>
              {cancel.error && (
                <p role="alert" className="mt-3 text-sm text-red-700">
                  {parseApiError(cancel.error).message}
                </p>
              )}
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  autoFocus
                  disabled={cancel.isPending}
                  onClick={() => cancelDialog.current?.close()}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={cancel.isPending || replace.isPending}
                  onClick={() => {
                    if (cancelling.current || replace.isPending) return;
                    cancelling.current = true;
                    cancel.mutate(registration.revision, {
                      onSuccess: () => {
                        cancelDialog.current?.close();
                        navigate(`/events/${registration.eventId}`);
                      },
                      onSettled: () => {
                        cancelling.current = false;
                      },
                    });
                  }}
                >
                  {cancel.isPending ? "Cancelling..." : "Cancel registration"}
                </Button>
              </div>
            </dialog>
          </section>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-xs uppercase tracking-wider text-white/60">
        {label}
      </span>
      <span className="mt-1 block font-bold">{value}</span>
    </div>
  );
}

function AddedAnswers({
  registration,
}: {
  registration: NonNullable<ReturnType<typeof useMyEventRegistration>["data"]>;
}) {
  const member = registration.members.find((item) => item.isCurrentUser);
  const requests = [...(member?.supplementalRequests ?? [])]
    .filter((request) => !request.withdrawnAt)
    .sort(
      (left, right) => left.question.orderIndex - right.question.orderIndex,
    );
  const outstanding = requests.filter((request) => !request.answeredAt);
  const active =
    Boolean(member) &&
    !["CANCELLED", "EXPIRED", "REJECTED"].includes(registration.status) &&
    ["ACTIVE", "LOCKED"].includes(member?.status ?? "");
  const questions = outstanding.map((request) => request.question);
  const editableQuestions = questions.filter(
    (question) => question.type !== "FILE",
  );
  const canSave = active && editableQuestions.length > 0;
  const [values, setValues] = useState<AnswerValues>(() =>
    emptyAnswers(questions),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useReplaceMyEventRegistrationAnswers(registration.id, true);
  if (!requests.length) return null;
  return (
    <form
      className="mt-7 grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        const next = validateAnswers(
          editableQuestions.map((question) => ({
            ...question,
            isRequired: false,
          })),
          values,
        );
        setErrors(next);
        if (Object.keys(next).length) return;
        save.mutate({
          expectedRevision: member!.supplementalRevision!,
          answers: buildAnswerPayload(editableQuestions, values),
        });
      }}
    >
      {requests.map((request) => {
        const answered = Boolean(request.answeredAt);
        const answer = Array.isArray(request.answer)
          ? request.answer.filter(
              (value): value is string => typeof value === "string",
            )
          : request.answer == null
            ? ""
            : String(request.answer);
        return (
          <QuestionField
            key={request.id}
            question={request.question}
            value={answered ? answer : values[request.question.id]}
            error={errors[request.question.id]}
            disabled={
              answered ||
              !active ||
              save.isPending ||
              request.question.type === "FILE"
            }
            onChange={(value) =>
              setValues((current) => ({
                ...current,
                [request.question.id]: value,
              }))
            }
          />
        );
      })}
      {save.error && (
        <p role="alert" className="text-sm text-red-700">
          {parseApiError(save.error).message} Reload the registration if the
          questions have changed.
        </p>
      )}
      {canSave && (
        <Button disabled={save.isPending}>
          {save.isPending ? "Saving..." : "Save answers"}
        </Button>
      )}
    </form>
  );
}

function Status({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-brand-slate">
      {children}
    </main>
  );
}
