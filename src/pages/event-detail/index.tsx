import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { usePublishedEvents, type MemberSubevent } from "@/api/events/queries";
import { EventImage } from "@/components/event-image";
import { AppHeader } from "@/components/layout/app-header";
import { ResourceMarkdown } from "@/components/resource-markdown";
import { Button } from "@/components/ui/button";
import { gsap, motionEase, useGSAP } from "@/lib/motion";
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
  const pageRef = useRef<HTMLElement>(null);
  const [selectedSubevent, setSelectedSubevent] = useState<MemberSubevent | null>(null);

  useGSAP(
    () => {
      if (!event) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.from("[data-event-motion]", {
        opacity: 0,
        y: reduce ? 0 : 14,
        duration: reduce ? 0.01 : 0.38,
        stagger: reduce ? 0 : 0.07,
        ease: motionEase,
      });
    },
    { scope: pageRef, dependencies: [event], revertOnUpdate: true },
  );

  return (
    <main
      ref={pageRef}
      className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8"
    >
      <div className="mx-auto max-w-6xl">
        <AppHeader />
        <Link
          to="/dashboard"
          data-event-motion
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-brand-blue hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:mt-8"
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
            <section
              data-event-motion
              className="mt-3 overflow-hidden rounded-2xl border border-brand-blue/10 bg-white shadow-sm"
            >
              <EventImage
                src={event.coverImageUrl}
                alt={`${event.name} cover`}
                className="h-52 sm:h-80"
              />
              <div className="max-w-4xl p-6 sm:p-8">
                <h1 className="text-3xl font-bold tracking-[-0.04em] text-brand-navy sm:text-4xl">
                  {event.name}
                </h1>
                {event.publicDescription ? (
                  <ResourceMarkdown className="mt-4 text-sm leading-7 text-brand-slate sm:text-base">
                    {event.publicDescription}
                  </ResourceMarkdown>
                ) : (
                  <p className="mt-4 text-sm text-brand-slate">
                    Event details will be available soon.
                  </p>
                )}
              </div>
            </section>

            <section aria-labelledby="subevents-title" className="py-10">
              <div data-event-motion className="flex items-end justify-between gap-4">
                <div>
                  <h2
                    id="subevents-title"
                    className="text-2xl font-bold tracking-[-0.03em] text-brand-navy sm:text-3xl"
                  >
                    Sub-events
                  </h2>
                  <p className="mt-1 text-sm text-brand-slate">
                    Choose an activity and review its schedule and registration details.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-pale px-3 py-1.5 text-sm font-bold text-brand-blue">
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
                         onViewDetails={() => setSelectedSubevent(subevent)}
                       />
                    ))}
                </div>
              ) : (
                <p
                  data-event-motion
                  className="mt-5 rounded-2xl border border-dashed border-brand-blue/20 bg-white p-6 text-sm text-brand-slate"
                >
                  No sub-events have been published for this event yet.
                </p>
              )}
            </section>
          </>
        )}
      </div>
      {selectedSubevent && (
        <SubeventDialog
          subevent={selectedSubevent}
          onClose={() => setSelectedSubevent(null)}
        />
      )}
    </main>
  );
}

