import { CalendarDays, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { useMyEventTickets } from "@/api/event-tickets/queries";
import { AppHeader } from "@/components/layout/app-header";

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Schedule pending";

export default function TicketsPage() {
  const query = useMyEventTickets();
  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <AppHeader />
        <section className="mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-blue">
            Your credentials
          </p>
          <h1 className="mt-2 text-4xl font-bold text-brand-navy">
            Event tickets
          </h1>
          <p className="mt-2 text-brand-slate">
            Tickets appear after your registration is confirmed, even when
            attendance is not enabled.
          </p>
        </section>
        {query.isPending && (
          <p role="status" className="mt-8">
            Loading tickets...
          </p>
        )}
        {query.isError && (
          <p role="alert" className="mt-8 text-red-700">
            Tickets could not be loaded.
          </p>
        )}
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {query.data?.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="rounded-2xl border border-brand-blue/10 bg-white p-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Ticket className="size-7 text-brand-blue" />
              <h2 className="mt-4 text-xl font-bold text-brand-navy">
                {ticket.event.name}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-brand-slate">
                <CalendarDays className="size-4" />
                {date(ticket.event.startsAt)}
              </p>
              <p className="mt-4 text-sm font-bold text-brand-blue">
                {ticket.attendance?.checkedOutAt
                  ? "Checked out"
                  : ticket.attendance
                    ? "Checked in"
                    : "View ticket"}
              </p>
            </Link>
          ))}
        </div>
        {query.isSuccess && !query.data.length && (
          <p className="mt-8 rounded-2xl border border-dashed bg-white p-8 text-center text-brand-slate">
            No active confirmed tickets yet.
          </p>
        )}
      </div>
    </main>
  );
}
