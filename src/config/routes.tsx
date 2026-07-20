import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import AuthCallbackPage from "@/pages/auth-callback";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import VerifyOutlookPage from "@/pages/verify-outlook";
import type { AppRoute } from "@/types/common";

export const routes: AppRoute[] = [
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/verify-outlook", element: <VerifyOutlookPage /> },
  { path: "*", element: <HomePage /> },
];
