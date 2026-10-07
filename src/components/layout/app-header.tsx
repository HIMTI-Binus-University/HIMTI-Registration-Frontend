import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { signOut, useSession } from "@/api/auth";
import { Button } from "@/components/ui/button";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? "bg-brand-pale text-brand-navy" : "text-brand-blue hover:bg-brand-pale hover:text-brand-navy"}`;

export function AppHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const links = [["Home", "/dashboard"], ["Events", "/events"], ["Tickets", "/tickets"]] as const;

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
  const toggleMenu = () => {
    if (menuOpen) {
      setMenuClosing(true);
      window.setTimeout(() => { setMenuOpen(false); setMenuClosing(false); }, 180);
      return;
    }
    setMenuOpen(true);
  };

  return (
    <header className="relative sticky top-0 z-50 px-0 pt-0 sm:pt-2">
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_auto] items-center rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_8px_24px_-16px_rgba(0,33,79,0.45)] backdrop-blur sm:grid-cols-[auto_1fr_auto] sm:px-5">
        <Link to={session.data ? "/dashboard" : "/"} className="flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
          <img data-himti-brand-target="navbar" src="/logo-himti.png" width={44} height={44} alt="" className="size-11 object-contain" />
          <span><span className="block text-sm font-bold text-brand-navy">HIMTI BINUS</span><span className="block text-xs font-semibold text-brand-slate">Registrations</span></span>
        </Link>
        <nav className="hidden items-center justify-self-center gap-2 sm:flex" aria-label="Main navigation">
          {session.data && links.map(([label, to]) => <NavLink key={to} to={to} end={to === "/dashboard"} className={navClass}>{label}</NavLink>)}
        </nav>
        <div className="hidden justify-self-end sm:block">
          {session.data ? <Button variant="outline" className="gap-2 border-red-300 bg-white px-4 text-red-700 hover:bg-red-50" disabled={signingOut} onClick={() => void logout()}><LogOut className="size-4" /><span>{signingOut ? "Logging out..." : "Logout"}</span></Button> : <Button asChild className="px-4"><Link to="/login">Log in</Link></Button>}
        </div>
        <button type="button" className="grid size-11 place-items-center justify-self-end rounded-xl border border-border bg-white text-brand-navy sm:hidden" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={toggleMenu}>{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
      </div>
      {menuOpen || menuClosing ? <nav id="mobile-navigation" className={`mobile-navigation absolute inset-x-0 top-full z-50 mt-2 grid gap-1 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-[0_8px_24px_-16px_rgba(0,33,79,0.45)] backdrop-blur sm:hidden${menuClosing ? " mobile-navigation-closing" : ""}`} aria-label="Mobile navigation">
        {session.data && links.map(([label, to]) => <NavLink key={to} to={to} end={to === "/dashboard"} className={({ isActive }) => `rounded-xl px-4 py-3 text-center font-semibold ${isActive ? "bg-brand-pale text-brand-navy" : "text-brand-slate hover:bg-brand-pale hover:text-brand-blue"}`} onClick={toggleMenu}>{label}</NavLink>)}
        {session.data ? <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-3 font-semibold text-red-700 hover:bg-red-50" onClick={() => void logout()}><LogOut className="size-4" /> Logout</button> : <Button asChild className="py-3"><Link to="/login">Log in</Link></Button>}
      </nav> : null}
      {logoutError && <p role="alert" className="mx-auto mt-2 max-w-6xl rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-700">{logoutError}</p>}
    </header>
  );
}
