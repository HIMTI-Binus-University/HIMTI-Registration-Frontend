import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "@/api/auth";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

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
    <>
      <header className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <img
            src="/icon-primary.svg"
            alt=""
            className="size-10 shrink-0 object-contain"
          />
          <span className="leading-tight">
            <span className="block text-sm font-bold text-brand-ink">
              HIMTI BINUS
            </span>
            <span className="block text-[11px] font-medium text-brand-slate">
              Registrations
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
    </>
  );
}
