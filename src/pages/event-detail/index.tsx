import { ArrowLeft, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { usePublicEvent } from "@/api/events/queries";
import { EventImage } from "@/components/event-image";
import { AppHeader } from "@/components/layout/app-header";
import { ResourceMarkdown } from "@/components/resource-markdown";
import { Button } from "@/components/ui/button";
import { getSafeHttpUrl } from "@/utils/http-url";

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-ID", {
        dateStyle: "full",
        timeStyle: "short",
      }).format(new Date(value))
    : "Schedule coming soon";

export default function EventDetailPage() {
  const { eventId = "" } = useParams();
  const query = usePublicEvent(eventId);
  const location = getSafeHttpUrl(query.data?.locationUrl);
  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <AppHeader />
        <Link
          to="/events"
          className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-brand-blue"
        >
          <ArrowLeft className="size-4" />
          All events
        </Link>
        {query.isPending && (
          <div
            role="status"
            aria-label="Loading event"
            className="mt-4 h-96 animate-pulse rounded-2xl bg-brand-blue/10"
          />
        )}
        {query.isError && (
          <Panel title="Event could not be loaded">
            <Button variant="outline" onClick={() => void query.refetch()}>
              Try again
            </Button>
          </Panel>
        )}
        {query.data && (
          <>
            <section className="mt-3 overflow-hidden rounded-2xl border border-brand-blue/10 bg-white shadow-sm">
              <EventImage
                src={
                  query.data.coverImageUrl ??
                  query.data.eventGroup?.coverImageUrl
                }
                alt={`${query.data.name} cover`}
                className="h-56 sm:h-80"
              />
              <div className="p-6 sm:p-8">
                {query.data.eventGroup && (
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-blue">
                    {query.data.eventGroup.name}
                  </p>
                )}
                <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-navy sm:text-4xl">
                  {query.data.name}
                </h1>
                {query.data.publicDescription ? (
                  <ResourceMarkdown className="mt-4 leading-7 text-brand-slate">
                    {query.data.publicDescription}
                  </ResourceMarkdown>
                ) : (
                  <p className="mt-4 text-brand-slate">
                    More information is coming soon.
                  </p>
                )}
                <div className="mt-6 grid gap-3 rounded-2xl bg-brand-pale p-5 text-sm text-brand-slate sm:grid-cols-2">
                  <p className="flex gap-2">
                    <CalendarDays className="size-5 shrink-0 text-brand-blue" />
                    {date(query.data.startsAt)}
                  </p>
                  <p className="flex gap-2">
                    <MapPin className="size-5 shrink-0 text-brand-blue" />
                    {location ? (
                      <a
                        href={location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand-blue hover:underline"
                      >
                        {query.data.locationName || "View location"}
                        <ExternalLink className="ml-1 inline size-3" />
                      </a>
                    ) : (
                      query.data.locationName ||
                      query.data.locationAddress ||
                      "Location coming soon"
                    )}
                  </p>
                </div>
              </div>
            </section>
            <section className="my-8 rounded-2xl border border-brand-blue/10 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-bold text-brand-navy">
                Registration coming soon
              </h2>
              <p className="mt-2 text-brand-slate">
                Registration actions are not available during this platform
                update. Event discovery remains open.
              </p>
              <Button disabled className="mt-5">
                Registration not yet available
              </Button>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 rounded-2xl bg-white p-8 text-center">
      <h1 className="text-2xl font-bold text-brand-navy">{title}</h1>
      <div className="mt-4">{children}</div>
    </section>
  );
}
