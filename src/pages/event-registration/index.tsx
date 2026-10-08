import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  useCreateEventRegistration,
  useCreateEventBundle,
  useEventRegistrationContext,
  useJoinEventBundle,
  useMyEventRegistrations,
} from "@/api/event-registrations/queries";
import { useCurrentUser } from "@/api/users/queries";
import { parseApiError } from "@/api/api-error";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { formatIdr, missingProfileFields, profileValues } from "./answers";
import { PersonalInformation } from "./shared";

export default function EventRegistrationPage() {
  const { eventId = "" } = useParams();
  const navigate = useNavigate();
  const context = useEventRegistrationContext(eventId);
  const user = useCurrentUser();
  const registrations = useMyEventRegistrations();
  const create = useCreateEventRegistration(eventId);
  const createBundle = useCreateEventBundle(eventId);
  const joinBundle = useJoinEventBundle(eventId);
  const [packageId, setPackageId] = useState("");
  const [bundleCode, setBundleCode] = useState("");
  const selectedPackage = context.data?.packages.find(
    ({ id }) => id === packageId,
  );
  const error = create.error ?? createBundle.error ?? joinBundle.error;
  if (context.isPending || user.isPending || registrations.isPending)
    return <Status>Loading registration...</Status>;
  if (
    context.isError ||
    user.isError ||
    registrations.isError ||
    !context.data ||
    !user.data
  )
    return <Status>Registration could not be loaded.</Status>;
  const existingRegistration = registrations.data?.find(
    (registration) =>
      registration.eventId === eventId && registration.status !== "CANCELLED",
  );
  if (existingRegistration)
    return (
      <Navigate to={`/registrations/${existingRegistration.id}`} replace />
    );
  const values = profileValues(user.data);
  const missing = missingProfileFields(user.data);
  const hasFileQuestion = Boolean(
    context.data.form?.sections.some((section) =>
      section.questions.some((question) => question.type === "FILE"),
    ),
  );
  const profilePath = `/profile/edit?returnTo=${encodeURIComponent(`/events/${eventId}/register`)}`;
  return (
    <main className="min-h-screen bg-background px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <AppHeader />
        <Link
          to={`/events/${eventId}`}
          className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-brand-blue"
        >
          <ArrowLeft className="size-4" /> Back to event
        </Link>
        <div className="my-4 rounded-3xl bg-brand-navy p-6 text-white sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-sky">
            Event registration
          </p>
          <h1 className="mt-2 text-3xl font-bold">{context.data.event.name}</h1>
        </div>
        <PersonalInformation values={values} missingFields={missing} />
        {missing.length > 0 && (
          <Button asChild variant="outline" className="mt-4">
            <Link to={profilePath}>Complete profile</Link>
          </Button>
        )}
        <section className="mt-6 rounded-2xl border border-brand-blue/10 bg-white p-6">
          <h2 className="text-xl font-bold text-brand-navy">
            Choose a package
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {context.data.packages.map((ticketPackage) => (
              <label
                key={ticketPackage.id}
                className={`cursor-pointer rounded-2xl border p-5 ${packageId === ticketPackage.id ? "border-brand-blue bg-brand-pale" : "border-brand-blue/10"}`}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="package"
                  value={ticketPackage.id}
                  checked={packageId === ticketPackage.id}
                  onChange={() => setPackageId(ticketPackage.id)}
                />
                <span className="font-bold text-brand-navy">
                  {ticketPackage.name}
                </span>
                <span className="mt-2 block text-lg font-bold text-brand-blue">
                  {formatIdr(ticketPackage.priceMinor)}
                </span>
                <span className="mt-1 block text-sm text-brand-slate">
                  {ticketPackage.seatCount}{" "}
                  {ticketPackage.seatCount === 1 ? "seat" : "fixed seats"},
                  whole-order price
                </span>
                {ticketPackage.description && (
                  <span className="mt-2 block text-sm text-brand-slate">
                    {ticketPackage.description}
                  </span>
                )}
              </label>
            ))}
          </div>
          {!context.data.packages.length && (
            <p className="mt-4 text-sm text-brand-slate">
              No packages are currently available.
            </p>
          )}
          {error && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              {parseApiError(error).message}
            </p>
          )}
          {selectedPackage?.seatCount === 1 && (
            <Button
              className="mt-6"
              disabled={
                !context.data.event.registrationOpen ||
                !context.data.form ||
                hasFileQuestion ||
                missing.length > 0 ||
                create.isPending
              }
              onClick={() =>
                create.mutate(
                  { ticketPackageId: packageId, seatCount: 1, answers: [] },
                  {
                    onSuccess: (registration) =>
                      navigate(`/registrations/${registration.id}`),
                  },
                )
              }
            >
              {create.isPending ? "Creating..." : "Create registration"}
            </Button>
          )}
          {selectedPackage && selectedPackage.seatCount > 1 && (
            <div className="mt-6 grid gap-4 border-t border-brand-blue/10 pt-6 md:grid-cols-2">
              <div className="flex h-full flex-col rounded-2xl border border-brand-blue/10 bg-brand-pale/40 p-5">
                <h3 className="font-bold text-brand-navy">Create a Bundle</h3>
                <p className="mt-1 text-sm text-brand-slate">
                  You will be an equal member and receive a code to share.
                </p>
                <Button
                  className="mt-4 self-start"
                  disabled={missing.length > 0 || createBundle.isPending}
                  onClick={() =>
                    createBundle.mutate(
                      { ticketPackageId: packageId, answers: [] },
                      {
                        onSuccess: ({ registration }) =>
                          navigate(`/registrations/${registration.id}`),
                      },
                    )
                  }
                >
                  {createBundle.isPending ? "Creating..." : "Create Bundle"}
                </Button>
              </div>
              <form
                className="flex h-full flex-col rounded-2xl border border-brand-blue/10 bg-white p-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  joinBundle.mutate(
                    { ticketPackageId: packageId, bundleCode },
                    {
                      onSuccess: (registration) =>
                        navigate(`/registrations/${registration.id}`),
                    },
                  );
                }}
              >
                <label
                  htmlFor="bundle-code"
                  className="font-bold text-brand-navy"
                >
                  Join a Bundle
                </label>
                <p className="mt-1 text-sm text-brand-slate">
                  Enter the code shared by any Bundle member.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="bundle-code"
                    value={bundleCode}
                    onChange={(event) => setBundleCode(event.target.value)}
                    autoComplete="off"
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-brand-blue/20 bg-white px-3 uppercase"
                    placeholder="XXXX-XXXX-XXXX"
                  />
                  <Button
                    className="shrink-0"
                    disabled={!bundleCode.trim() || joinBundle.isPending}
                  >
                    {joinBundle.isPending ? "Joining..." : "Join Bundle"}
                  </Button>
                </div>
              </form>
            </div>
          )}
          {!context.data.event.registrationOpen && (
            <p className="mt-3 text-sm text-red-700">
              Registration is unavailable.
            </p>
          )}
          {hasFileQuestion && (
            <p className="mt-3 text-sm text-amber-900">
              This form contains a file question, which is unsupported in this
              registration phase.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

function Status({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-brand-slate">
      {children}
    </main>
  );
}
