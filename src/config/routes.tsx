import RootPage from "@/pages/root";
import LoginPage from "@/pages/login";
import AuthCallbackPage from "@/pages/auth-callback";
import RegisterPage from "@/pages/register";
import ProfileEditPage from "@/pages/profile-edit";
import DashboardPage from "@/pages/dashboard";
import VerifyOutlookPage from "@/pages/verify-outlook";
import { Navigate } from "react-router-dom";
import type { AppRoute } from "@/types/common";
import {
  RequireAuth,
  RequireCompletedRegistration,
  RequireIncompleteRegistration,
} from "@/components/auth-guards";

export const routes: AppRoute[] = [
  { path: "/", element: <RootPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },
  {
    path: "/register",
    element: (
      <RequireAuth>
        <RequireIncompleteRegistration>
          <RegisterPage />
        </RequireIncompleteRegistration>
      </RequireAuth>
    ),
  },
  {
    path: "/profile/edit",
    element: (
      <RequireAuth>
        <RequireCompletedRegistration>
          <ProfileEditPage />
        </RequireCompletedRegistration>
      </RequireAuth>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <RequireAuth>
        <RequireCompletedRegistration>
          <DashboardPage />
        </RequireCompletedRegistration>
      </RequireAuth>
    ),
  },
  { path: "/verify-outlook", element: <VerifyOutlookPage /> },
  { path: "*", element: <Navigate to="/" replace /> },
];
