import { useState } from "react";
import {
  type InvitationMutation,
  type RegistrationDetail,
  useCreateRegistrationInvitation,
  useResendRegistrationInvitation,
  useRevokeRegistrationInvitation,
} from "@/api/registrations/queries";
import { parseApiError } from "@/api/api-error";
import { Button } from "@/components/ui/button";
import { invitationUrl } from "./invitation-link";
import { rosterReadinessPresentation } from "./roster-readiness";

export function RosterPanel({ detail }: { detail: RegistrationDetail }) {
  const create = useCreateRegistrationInvitation(detail.id);
  const resend = useResendRegistrationInvitation(detail.id);
  const revoke = useRevokeRegistrationInvitation(detail.id);
  const [emails, setEmails] = useState<Record<number, string>>({});
  const [rawInvitation, setRawInvitation] = useState<
    InvitationMutation | undefined
  >();
  const [copied, setCopied] = useState(false);
  const presentation = rosterReadinessPresentation(detail);

  const mutationError = create.error ?? resend.error ?? revoke.error;
  const saveRaw = (invitation: InvitationMutation) => {
    setRawInvitation(invitation);
    setCopied(false);
  };
  const clearRaw = () => {
    setRawInvitation(undefined);
    setCopied(false);
    create.reset();
    resend.reset();
  };
  const copyLink = async () => {
    if (!rawInvitation || copied) return;
    const url = invitationUrl(rawInvitation);
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setRawInvitation(undefined);
    create.reset();
    resend.reset();
  };

  return (
    <section className="mt-5 rounded-2xl border border-brand-blue/10 bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-brand-navy">
            Participant roster
          </h2>
          <p className="mt-1 text-sm text-brand-slate">
            {detail.readiness.claimedSeatCount} of {detail.readiness.seatCount}{" "}
            seats claimed · {detail.readiness.completedResponseCount} of{" "}
            {detail.readiness.requiredResponseCount} required responses complete
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${presentation.rosterComplete ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}
        >
          {presentation.badge}
        </span>
      </div>
      <p className="mt-3 rounded-lg bg-brand-pale p-3 text-sm text-brand-navy">{presentation.workflow}</p>
      {presentation.showSubmissionBlockers &&
        detail.readiness.blockerCodes.length > 0 && (
          <p className="mt-3 text-sm text-amber-900">
            Before you can submit:{" "}
            {detail.readiness.blockerCodes
              .join(", ")
              .replaceAll("_", " ")
              .toLowerCase()}
            .
          </p>
        )}
      {detail.memberDeadlineAt && (
        <p className="mt-4 rounded-lg bg-brand-pale p-3 text-sm text-brand-navy">
          Members must join and finish their responses by{" "}
          <strong>
            {new Intl.DateTimeFormat("en-ID", {
              dateStyle: "full",
              timeStyle: "short",
            }).format(new Date(detail.memberDeadlineAt))}
          </strong>
          .
        </p>
      )}
      {rawInvitation && !copied && invitationUrl(rawInvitation) && (
        <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-950">
          <p className="font-bold">Invitation link ready</p>
          <p className="mt-1">
            This link is shown once. Copy it now and send it securely to{" "}
            {rawInvitation.email}.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => void copyLink()}>
              Copy one-time invitation link
            </Button>
            <Button variant="outline" onClick={clearRaw}>
              Dismiss link
            </Button>
          </div>
        </div>
      )}
      <div className="mt-5 space-y-3">
        {detail.roster.map((slot) => (
          <article
            key={slot.position}
            className="rounded-xl border border-brand-blue/10 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-brand-navy">
                  Seat {slot.position + 1}
                  {slot.isBuyer ? " · Buyer" : slot.isSelf ? " · You" : ""}
                </p>
                <p className="mt-1 text-sm text-brand-slate">
                  {slot.name ?? slot.email ?? "No participant assigned"} ·{" "}
                  {slot.status.replaceAll("_", " ")}
                </p>
              </div>
              {!slot.isBuyer &&
                slot.invitationId &&
                slot.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={resend.isPending || revoke.isPending}
                      onClick={() =>
                        resend.mutate(
                          { invitationId: slot.invitationId! },
                          {
                            onSuccess: (invitation) => {
                              saveRaw(invitation);
                              resend.reset();
                            },
                          },
                        )
                      }
                    >
                      Resend
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-700"
                      disabled={resend.isPending || revoke.isPending}
                      onClick={() => revoke.mutate(slot.invitationId!)}
                    >
                      Revoke
                    </Button>
                  </div>
                )}
            </div>
            {!slot.isBuyer &&
              slot.status !== "PENDING" &&
              slot.status !== "READY" &&
              slot.status !== "ACCEPTED" && (
                <form
                  className="mt-3 flex flex-col gap-2 sm:flex-row"
                  onSubmit={(event) => {
                    event.preventDefault();
                    create.mutate(
                      {
                        position: slot.position,
                        email: emails[slot.position] ?? "",
                      },
                      {
                        onSuccess: (invitation) => {
                          saveRaw(invitation);
                          create.reset();
                        },
                      },
                    );
                  }}
                >
                  <label
                    className="sr-only"
                    htmlFor={`invite-${slot.position}`}
                  >
                    Email for seat {slot.position + 1}
                  </label>
                  <input
                    id={`invite-${slot.position}`}
                    type="email"
                    required
                    value={emails[slot.position] ?? ""}
                    onChange={(event) =>
                      setEmails((old) => ({
                        ...old,
                        [slot.position]: event.target.value,
                      }))
                    }
                    placeholder="participant@example.com"
                    className="min-h-11 flex-1 rounded-lg border border-brand-blue/20 px-3"
                  />
                  <Button disabled={create.isPending} type="submit">
                    {create.isPending ? "Inviting..." : "Create invitation"}
                  </Button>
                </form>
              )}
          </article>
        ))}
      </div>
      {mutationError && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {parseApiError(mutationError).message}
        </p>
      )}
    </section>
  );
}
