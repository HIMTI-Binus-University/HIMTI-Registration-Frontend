import axios from "axios";
import { Navigate } from "react-router-dom";
import { useSession } from "@/api/auth";
import HomePage from "@/pages/home";
import { Button } from "@/components/ui/button";

export default function RootPage() {
  const session = useSession();
  if (session.isPending)
    return (
      <div className="grid min-h-screen place-items-center text-sm text-brand-slate">
        Checking your account...
      </div>
    );
  if (
    session.isError &&
    axios.isAxiosError(session.error) &&
    session.error.response?.status === 401
  )
    return <HomePage />;
  if (session.isError)
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="text-sm text-red-700">
            Your session could not be checked.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => void session.refetch()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  return session.data ? <Navigate to="/dashboard" replace /> : <HomePage />;
}
