import { ArrowLeft, Copy, Ticket } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Link, useParams } from "react-router-dom";
import {
  useMyEventTicket,
  useMyEventTicketCredential,
} from "@/api/event-tickets/queries";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";

const time = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("en-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Not recorded";

export default function TicketDetailPage() {
  const { ticketId = "" } = useParams();
  const ticket = useMyEventTicket(ticketId);
  const canCheckIn = Boolean(
    ticket.data?.status === "ACTIVE" && !ticket.data.attendance?.checkedInAt,
  );
  const credential = useMyEventTicketCredential(ticketId, canCheckIn);
  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <AppHeader />
        <Link
          to="/tickets"
          className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-brand-blue"
        >
          <ArrowLeft className="size-4" />
          All tickets
        </Link>
        {ticket.isPending && (
          <p role="status" className="mt-6">
            Loading ticket...
          </p>
        )}
        {(ticket.isError || !ticket.data) && !ticket.isPending && (
          <p role="alert" className="mt-6 text-red-700">
            Ticket could not be loaded.
          </p>
        )}
        {ticket.data && (
          <section className="mt-4 rounded-3xl border border-brand-blue/10 bg-white p-6 text-center shadow-sm sm:p-9">
            <Ticket className="mx-auto size-9 text-brand-blue" />
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-brand-blue">
              {ticket.data.attendance?.checkedInAt
                ? "Checked-in event ticket"
                : "Active event ticket"}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-brand-navy">
              {ticket.data.event.name}
            </h1>
            {canCheckIn && credential.isPending && (
              <p role="status" className="mt-7">
                Preparing secure ticket...
              </p>
            )}
            {canCheckIn && credential.isError && (
              <p role="alert" className="mt-7 text-red-700">
                The active credential could not be recovered.
              </p>
            )}
            {canCheckIn && credential.data && (
              <div className="mt-7">
                <div className="mx-auto w-fit rounded-2xl border bg-white p-4">
                  <QRCodeSVG
                    value={credential.data.qrPayload}
                    size={240}
                    level="M"
                    title={`${ticket.data.event.name} ticket QR code`}
                  />
                </div>
                <p className="mt-5 text-sm text-brand-slate">
                  If scanning is unavailable, show or enter this code:
                </p>
                <code className="mt-2 block break-all text-lg font-bold tracking-wider text-brand-navy">
                  {credential.data.credential}
                </code>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    void navigator.clipboard.writeText(
                      credential.data.credential,
                    )
                  }
                >
                  <Copy className="size-4" /> Copy code
                </Button>
              </div>
            )}
            <dl className="mt-8 grid gap-3 rounded-2xl bg-brand-pale p-5 text-left text-sm sm:grid-cols-2">
              <div>
                <dt className="font-bold text-brand-navy">Check-in</dt>
                <dd className="mt-1 text-brand-slate">
                  {time(ticket.data.attendance?.checkedInAt)}
                </dd>
              </div>
              {ticket.data.event.attendanceCheckoutEnabled && (
                <div>
                  <dt className="font-bold text-brand-navy">Check-out</dt>
                  <dd className="mt-1 text-brand-slate">
                    {time(ticket.data.attendance?.checkedOutAt)}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        )}
      </div>
    </main>
  );
}
