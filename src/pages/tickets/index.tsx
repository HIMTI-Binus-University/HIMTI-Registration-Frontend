import { CalendarDays, Ticket } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useMyEventTickets } from "@/api/event-tickets/queries";
import { AppHeader } from "@/components/layout/app-header";
import { gsap, useGSAP } from "@/lib/motion";

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Schedule pending";

export default function TicketsPage() {
  const query = useMyEventTickets();
  const pageRef = useRef<HTMLElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-dashboard-reveal]", { y: 12, autoAlpha: 0, duration: 0.45, stagger: 0.06, ease: "power3.out" });
    });
    return () => media.revert();
  }, { scope: pageRef });
  return (
    <main ref={pageRef} className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <AppHeader />
        <section data-dashboard-reveal className="mt-10">
          <h1 className="text-4xl font-bold tracking-[-0.04em] text-brand-navy sm:text-5xl">Event tickets</h1>
          <p className="mt-3 max-w-2xl text-brand-slate">Tickets appear after your registration is confirmed, even when attendance is not enabled.</p>
        </section>
        {query.isPending && (
          <p data-dashboard-reveal role="status" className="mt-8 rounded-2xl border border-dashed border-brand-blue/20 bg-white p-8 text-center text-sm text-brand-slate">
            Loading tickets...
          </p>
        )}
        {query.isError && (
          <p data-dashboard-reveal role="alert" className="mt-8 rounded-2xl border border-dashed border-red-200 bg-white p-8 text-center text-sm text-red-700">
            Tickets could not be loaded.
          </p>
        )}
        <div data-dashboard-reveal className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {query.data?.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="min-w-0 rounded-2xl border border-brand-blue/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Ticket className="size-7 text-brand-blue" />
              <h2 className="mt-4 break-words text-xl font-bold text-brand-navy">
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
          <p className="mt-8 rounded-2xl border border-dashed border-brand-blue/20 bg-white p-8 text-center text-brand-slate">
            No active confirmed tickets yet.
          </p>
        )}
      </div>
    </main>
  );
}
