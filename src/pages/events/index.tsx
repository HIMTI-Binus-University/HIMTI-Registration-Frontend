import { ArrowRight, CalendarDays, Layers3, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { usePublicEventGroups, usePublicEvents } from "@/api/events/queries";
import { EventImage } from "@/components/event-image";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Schedule coming soon";

export default function EventsPage() {
  const groups = usePublicEventGroups();
  const events = usePublicEvents();
  const pending = groups.isPending || events.isPending;
  const failed = groups.isError || events.isError;

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
            Discover published event groups and their upcoming experiences.
          </p>
        </section>
        {pending && (
          <div
            role="status"
            className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-2xl bg-brand-blue/10"
              />
            ))}
          </div>
        )}
        {failed && (
          <State title="Events could not be loaded">
            <Button
              variant="outline"
              onClick={() =>
                void Promise.all([groups.refetch(), events.refetch()])
              }
            >
              Try again
            </Button>
          </State>
        )}
        {!pending && !failed && groups.data?.length ? (
          <section className="mt-10" aria-labelledby="groups-title">
            <h2
              id="groups-title"
              className="text-2xl font-bold text-brand-navy"
            >
              Event groups
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {groups.data.map((group) => (
                <Link
                  key={group.id}
                  to={`/event-groups/${encodeURIComponent(group.id)}`}
                  className="overflow-hidden rounded-2xl border border-brand-blue/10 bg-white shadow-sm"
                >
                  <EventImage
                    src={group.coverImageUrl}
                    alt={`${group.name} cover`}
                    className="h-40"
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-brand-navy">
                      {group.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-brand-slate">
                      {group.publicDescription || "Details are coming soon."}
                    </p>
                    <p className="mt-4 flex items-center gap-2 text-sm font-bold text-brand-blue">
                      <Layers3 className="size-4" />
                      {group.events.length} events
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
        {!pending && !failed && (
          <section className="mt-10 pb-8" aria-labelledby="events-title">
            <h2
              id="events-title"
              className="text-2xl font-bold text-brand-navy"
            >
              Events
            </h2>
            {events.data?.length ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {events.data.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${encodeURIComponent(event.id)}`}
                    className="group overflow-hidden rounded-2xl border border-brand-blue/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <EventImage
                      src={
                        event.coverImageUrl ?? event.eventGroup?.coverImageUrl
                      }
                      alt={`${event.name} cover`}
                      className="h-44"
                    />
                    <div className="p-5">
                      {event.eventGroup && (
                        <p className="text-xs font-bold uppercase tracking-wide text-brand-blue">
                          {event.eventGroup.name}
                        </p>
                      )}
                      <h3 className="mt-1 text-xl font-bold text-brand-navy">
                        {event.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-brand-slate">
                        {event.publicDescription || "Details are coming soon."}
                      </p>
                      <div className="mt-4 space-y-1.5 text-xs text-brand-slate">
                        <p className="flex items-center gap-2">
                          <CalendarDays className="size-4 text-brand-blue" />
                          {date(event.startsAt)}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="size-4 text-brand-blue" />
                          {event.locationName || "Location coming soon"}
                        </p>
                      </div>
                      <span className="mt-5 flex items-center justify-end gap-1 text-sm font-bold text-brand-blue">
                        View details <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <State title="No events yet">
                <p>Published events will appear here.</p>
              </State>
            )}
          </section>
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
