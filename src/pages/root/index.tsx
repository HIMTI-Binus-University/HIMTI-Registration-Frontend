import axios from "axios";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/api/users/queries";
import { AccountLoadError, AccountLoading } from "@/components/auth-guards";
import HomePage from "@/pages/home";

export default function RootPage() {
  const profile = useCurrentUser();

  if (profile.isPending) return <AccountLoading />;
  if (profile.isError) {
    if (
      axios.isAxiosError(profile.error) &&
      profile.error.response?.status === 401
    ) {
      return <HomePage />;
    }

    return <AccountLoadError retry={() => void profile.refetch()} />;
  }

  if (!profile.data.registrationCompleted) {
    return <Navigate to="/register" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
