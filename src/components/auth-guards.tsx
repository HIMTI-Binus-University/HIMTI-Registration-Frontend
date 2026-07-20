import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useProfile } from "@/api/registration";

function Loading() { return <div className="grid min-h-screen place-items-center text-sm text-brand-slate">Checking your account...</div>; }

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const query = useProfile();
  if (query.isPending) return <Loading />;
  if (query.isError) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function RequireCompletedRegistration({ children }: { children: ReactNode }) {
  const query = useProfile();
  if (query.isPending) return <Loading />;
  return query.data?.registrationCompleted ? children : <Navigate to="/register" replace />;
}

export function RequireIncompleteRegistration({ children }: { children: ReactNode }) {
  const query = useProfile();
  if (query.isPending) return <Loading />;
  return query.data?.registrationCompleted ? <Navigate to="/dashboard" replace /> : children;
}
