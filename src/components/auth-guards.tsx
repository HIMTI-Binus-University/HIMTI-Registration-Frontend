import axios from "axios";
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useCurrentUser } from "@/api/users/queries";
import { useMembershipStatus } from "@/api/membership/queries";
import { Button } from "@/components/ui/button";

export function AccountLoading() {
  return (
    <div className="grid min-h-screen place-items-center text-sm text-brand-slate">
      Checking your account...
    </div>
  );
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
  if (query.isPending) return <AccountLoading />;
  if (query.isError) {
    if (axios.isAxiosError(query.error) && query.error.response?.status === 401)
      return (
        <Navigate to="/login" replace state={{ from: location.pathname }} />
      );
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
  if (query.isPending) return <AccountLoading />;
  if (query.isError)
    return <AccountLoadError retry={() => void query.refetch()} />;
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
