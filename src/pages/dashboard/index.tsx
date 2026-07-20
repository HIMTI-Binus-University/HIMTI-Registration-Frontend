import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  House,
  MapPin,
  MessageCircle,
  Pencil,
  Ticket,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { gsap, motionEase, useGSAP } from "@/lib/motion";
import { useProfile, usePublishedEvents } from "@/api/registration";

const fallbackProfile = {
  name: "HIMTI Member",
  initials: "HM",
  type: "Student",
  institution: "BINUS University",
  major: "Computer Science",
  region: "Kemanggisan",
};

const yourEvents = [
  {
    event: "TECHNO 2026: Wondrous Wonderland",
    title: "Welcoming Party",
    month: "AUG",
    day: "24",
    time: "13:00–16:00",
    location: "BINUS Kemanggisan",
    status: "Registered",
  },
];

const groups = [
  ["Grup SOCS B30", "https://chat.whatsapp.com/DummySocsB30Invite"],
  ["Grup HIMTI GJKT", "https://chat.whatsapp.com/DummyHimtiGjktInvite"],
] as const;

const contactPeople = [
  ["KMG & SNY", "Dara Anggraini", "081284855127"],
  ["ALS & MEDAN", "Jovanna", "085179920061"],
  ["BKS", "Khalisa Kasih", "08111160216"],
  ["BDG", "Gilbert Owen", "089516744311"],
  ["SMG", "Maria", "085643724821"],
  ["MLG", "Jesselyn", "081331492106"],
] as const;

