import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { usePublicEventGroup } from "@/api/events/queries";
import { EventImage } from "@/components/event-image";
import { AppHeader } from "@/components/layout/app-header";

export default function EventGroupPage() {
  const { eventGroupId = "" } = useParams();
  const query = usePublicEventGroup(eventGroupId);
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
          <p role="status" className="mt-8">
            Loading event group...
          </p>
        )}
        {query.isError && (
          <p role="alert" className="mt-8 text-red-700">
            Event group could not be loaded.
          </p>
        )}
        {query.data && (
          <>
            <section className="mt-4 overflow-hidden rounded-3xl bg-brand-navy text-white">
              <EventImage
                src={query.data.coverImageUrl}
                alt={`${query.data.name} cover`}
                className="h-56 sm:h-72"
              />
              <div className="p-6 sm:p-9">
                <h1 className="text-4xl font-bold">{query.data.name}</h1>
                <p className="mt-3 max-w-3xl text-blue-100">
                  {query.data.publicDescription ||
                    "Explore events in this group."}
                </p>
              </div>
            </section>
            <section className="my-8">
              <h2 className="text-2xl font-bold text-brand-navy">Events</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {query.data.events.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="rounded-2xl border bg-white p-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <h3 className="text-xl font-bold text-brand-navy">
                      {event.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-brand-slate">
                      {event.publicDescription || "Details coming soon."}
                    </p>
                    <span className="mt-5 flex items-center gap-1 font-bold text-brand-blue">
                      View event <ArrowRight className="size-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
