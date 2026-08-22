import { ArrowLeft, CalendarDays, Maximize2, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useMyTicket } from "@/api/tickets/queries";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { effectiveTicketStatus, isTicketPresentable, ticketStatusCopy } from "@/pages/tickets/status";

const date = (value: string) => new Intl.DateTimeFormat("en-ID", { dateStyle: "full", timeStyle: "short" }).format(new Date(value));

export default function TicketDetailPage() {
  const { ticketId = "" } = useParams();
  const query = useMyTicket(ticketId);
  const state = query.data ? effectiveTicketStatus(query.data) : null;
  const blocked = query.data?.checkInEligibility.state === "BLOCKED_BY_FORMS";
  const copy = state ? ticketStatusCopy[state] : null;
  const canPresent = query.data ? isTicketPresentable(query.data) : false;
  return <main className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8"><div className="mx-auto max-w-3xl"><AppHeader /><Link to="/tickets" className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-brand-blue"><ArrowLeft className="size-4" />My tickets</Link>
    {query.isPending && <div role="status" className="mt-4 h-96 animate-pulse rounded-2xl bg-brand-blue/10" />}
    {query.isError && <section className="mt-4 rounded-2xl bg-white p-8 text-center"><h1 className="text-2xl font-bold text-brand-navy">Ticket not available</h1><p className="mt-2 text-brand-slate">We could not find this ticket in your account.</p><Button className="mt-5" onClick={() => void query.refetch()}>Try again</Button></section>}
    {query.data && copy && <><section className="mt-4 overflow-hidden rounded-2xl bg-brand-navy p-6 text-white sm:p-8"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${copy.tone}`}>{copy.label}</span><h1 className="mt-5 text-3xl font-bold">{query.data.subEvent.name}</h1><p className="mt-4 flex gap-2 text-blue-100"><CalendarDays className="size-5 shrink-0" />{date(query.data.subEvent.date)}</p></section>
      <section className="mt-5 rounded-2xl border border-brand-blue/10 bg-white p-6 sm:p-8"><h2 className="text-xl font-bold text-brand-navy">{blocked ? "Form needed" : copy.label}</h2><p className="mt-2 text-brand-slate">{blocked ? "Complete the required attendee forms before presenting this ticket." : copy.detail}</p>{blocked && <div className="mt-5 space-y-3">{query.data.checkInEligibility.blockingForms.map((form) => <div key={form.assignmentId} className="rounded-xl bg-brand-pale p-4"><p className="font-bold text-brand-navy">{form.formName}</p><p className="mt-1 text-sm text-brand-slate">{form.availability.replaceAll("_", " ")} · {form.completion.replaceAll("_", " ")}</p>{form.canEdit && <Button asChild variant="outline" className="mt-3"><Link to={`/registrations/${encodeURIComponent(form.registrationId)}/post-registration/${encodeURIComponent(form.assignmentId)}`}>Open form</Link></Button>}</div>)}</div>}{canPresent && <Button asChild className="mt-6 w-full sm:w-auto"><Link to={`/tickets/${encodeURIComponent(query.data.id)}/present`}><Maximize2 className="mr-2 size-4" />Present QR code</Link></Button>}{state === "PENDING" && <Button variant="outline" className="mt-6" onClick={() => void query.refetch()}>Check again</Button>}</section>
      <section className="mt-5 rounded-2xl bg-brand-pale p-6 text-sm text-brand-slate"><h2 className="flex items-center gap-2 font-bold text-brand-navy"><ShieldCheck className="size-5" />Keep your ticket private</h2><p className="mt-2 leading-6">Your QR code is a private check-in credential. Show it only to event staff. Do not post screenshots or send it to anyone else.</p><p className="mt-2">The QR credential is fetched only when you open presentation mode.</p></section></>}
  </div></main>;
}