export default function DashboardPage() {
  const profileQuery = useProfile();
  const eventsQuery = usePublishedEvents();
  const user = profileQuery.data;
  const profile = user ? { name: user.name, initials: user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), type: "Member", institution: user.university?.name ?? "", major: user.studyProgram?.name ?? "", region: user.region?.name ?? "" } : fallbackProfile;
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
            asChild
            variant="outline"
            className="size-11 px-0 sm:h-auto sm:w-auto sm:px-5"
          >
            <Link to="/" aria-label="Back to home">
              <House className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
        </header>

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
                {profile.initials}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-sky">
                  Active HIMTI member
                </p>
                <h1
                  id="profile-title"
                  className="mt-1 truncate text-2xl font-bold tracking-[-0.03em] sm:text-3xl"
                >
                  {profile.name}
                </h1>
                <p className="mt-2 text-sm text-blue-100">
                  {profile.type} · {profile.major}
                </p>
              </div>
            </div>
            <Button
              asChild
              className="min-h-11 shrink-0 bg-white text-brand-blue hover:bg-blue-50 focus:ring-white focus:ring-offset-brand-navy"
            >
              <Link to="/register">
                <Pencil className="mr-2 size-4" /> Edit profile
              </Link>
            </Button>
          </div>
          <dl className="relative mt-6 grid gap-4 border-t border-white/15 pt-5 sm:grid-cols-3">
            <ProfileDetail label="Institution" value={profile.institution} />
            <ProfileDetail label="Region" value={profile.region} />
            <ProfileDetail label="Member type" value={profile.type} />
          </dl>
        </section>

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
          <div className="mt-4 overflow-hidden rounded-2xl border border-brand-blue/10 bg-white">
            {yourEvents.map((item) => (
              <article
                key={item.title}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
              >
                <DateBlock month={item.month} day={item.day} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-brand-blue">
                      {item.event}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                      {item.status}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-lg font-bold text-brand-navy">
                    {item.title}
                  </h3>
                  <EventMeta time={item.time} location={item.location} />
                </div>
                <Button
                  variant="outline"
                  className="min-h-11 shrink-0 border-brand-blue/20 text-brand-blue"
                >
                  View details <ArrowRight className="ml-2 size-4" />
                </Button>
              </article>
            ))}
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
            {(eventsQuery.data ?? []).map((event) => (
              <article key={event.id} className="rounded-2xl border border-brand-blue/10 bg-white p-5 sm:p-6">
                <h3 className="text-xl font-bold text-brand-navy">{event.name}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-slate">{event.publicDescription}</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {event.subevents.map((subevent) => (
                    <div key={subevent.id} className="rounded-xl bg-brand-pale/40 p-4">
                      <p className="text-xs font-bold text-brand-blue">{subevent.type.replaceAll("_", " ")}</p>
                      <h4 className="mt-1 font-bold text-brand-navy">{subevent.name}</h4>
                      <p className="mt-2 text-sm text-brand-slate">{subevent.publicDescription}</p>
                      <p className="mt-3 text-sm text-brand-slate">{new Date(subevent.date).toLocaleString()} · {subevent.locationName ?? "Online"}</p>
                      <Button className="mt-4">Register <ArrowRight className="ml-2 size-4" /></Button>
                    </div>
                  ))}
                </div>
              </article>
            ))}
            {!eventsQuery.isPending && !eventsQuery.data?.length && <p className="rounded-2xl border border-dashed border-brand-blue/20 p-6 text-sm text-brand-slate">No open events are available right now.</p>}
          </div>
        </section>

        <section
          data-dashboard-motion
          aria-labelledby="support-title"
          className="mt-10 pb-6"
        >
          <SectionHeading
            icon={MessageCircle}
            title="Member support"
            copy="Community groups and people ready to help."
          />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-brand-blue/10 bg-white p-5 sm:p-6">
              <h3 className="font-bold text-brand-navy">WhatsApp groups</h3>
              <p className="mt-1 text-sm text-brand-slate">
                Get SOCS and HIMTI updates in your community groups.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {groups.map(([label, href]) => (
                  <WhatsAppLink key={label} label={label} href={href} />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-brand-blue/10 bg-white p-5 sm:p-6">
              <h3 className="font-bold text-brand-navy">Contact person</h3>
              <p className="mt-1 text-sm text-brand-slate">
                Choose the contact for your region if you need help.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {contactPeople.map(([area, name, phone]) => (
                  <ContactCard
                    key={area}
                    area={area}
                    name={name}
                    phone={phone}
                  />
                ))}
              </div>
            </div>
          </div>
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
function DateBlock({ month, day }: { month: string; day: string }) {
  return (
    <time className="grid size-14 shrink-0 place-items-center rounded-xl bg-brand-pale text-center">
      <span>
        <span className="block text-[10px] font-bold leading-none text-brand-blue">
          {month}
        </span>
        <span className="mt-1 block text-xl font-bold leading-none text-brand-navy">
          {day}
        </span>
      </span>
    </time>
  );
}
function EventMeta({ time, location }: { time: string; location: string }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-brand-slate">
      <span className="flex items-center gap-1.5">
        <Clock3 className="size-4 text-brand-blue" />
        {time}
      </span>
      <span className="flex items-center gap-1.5">
        <MapPin className="size-4 text-brand-blue" />
        {location}
      </span>
    </div>
  );
}
function WhatsAppLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-xl bg-brand-pale/60 p-3 transition-colors hover:bg-brand-pale focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-brand-blue">
        <MessageCircle className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-brand-ink">{label}</p>
        <p className="text-xs font-semibold text-brand-blue">Join group</p>
      </div>
      <ArrowRight className="size-4 text-brand-blue" />
    </a>
  );
}

function ContactCard({
  area,
  name,
  phone,
}: {
  area: string;
  name: string;
  phone: string;
}) {
  const [copied, setCopied] = useState(false);
  const whatsappNumber = `62${phone.slice(1)}`;
  const copy = async () => {
    await navigator.clipboard.writeText(phone);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-xl bg-brand-pale/45 p-3">
      <p className="text-[11px] font-bold text-brand-blue">{area}</p>
      <p className="mt-0.5 text-sm font-bold text-brand-ink">{name}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-brand-slate">{phone}</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy ${name}'s phone number`}
            className="grid size-10 place-items-center rounded-lg text-brand-blue hover:bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`Message ${name} on WhatsApp`}
            className="grid size-10 place-items-center rounded-lg bg-brand-blue text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <MessageCircle className="size-4" />
          </a>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        {copied ? "Phone number copied" : ""}
      </span>
    </div>
  );
}
