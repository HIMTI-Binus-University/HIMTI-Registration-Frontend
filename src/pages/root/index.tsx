import { Navigate } from "react-router-dom";
import { useSession } from "@/api/auth";
import HomePage from "@/pages/home";

export default function RootPage() {
  const session = useSession();
  if (session.isPending)
    return (
      <div className="grid min-h-screen place-items-center text-sm text-brand-slate">
        Checking your account...
      </div>
    );
  return session.data ? <Navigate to="/dashboard" replace /> : <HomePage />;
}
