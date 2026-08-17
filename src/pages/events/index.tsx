import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { usePublicEvents } from "@/api/events/queries";
import { EventImage } from "@/components/event-image";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";

const date = (value: string) =>
  new Intl.DateTimeFormat("en-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const query = usePublicEvents(page);
  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <AppHeader />
        <section className="mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-blue">
            Open to explore
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-brand-navy sm:text-5xl">
            HIMTI events
          </h1>
          <p className="mt-3 max-w-2xl text-brand-slate">
            Discover workshops, gatherings, and experiences. You can browse
            without signing in.
          </p>
        </section>
        {query.isPending && (
          <div
            role="status"
            className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 animate-pulse rounded-2xl bg-brand-blue/10"
              />
            ))}
          </div>
        )}
        {query.isError && (
          <State title="Events could not be loaded">
            <Button variant="outline" onClick={() => void query.refetch()}>
              Try again
            </Button>
          </State>
        )}
        {query.isSuccess && !query.data.data.length && (
          <State title="No events yet">
            <p>Published events will appear here.</p>
          </State>
        )}
        {query.data?.data.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {query.data.data.map((event) => {
              const next = [...event.subEvents].sort(
                (a, b) => +new Date(a.date) - +new Date(b.date),
              )[0];
              return (
                <Link
                  key={event.id}
                  to={`/events/${encodeURIComponent(event.id)}`}
                  className="group overflow-hidden rounded-2xl border border-brand-blue/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <EventImage
                    src={event.coverImageUrl}
                    alt={`${event.name} cover`}
                    className="h-44"
                  />
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-brand-navy">
                      {event.name}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-brand-slate">
                      {event.publicDescription || "Details are coming soon."}
                    </p>
                    {next && (
                      <div className="mt-4 space-y-1.5 text-xs text-brand-slate">
                        <p className="flex items-center gap-2">
                          <CalendarDays className="size-4 text-brand-blue" />
                          {date(next.date)}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="size-4 text-brand-blue" />
                          {next.locationName || "Online"}
                        </p>
                      </div>
                    )}
                    <span className="mt-5 flex items-center justify-between text-sm font-bold text-brand-blue">
                      <span>{event.subEvents.length} activities</span>
                      <span className="flex items-center gap-1">
                        View <ArrowRight className="size-4" />
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}
        {query.data && query.data.meta.totalPages > 1 && (
          <nav
            aria-label="Event pages"
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

function State({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-2xl border border-dashed border-brand-blue/20 bg-white p-8 text-center">
      <h2 className="text-xl font-bold text-brand-navy">{title}</h2>
      <div className="mt-3 text-sm text-brand-slate">{children}</div>
    </section>
  );
}
