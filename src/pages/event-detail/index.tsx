import { ArrowLeft, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { usePublicEvent, type PublicSubEvent } from "@/api/events/queries";
import { EventImage } from "@/components/event-image";
import { AppHeader } from "@/components/layout/app-header";
import { ResourceMarkdown } from "@/components/resource-markdown";
import { Button } from "@/components/ui/button";
import { getSafeHttpUrl } from "@/utils/http-url";

const date = (value: string) =>
  new Intl.DateTimeFormat("en-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));

export default function EventDetailPage() {
  const { eventId = "" } = useParams();
  const query = usePublicEvent(eventId);
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
                src={query.data.coverImageUrl}
                alt={`${query.data.name} cover`}
                className="h-56 sm:h-80"
              />
              <div className="p-6 sm:p-8">
                <h1 className="text-3xl font-bold tracking-[-0.04em] text-brand-navy sm:text-4xl">
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
              </div>
            </section>
            <section className="py-10">
              <h2 className="text-2xl font-bold text-brand-navy">
                Choose an activity
              </h2>
              <p className="mt-1 text-sm text-brand-slate">
                Registration availability is checked securely when you continue.
              </p>
              <div className="mt-5 space-y-4">
                {[...query.data.subEvents]
                  .sort((a, b) => +new Date(a.date) - +new Date(b.date))
                  .map((item) => (
                    <SubEvent key={item.id} eventId={eventId} item={item} />
                  ))}
              </div>
              {!query.data.subEvents.length && (
                <p className="mt-5 rounded-2xl border border-dashed p-6 text-brand-slate">
                  No public activities are available.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function SubEvent({
  item,
  eventId,
}: {
  item: PublicSubEvent;
  eventId: string;
}) {
  const location = getSafeHttpUrl(item.locationUrl);
  const externalDestination =
    item.registrationMode === "EXTERNAL"
      ? getSafeHttpUrl(item.destinationUrl)
      : null;
  const nativeOpen =
    item.registrationMode === "INTERNAL" && item.isRegistrationOpen;
  const availability =
    item.registrationMode === "EXTERNAL"
      ? externalDestination
        ? "External registration"
        : "External registration link unavailable"
      : item.registrationMode === "INTERNAL"
        ? item.isRegistrationOpen
          ? "Registration open on this site"
          : "Native registration closed"
        : "Registration disabled";
  return (
    <article className="grid overflow-hidden rounded-2xl border border-brand-blue/10 bg-white shadow-sm sm:grid-cols-[12rem_1fr]">
      <EventImage
        src={item.posterUrl}
        alt={`${item.name} poster`}
        className="h-44 sm:h-full"
      />
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-pale px-3 py-1 text-xs font-bold text-brand-blue">
            {item.type.replaceAll("_", " ")}
          </span>
          <span className="text-xs font-semibold text-brand-slate">
            {availability}
          </span>
        </div>
        <h3 className="mt-3 text-xl font-bold text-brand-navy">{item.name}</h3>
        {item.publicDescription && (
          <ResourceMarkdown className="mt-2 text-sm leading-6 text-brand-slate">
            {item.publicDescription}
          </ResourceMarkdown>
        )}
        <div className="mt-4 grid gap-2 text-sm text-brand-slate md:grid-cols-2">
          <p className="flex gap-2">
            <CalendarDays className="size-4 shrink-0 text-brand-blue" />
            {date(item.date)}
          </p>
          <p className="flex gap-2">
            <MapPin className="size-4 shrink-0 text-brand-blue" />
            {location ? (
              <a
                href={location}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-blue hover:underline"
              >
                {item.locationName || "View location"}
                <ExternalLink className="ml-1 inline size-3" />
              </a>
            ) : (
              item.locationName || "Online"
            )}
          </p>
        </div>
        <div className="mt-5">
          {externalDestination ? (
            <Button asChild>
              <a
                href={externalDestination}
                target="_blank"
                rel="noopener noreferrer"
              >
                Register on external site <ExternalLink className="size-4" />
              </a>
            </Button>
          ) : (
            <Button asChild={nativeOpen} disabled={!nativeOpen}>
              {nativeOpen ? (
                <Link
                  to={`/events/${encodeURIComponent(eventId)}/subevents/${encodeURIComponent(item.id)}/register`}
                >
                  Continue to registration
                </Link>
              ) : (
                "Registration unavailable"
              )}
            </Button>
          )}
          {item.registrationMode === "EXTERNAL" && externalDestination && (
            <p className="mt-2 text-xs text-brand-slate">
              You will leave this site to complete registration.
            </p>
          )}
        </div>
      </div>
    </article>
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
