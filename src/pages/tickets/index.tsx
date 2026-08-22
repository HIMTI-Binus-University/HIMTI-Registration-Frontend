import { ArrowRight, CalendarDays, Ticket as TicketIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useMyTickets } from "@/api/tickets/queries";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { effectiveTicketStatus, ticketStatusCopy } from "./status";

const date = (value: string) =>
  new Intl.DateTimeFormat("en-ID", { dateStyle: "full", timeStyle: "short" }).format(new Date(value));

export default function TicketsPage() {
  const query = useMyTickets();
  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <AppHeader />
        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-blue">Entry passes</p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">My tickets</h1>
          <p className="mt-2 max-w-2xl text-brand-slate">Only tickets assigned to your account appear here. A group buyer cannot open another attendee's ticket.</p>
        </div>
        {query.isPending && <div role="status" aria-label="Loading tickets" className="mt-6 h-48 animate-pulse rounded-2xl bg-brand-blue/10" />}
        {query.isError && <section className="mt-6 rounded-2xl bg-white p-6"><p role="alert" className="text-red-700">Your tickets could not be loaded.</p><Button className="mt-4" onClick={() => void query.refetch()}>Try again</Button></section>}
        {query.data?.length === 0 && <section className="mt-6 rounded-2xl border border-dashed border-brand-blue/20 bg-white p-8 text-center"><TicketIcon className="mx-auto size-8 text-brand-blue" /><h2 className="mt-3 text-xl font-bold text-brand-navy">No tickets yet</h2><p className="mt-2 text-brand-slate">Approved registrations will appear here when your ticket is issued.</p><Button asChild variant="outline" className="mt-5"><Link to="/registrations">View registrations</Link></Button></section>}
        {query.data && query.data.length > 0 && <div className="mt-6 grid gap-4 sm:grid-cols-2">{query.data.map((ticket) => { const copy = ticketStatusCopy[effectiveTicketStatus(ticket)]; return <Link key={ticket.id} to={`/tickets/${encodeURIComponent(ticket.id)}`} className="group rounded-2xl border border-brand-blue/10 bg-white p-5 shadow-sm transition hover:border-brand-blue/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${copy.tone}`}>{copy.label}</span><h2 className="mt-4 text-xl font-bold text-brand-navy">{ticket.subEvent.name}</h2><p className="mt-3 flex gap-2 text-sm text-brand-slate"><CalendarDays className="size-4 shrink-0" />{date(ticket.subEvent.date)}</p><span className="mt-5 inline-flex items-center gap-2 font-bold text-brand-blue">View my ticket <ArrowRight className="size-4" /></span></Link>; })}</div>}
      </div>
    </main>
  );
}
