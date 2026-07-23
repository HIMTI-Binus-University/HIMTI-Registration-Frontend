import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { usePublishedEvents, type MemberSubevent } from "@/api/events/queries";
import { EventImage } from "@/components/event-image";
import { ResourceMarkdown } from "@/components/resource-markdown";
import { Button } from "@/components/ui/button";
import { getSafeHttpUrl } from "@/utils/http-url";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));

const formatPrice = (value: number) =>
  value === 0
    ? "Free"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(value);

export default function EventDetailPage() {
  const { eventId = "" } = useParams();
  const eventsQuery = usePublishedEvents();
  const event = eventsQuery.data?.find((item) => item.id === eventId);

  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/dashboard"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-brand-blue hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>

        {eventsQuery.isPending && <EventDetailLoading />}
        {eventsQuery.isError && (
          <StatePanel title="Event could not be loaded">
            <p className="text-sm text-brand-slate">
              We could not retrieve this event. Please try again.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void eventsQuery.refetch()}
            >
              Try again
            </Button>
          </StatePanel>
        )}
        {eventsQuery.isSuccess && !event && (
          <StatePanel title="Event not found">
            <p className="text-sm text-brand-slate">
              This event may no longer be published or the link is incorrect.
            </p>
          </StatePanel>
        )}
        {event && (
          <>
            <section className="mt-5 overflow-hidden rounded-3xl bg-brand-navy text-white shadow-lg sm:mt-7">
              <EventImage
                src={event.coverImageUrl}
                alt={`${event.name} cover`}
                className="h-52 sm:h-80"
              />
              <div className="relative p-6 sm:p-9">
                <div className="absolute -right-12 -top-16 size-52 rounded-full bg-brand-blue/30 blur-3xl" />
                <div className="relative max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-sky">
                    Published event
                  </p>
                  <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
                    {event.name}
                  </h1>
                  {event.publicDescription ? (
                    <ResourceMarkdown className="mt-4 text-sm leading-7 text-blue-100 sm:text-base">
                      {event.publicDescription}
                    </ResourceMarkdown>
                  ) : (
                    <p className="mt-4 text-sm text-blue-100">
                      Event details will be available soon.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section aria-labelledby="activities-title" className="py-10">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-brand-blue">Program</p>
                  <h2
                    id="activities-title"
                    className="mt-1 text-2xl font-bold tracking-[-0.03em] text-brand-navy sm:text-3xl"
                  >
                    Event activities
                  </h2>
                </div>
                <span className="rounded-full bg-brand-pale px-3 py-1.5 text-sm font-bold text-brand-blue">
                  {event.subevents.length} total
                </span>
              </div>
              {event.subevents.length ? (
                <div className="mt-5 space-y-5">
                  {[...event.subevents]
                    .sort((a, b) => a.position - b.position)
                    .map((subevent, index) => (
                      <SubeventCard
                        key={subevent.id}
                        subevent={subevent}
                        number={index + 1}
                      />
                    ))}
                </div>
              ) : (
                <p className="mt-5 rounded-2xl border border-dashed border-brand-blue/20 bg-white p-6 text-sm text-brand-slate">
                  No activities have been published for this event yet.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function SubeventCard({
  subevent,
  number,
}: {
  subevent: MemberSubevent;
  number: number;
}) {
  const destinationUrl = getSafeHttpUrl(subevent.destinationUrl);

  return (
    <article className="grid overflow-hidden rounded-2xl border border-brand-blue/10 bg-white shadow-sm md:grid-cols-[15rem_1fr]">
      <EventImage
        src={subevent.posterUrl}
        alt={`${subevent.name} poster`}
        className="h-48 md:h-full md:min-h-72"
      />
      <div className="flex flex-col p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-pale text-sm font-bold text-brand-blue">
            {number}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-blue">
              {subevent.type.replaceAll("_", " ")}
            </p>
            <h3 className="mt-1 text-xl font-bold text-brand-navy sm:text-2xl">
              {subevent.name}
            </h3>
          </div>
        </div>
        {subevent.publicDescription && (
          <ResourceMarkdown className="mt-4 text-sm leading-6 text-brand-slate">
            {subevent.publicDescription}
          </ResourceMarkdown>
        )}
        <div className="mt-5 grid gap-3 text-sm text-brand-slate sm:grid-cols-2">
          <Detail icon={CalendarDays}>{formatDate(subevent.date)}</Detail>
          <Detail icon={MapPin}>{subevent.locationName || "Online"}</Detail>
          <Detail icon={Ticket}>{formatPrice(subevent.price)}</Detail>
          <Detail icon={Users}>
            {subevent.maxParticipants
              ? `${subevent.maxParticipants} participant capacity`
              : "No capacity listed"}
          </Detail>
        </div>
        <div className="mt-auto flex justify-end pt-6">
          {destinationUrl && (
            <Button asChild className="min-h-11 w-full sm:w-auto">
              <a
                href={destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Register <ExternalLink className="ml-2 size-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function Detail({
  icon: Icon,
  children,
}: {
  icon: typeof CalendarDays;
  children: string;
}) {
  return (
    <span className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-brand-blue" /> {children}
    </span>
  );
}

function StatePanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-7 rounded-2xl border border-brand-blue/10 bg-white p-8 text-center">
      <h1 className="text-2xl font-bold text-brand-navy">{title}</h1>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function EventDetailLoading() {
  return (
    <div role="status" aria-label="Loading event" className="mt-7 space-y-5">
      <div className="h-96 animate-pulse rounded-3xl bg-brand-blue/10 motion-reduce:animate-none" />
      <div className="h-72 animate-pulse rounded-2xl bg-brand-blue/10 motion-reduce:animate-none" />
    </div>
  );
}