function SubeventCard({
  subevent,
  number,
  onViewDetails,
}: {
  subevent: MemberSubevent;
  number: number;
  onViewDetails: () => void;
}) {
  const destinationUrl = getSafeHttpUrl(subevent.destinationUrl);
  const locationUrl = getSafeHttpUrl(subevent.locationUrl);

  return (
    <article data-event-motion className="overflow-hidden rounded-2xl border border-brand-blue/10 bg-white shadow-sm">
      <div className="flex">
        <EventImage src={subevent.posterUrl} alt={`${subevent.name} poster`} className="hidden w-48 shrink-0 sm:grid lg:w-56" />
        <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-pale text-xs font-bold text-brand-blue">{number}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-brand-blue">{subevent.type.replaceAll("_", " ")}</p>
              <h3 className="mt-1 text-lg font-bold leading-snug text-brand-navy">{subevent.name}</h3>
            </div>
          </div>
          {subevent.publicDescription && <ResourceMarkdown className="mt-3 line-clamp-3 text-sm leading-6 text-brand-slate">{subevent.publicDescription}</ResourceMarkdown>}
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <DetailCard icon={CalendarDays} label="Date">{formatDate(subevent.date)}</DetailCard>
            <DetailCard icon={MapPin} label="Location">
              {locationUrl ? <a href={locationUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-blue hover:underline focus:outline-none focus:ring-2 focus:ring-ring">{subevent.locationName || "View location"}</a> : subevent.locationName || "Online"}
            </DetailCard>
            <DetailCard icon={Ticket} label="Price">{formatPrice(subevent.price)}</DetailCard>
            <DetailCard icon={Users} label="Capacity">{subevent.maxParticipants ? `${subevent.maxParticipants} spots` : "Open capacity"}</DetailCard>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
            <Button type="button" variant="outline" className="min-h-11 flex-1" onClick={onViewDetails}>View full details</Button>
            {destinationUrl ? <Button asChild className="min-h-11 flex-1"><a href={destinationUrl} target="_blank" rel="noopener noreferrer">Register <ExternalLink className="ml-2 size-4" /></a></Button> : <Button className="min-h-11 flex-1" disabled>Register unavailable</Button>}
          </div>
        </div>
      </div>
    </article>
  );
}

function DetailCard({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarDays;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-brand-blue/10 bg-brand-pale/30 p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-brand-blue">
        <Icon className="size-4" /> {label}
      </div>
      <div className="mt-1 text-sm leading-5 text-brand-slate">{children}</div>
    </div>
  );
}

function SubeventDialog({
  subevent,
  onClose,
}: {
  subevent: MemberSubevent;
  onClose: () => void;
}) {
  const destinationUrl = getSafeHttpUrl(subevent.destinationUrl);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog?.showModal) dialog.showModal();
    return () => {
      if (dialog?.close) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      open={!HTMLDialogElement.prototype.showModal}
      aria-labelledby="subevent-dialog-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-brand-blue/10 bg-white p-0 text-brand-navy shadow-2xl backdrop:bg-brand-navy/50"
    >
      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-brand-blue">{subevent.type.replaceAll("_", " ")}</p>
            <h2 id="subevent-dialog-title" className="mt-1 text-2xl font-bold tracking-[-0.03em]">{subevent.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close details" className="flex size-11 shrink-0 items-center justify-center rounded-lg p-0 text-2xl leading-none text-brand-slate hover:bg-brand-pale focus:outline-none focus:ring-2 focus:ring-ring">×</button>
        </div>
        {subevent.publicDescription ? <ResourceMarkdown className="mt-6 text-sm leading-7 text-brand-slate">{subevent.publicDescription}</ResourceMarkdown> : <p className="mt-6 text-sm text-brand-slate">No additional description is available.</p>}
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <DetailCard icon={CalendarDays} label="When">{formatDate(subevent.date)}</DetailCard>
          <DetailCard icon={MapPin} label="Where">{subevent.locationName || "Online"}</DetailCard>
          <DetailCard icon={Ticket} label="Price">{formatPrice(subevent.price)}</DetailCard>
          <DetailCard icon={Users} label="Capacity">{subevent.maxParticipants ? `${subevent.maxParticipants} spots` : "Open capacity"}</DetailCard>
        </div>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="min-h-11" onClick={onClose}>Close</Button>
          {destinationUrl ? <Button asChild className="min-h-11"><a href={destinationUrl} target="_blank" rel="noopener noreferrer">Register <ExternalLink className="ml-2 size-4" /></a></Button> : <Button className="min-h-11" disabled>Registration unavailable</Button>}
        </div>
      </div>
    </dialog>
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
      <div className="h-96 animate-pulse rounded-2xl bg-brand-blue/10 motion-reduce:animate-none" />
      <div className="h-72 animate-pulse rounded-2xl bg-brand-blue/10 motion-reduce:animate-none" />
    </div>
  );
}
