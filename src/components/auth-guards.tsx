import axios from "axios";
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useCurrentUser } from "@/api/users/queries";
import { Button } from "@/components/ui/button";

function Loading() {
  return (
    <div className="grid min-h-screen place-items-center text-sm text-brand-slate">
      Checking your account...
    </div>
  );
}

function LoadError({ retry }: { retry: () => void }) {
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
  if (query.isPending) return <Loading />;
  if (query.isError) {
    if (axios.isAxiosError(query.error) && query.error.response?.status === 401)
      return (
        <Navigate to="/login" replace state={{ from: location.pathname }} />
      );
    return <LoadError retry={() => void query.refetch()} />;
  }
  return children;
}

export function RequireCompletedRegistration({
  children,
}: {
  children: ReactNode;
}) {
  const query = useCurrentUser();
  if (query.isPending) return <Loading />;
  if (query.isError) return <LoadError retry={() => void query.refetch()} />;
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
  if (query.isPending) return <Loading />;
  if (query.isError) return <LoadError retry={() => void query.refetch()} />;
  return query.data.registrationCompleted ? (
    <Navigate to="/dashboard" replace />
  ) : (
    children
  );
}
