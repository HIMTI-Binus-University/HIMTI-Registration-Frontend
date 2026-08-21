import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useAcceptInvitation,
  useDeclineInvitation,
  useInvitationContext,
} from "@/api/registrations/queries";
import { parseApiError } from "@/api/api-error";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { formatPackageAmount } from "@/utils/money";
import { consumeInvitationToken } from "./token";

const date = (value: string) =>
  new Intl.DateTimeFormat("en-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));

export default function RegistrationInvitationPage() {
  const [token, setToken] = useState(() =>
    consumeInvitationToken(window.location, window.history),
  );
  const [declined, setDeclined] = useState(false);
  const context = useInvitationContext(token);
  const accept = useAcceptInvitation(token);
  const decline = useDeclineInvitation(token);
  const navigate = useNavigate();
  useEffect(() => () => setToken(""), []);

  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <AppHeader />
        {!token && (
          <State title="Invitation link is incomplete">
            Ask the buyer for a new invitation link.
          </State>
        )}
        {token && context.isPending && (
          <State title="Checking your invitation">Please wait...</State>
        )}
        {token && context.isError && (
          <State title="Invitation unavailable">
            <p>{parseApiError(context.error).message}</p>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/registrations">My registrations</Link>
            </Button>
          </State>
        )}
        {context.data && !declined && (
          <section className="mt-10 overflow-hidden rounded-2xl border border-brand-blue/10 bg-white shadow-sm">
            <div className="bg-brand-navy p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
                Seat invitation
              </p>
              <h1 className="mt-3 text-3xl font-bold">
                {context.data.order.subEvent.name}
              </h1>
              <p className="mt-2 text-blue-100">
                {context.data.order.event.name} ·{" "}
                {date(context.data.order.subEvent.date)}
              </p>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-brand-slate">
                <strong className="text-brand-navy">
                  {context.data.order.buyer.name}
                </strong>{" "}
                invited you to seat {context.data.invitation.position + 1} in
                order {context.data.order.orderNumber}.
              </p>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <Info label="Package" value={context.data.order.package.name} />
                <Info
                  label="Package total"
                  value={formatPackageAmount(context.data.order.package)}
                />
                <Info
                  label="Exact seats"
                  value={String(context.data.order.package.seatCount)}
                />
                <Info
                  label="Invitation expires"
                  value={date(context.data.invitation.expiresAt)}
                />
              </dl>
              {(accept.isError || decline.isError) && (
                <p role="alert" className="mt-5 text-sm text-red-700">
                  {parseApiError(accept.error ?? decline.error).message}
                </p>
              )}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  disabled={accept.isPending || decline.isPending}
                  onClick={() =>
                    decline.mutate(undefined, {
                      onSuccess: () => {
                        setToken("");
                        setDeclined(true);
                        decline.reset();
                      },
                    })
                  }
                >
                  {decline.isPending ? "Declining..." : "Decline invitation"}
                </Button>
                <Button
                  disabled={accept.isPending || decline.isPending}
                  onClick={() =>
                    accept.mutate(undefined, {
                      onSuccess: (registration) => {
                        setToken("");
                        accept.reset();
                        navigate(`/registrations/${registration.id}`, {
                          replace: true,
                        });
                      },
                    })
                  }
                >
                  {accept.isPending ? "Accepting..." : "Accept and join"}
                </Button>
              </div>
            </div>
          </section>
        )}
        {declined && (
          <State title="Invitation declined">
            <p>The buyer can now invite another participant to this seat.</p>
            <Button asChild className="mt-5">
              <Link to="/registrations">My registrations</Link>
            </Button>
          </State>
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

function State({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto mt-12 max-w-xl rounded-2xl bg-white p-8 text-center">
      <h1 className="text-2xl font-bold text-brand-navy">{title}</h1>
      <div className="mt-3 text-sm text-brand-slate">{children}</div>
    </section>
  );
}
