import {
  BookOpen,
  CalendarDays,
  ExternalLink,
  LogOut,
  Pencil,
  Ticket,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ResourceMarkdown } from "@/components/resource-markdown";
import { gsap, motionEase, useGSAP } from "@/lib/motion";
import { usePublishedEvents } from "@/api/events/queries";
import { useCurrentUser } from "@/api/users/queries";
import {
  useMembershipResources,
  useMembershipStatus,
} from "@/api/membership/queries";
import { signOut } from "@/api/auth";
import { getSafeHttpUrl } from "@/utils/http-url";

export default function DashboardPage() {
  const profileQuery = useCurrentUser();
  const eventsQuery = usePublishedEvents();
  const membershipStatus = useMembershipStatus();
  const resourcesQuery = useMembershipResources();
  const user = profileQuery.data;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const pageRef = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      gsap.from("[data-dashboard-motion]", {
        y: reduce ? 0 : 16,
        duration: reduce ? 0.01 : 0.38,
        stagger: reduce ? 0 : 0.06,
        ease: motionEase,
      });
    },
    { scope: pageRef },
  );

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const logout = async () => {
    setSigningOut(true);
    setLogoutError("");
    try {
      await signOut();
      queryClient.clear();
      navigate("/", { replace: true });
    } catch {
      setLogoutError("Logout failed. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <main
      ref={pageRef}
      className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8"
    >
      <div className="mx-auto max-w-6xl">
        <header
          data-dashboard-motion
          className="flex items-center justify-between"
        >
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-brand-navy p-1.5">
              <img
                src="/himti-icon.svg"
                alt=""
                className="size-full object-contain"
              />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-brand-ink">
                HIMTI
              </span>
              <span className="block text-[11px] font-medium text-brand-slate">
                Member dashboard
              </span>
            </span>
          </Link>
          <Button
            aria-label="Logout"
            type="button"
            variant="outline"
            className="size-11 border-red-300 px-0 text-red-700 hover:border-red-400 hover:bg-red-50 hover:text-red-800 focus:ring-red-500 sm:h-auto sm:w-auto sm:px-5"
            disabled={signingOut}
            onClick={() => void logout()}
          >
            <LogOut className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {signingOut ? "Logging out..." : "Logout"}
            </span>
          </Button>
        </header>
        {logoutError && (
          <p role="alert" className="mt-4 text-right text-sm text-red-700">
            {logoutError}
          </p>
        )}

        <section
          data-dashboard-motion
          aria-labelledby="profile-title"
          className="relative mt-6 overflow-hidden rounded-2xl bg-brand-navy p-5 text-white sm:mt-8 sm:p-8"
        >
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-24 size-72 rounded-full bg-brand-blue/45 blur-3xl"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-lg font-bold text-brand-blue sm:size-16">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-sky">
                  {user.status}
                </p>
                <h1
                  id="profile-title"
                  className="mt-1 truncate text-2xl font-bold tracking-[-0.03em] sm:text-3xl"
                >
                  {user.name}
                </h1>
                <p className="mt-2 text-sm text-blue-100">
                  HIMTI member · {user.studyProgram?.name ?? "No study program"}
                </p>
              </div>
            </div>
            <Button
              asChild
              className="min-h-11 shrink-0 bg-white text-brand-blue hover:bg-blue-50 focus:ring-white focus:ring-offset-brand-navy"
            >
              <Link to="/profile/edit">
                <Pencil className="mr-2 size-4" /> Edit profile
              </Link>
            </Button>
          </div>
          <dl className="relative mt-6 grid gap-4 border-t border-white/15 pt-5 sm:grid-cols-3">
            <ProfileDetail
              label="Institution"
              value={
                user.university?.name ?? user.universityName ?? "Not provided"
              }
            />
            <ProfileDetail
              label="Region"
              value={user.region?.name ?? "Not provided"}
            />
            <ProfileDetail
              label="Study program"
              value={
                user.studyProgram?.name ??
                user.studyProgramName ??
                "Not provided"
              }
            />
          </dl>
        </section>

        {membershipStatus.data?.availablePeriod && (
          <section
            data-dashboard-motion
            aria-labelledby="reregistration-title"
            className="mt-6 flex flex-col gap-4 rounded-2xl bg-brand-pale p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          >
            <div>
              <h2
                id="reregistration-title"
                className="text-lg font-bold text-brand-navy"
              >
                Reregistration is open
              </h2>
              <p className="mt-1 text-sm leading-6 text-brand-slate">
                Confirm your details for member period{" "}
                {membershipStatus.data.availablePeriod.label}.
              </p>
            </div>
            <Button asChild className="min-h-11 shrink-0">
              <Link to="/reregister">Reregister now</Link>
            </Button>
          </section>
        )}

        <section
          data-dashboard-motion
          aria-labelledby="your-events-title"
          className="mt-10"
        >
          <SectionHeading
            icon={Ticket}
            title="Your Events"
            copy="Subevents you’re registered for."
          />
          <div className="mt-4 rounded-2xl border border-dashed border-brand-blue/20 bg-white p-6 text-sm text-brand-slate">
            You are not registered for any events yet.
          </div>
        </section>

        <section
          data-dashboard-motion
          aria-labelledby="events-title"
          className="mt-10"
        >
          <SectionHeading
            icon={CalendarDays}
            title="Events"
            copy="Choose a subevent and register your place."
          />
          <div className="mt-4 space-y-5">
            {eventsQuery.isPending && (
              <p className="rounded-2xl border border-brand-blue/10 bg-white p-6 text-sm text-brand-slate">
                Loading events...
              </p>
            )}
            {eventsQuery.isError && (
              <p className="rounded-2xl border border-red-200 bg-white p-6 text-sm text-red-700">
                Events could not be loaded.
              </p>
            )}
            {eventsQuery.data?.map((event) => (
              <article
                key={event.id}
                className="rounded-2xl border border-brand-blue/10 bg-white p-5 sm:p-6"
              >
                <h3 className="text-xl font-bold text-brand-navy">
                  {event.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-brand-slate">
                  {event.publicDescription}
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {event.subevents.map((subevent) => (
                    <div
                      key={subevent.id}
                      className="rounded-xl bg-brand-pale/40 p-4"
                    >
                      <p className="text-xs font-bold text-brand-blue">
                        {subevent.type.replaceAll("_", " ")}
                      </p>
                      <h4 className="mt-1 font-bold text-brand-navy">
                        {subevent.name}
                      </h4>
                      <p className="mt-2 text-sm text-brand-slate">
                        {subevent.publicDescription}
                      </p>
                      <p className="mt-3 text-sm text-brand-slate">
                        {new Date(subevent.date).toLocaleString()} ·{" "}
                        {subevent.locationName ?? "Online"}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
            {eventsQuery.isSuccess && !eventsQuery.data.length && (
              <p className="rounded-2xl border border-dashed border-brand-blue/20 p-6 text-sm text-brand-slate">
                No open events are available right now.
              </p>
            )}
          </div>
        </section>

        <section
          data-dashboard-motion
          aria-labelledby="resources-title"
          className="mt-10 pb-6"
        >
          <SectionHeading
            icon={BookOpen}
            title="Member resources"
            copy={
              resourcesQuery.data
                ? `Resources for member period ${resourcesQuery.data.period.label}.`
                : "Links and information for your current member period."
            }
          />
          {resourcesQuery.isPending && (
            <div
              role="status"
              aria-label="Loading member resources"
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              {[0, 1].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl bg-brand-blue/10 motion-reduce:animate-none"
                />
              ))}
            </div>
          )}
          {resourcesQuery.isError && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-white p-6">
              <p className="text-sm text-red-700">
                Member resources could not be loaded.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => void resourcesQuery.refetch()}
              >
                Try again
              </Button>
            </div>
          )}
          {resourcesQuery.isSuccess &&
            (resourcesQuery.data.resources.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {resourcesQuery.data.resources.map((resource) => {
                  const safeUrl = getSafeHttpUrl(resource.url);
                  return (
                    <article
                      key={resource.id}
                      className="flex min-h-40 flex-col rounded-2xl border border-brand-blue/10 bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-brand-navy">
                          {resource.title}
                        </h3>
                        {resource.region && (
                          <span className="shrink-0 rounded-full bg-brand-pale px-2.5 py-1 text-xs font-semibold text-brand-blue">
                            {resource.region.shortName ?? resource.region.name}
                          </span>
                        )}
                      </div>
                      <ResourceMarkdown className="mt-2 flex-1 text-sm leading-6 text-brand-slate">
                        {resource.description}
                      </ResourceMarkdown>
                      {safeUrl && (
                        <a
                          href={safeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex min-h-11 items-center gap-2 self-start rounded-lg font-bold text-brand-blue underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          Open resource <ExternalLink className="size-4" />
                        </a>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-brand-blue/20 bg-white p-6 text-sm text-brand-slate">
                No member resources have been published for this period yet.
              </p>
            ))}
        </section>
      </div>
    </main>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof Ticket;
  title: string;
  copy: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-pale text-brand-blue">
        <Icon className="size-5" />
      </span>
      <div>
        <h2
          id={`${title.toLowerCase().replace(" ", "-")}-title`}
          className="text-xl font-bold tracking-[-0.02em] text-brand-navy sm:text-2xl"
        >
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-brand-slate">{copy}</p>
      </div>
    </div>
  );
}
function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-brand-sky">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}
