import { ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  useMyRegistrations,
  type RegistrationSummary,
} from "@/api/registrations/queries";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";

const editable = new Set(["DRAFT"]);
const date = (value: string) =>
  new Intl.DateTimeFormat("en-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function RegistrationsPage() {
  const [page, setPage] = useState(1);
  const query = useMyRegistrations(page);
  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <AppHeader />
        <section className="mt-10">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-blue">
            Your activity
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-brand-navy">
            My registrations
          </h1>
          <p className="mt-2 text-brand-slate">
            Review submitted registrations or continue drafts.
          </p>
        </section>
        {query.isPending && (
          <div role="status" className="mt-7 space-y-4">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-40 animate-pulse rounded-2xl bg-brand-blue/10"
              />
            ))}
          </div>
        )}
        {query.isError && (
          <State title="Registrations could not be loaded">
            <Button variant="outline" onClick={() => void query.refetch()}>
              Try again
            </Button>
          </State>
        )}
        {query.data &&
          (query.data.data.length ? (
            <div className="mt-7 space-y-4">
              {query.data.data.map((item) => (
                <Card key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <State title="No registrations yet">
              <p>Browse events and choose an activity to get started.</p>
              <Button asChild className="mt-4">
                <Link to="/events">Explore events</Link>
              </Button>
            </State>
          ))}
        {query.data && query.data.meta.totalPages > 1 && (
          <nav
            aria-label="Registration pages"
            className="mt-7 flex items-center justify-center gap-4"
          >
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-brand-slate">
              Page {query.data.meta.page} of {query.data.meta.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= query.data.meta.totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </nav>
        )}
      </div>
    </main>
  );
}

function Card({ item }: { item: RegistrationSummary }) {
  return (
    <article className="rounded-2xl border border-brand-blue/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Status value={item.status} />
            <span className="text-xs font-semibold text-brand-slate">
              {item.orderNumber}
            </span>
          </div>
          <h2 className="mt-3 text-xl font-bold text-brand-navy">
            {item.subEvent.name}
          </h2>
          <p className="mt-1 text-sm text-brand-slate">
            {item.event.name} · {item.package.name}
          </p>
          <p className="mt-3 flex items-center gap-2 text-sm text-brand-slate">
            <CalendarDays className="size-4 text-brand-blue" />
            {date(item.subEvent.date)}
          </p>
          <p className="mt-2 text-xs font-semibold text-emerald-700">
            Free · no payment required
          </p>
        </div>
        <Button
          asChild
          variant={editable.has(item.status) ? "primary" : "outline"}
        >
          <Link to={`/registrations/${item.id}`}>
            {editable.has(item.status) ? "Resume" : "View"}
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
export function Status({ value }: { value: RegistrationSummary["status"] }) {
  return (
    <span className="rounded-full bg-brand-pale px-3 py-1 text-xs font-bold text-brand-blue">
      {value.replaceAll("_", " ")}
    </span>
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
    <section className="mt-7 rounded-2xl border border-dashed border-brand-blue/20 bg-white p-8 text-center">
      <h2 className="text-xl font-bold text-brand-navy">{title}</h2>
      <div className="mt-3 text-sm text-brand-slate">{children}</div>
    </section>
  );
}
