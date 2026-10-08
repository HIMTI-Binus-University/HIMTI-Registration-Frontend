import axios from "axios";
import { Navigate, useLocation } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { useCurrentUser } from "@/api/users/queries";
import { useMembershipStatus } from "@/api/membership/queries";
import { Button } from "@/components/ui/button";
import {
  currentReturnPath,
  getElectionReturn,
  rememberElectionReturn,
  registrationContinueLabel,
  storeReturnPath,
} from "@/utils/return-path";
import { AppLoading } from "@/components/app-motion";

export function AccountLoading() {
  return <AppLoading label="Checking your account..." />;
}

export function AccountLoadError({ retry }: { retry: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-sm text-red-700">
          Your account could not be loaded.
        </p>
        <Button className="mt-4" variant="outline" onClick={retry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const query = useCurrentUser();
  const returnTo = new URLSearchParams(location.search).get("returnTo");
  if (query.isPending) return <AccountLoading />;
  if (query.isError) {
    if (
      axios.isAxiosError(query.error) &&
      query.error.response?.status === 401
    ) {
      rememberElectionReturn(returnTo);
      return (
        <Navigate
          to={`/login?returnTo=${encodeURIComponent(storeReturnPath(currentReturnPath(location)))}`}
          replace
        />
      );
    }
    return <AccountLoadError retry={() => void query.refetch()} />;
  }
  return children;
}

export function RequireCompletedRegistration({
  children,
}: {
  children: ReactNode;
}) {
  const query = useCurrentUser();
  if (query.isPending) return <AccountLoading />;
  if (query.isError)
    return <AccountLoadError retry={() => void query.refetch()} />;
  return query.data.registrationCompleted ? (
    children
  ) : (
    <Navigate to="/register" replace />
  );
}

export function RequireIncompleteRegistration({
  children,
}: {
  children: ReactNode;
}) {
  const query = useCurrentUser();
  const location = useLocation();
  const [startedIncomplete, setStartedIncomplete] = useState(false);
  if (query.isPending) return <AccountLoading />;
  if (query.isError)
    return <AccountLoadError retry={() => void query.refetch()} />;
  if (!query.data.registrationCompleted && !startedIncomplete)
    setStartedIncomplete(true);
  if (startedIncomplete || !query.data.registrationCompleted) return children;
  const electionReturn =
    rememberElectionReturn(
      new URLSearchParams(location.search).get("returnTo"),
    ) ?? getElectionReturn();
  if (query.data.registrationCompleted && electionReturn)
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <section className="space-y-5 text-center">
          <h1 className="text-3xl font-bold">Registration complete</h1>
          <Button asChild>
            <a href={electionReturn}>
              {registrationContinueLabel(electionReturn)}
            </a>
          </Button>
        </section>
      </main>
    );
  return query.data.registrationCompleted ? (
    <Navigate to="/dashboard" replace />
  ) : (
    children
  );
}

export function RequireAvailableReregistration({
  children,
}: {
  children: ReactNode;
}) {
  const query = useMembershipStatus();
  if (query.isPending) return <AccountLoading />;
  if (query.isError)
    return <AccountLoadError retry={() => void query.refetch()} />;
  return query.data.availablePeriod ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
}
