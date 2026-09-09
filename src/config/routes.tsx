import RootPage from "@/pages/root";
import LoginPage from "@/pages/login";
import AuthCallbackPage from "@/pages/auth-callback";
import RegisterPage from "@/pages/register";
import ProfileEditPage from "@/pages/profile-edit";
import DashboardPage from "@/pages/dashboard";
import VerifyOutlookPage from "@/pages/verify-outlook";
import EventDetailPage from "@/pages/event-detail";
import EventsPage from "@/pages/events";
import EventRegistrationPage from "@/pages/event-registration";
import RegistrationDetailPage from "@/pages/registration-detail";
import { Navigate } from "react-router-dom";
import type { AppRoute } from "@/types/common";
import {
  RequireAuth,
  RequireAvailableReregistration,
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
    path: "/reregister",
    element: (
      <RequireAuth>
        <RequireCompletedRegistration>
          <RequireAvailableReregistration>
            <RegisterPage reregister />
          </RequireAvailableReregistration>
        </RequireCompletedRegistration>
      </RequireAuth>
    ),
  },
  {
    path: "/profile/edit",
    element: (
      <RequireAuth>
        <ProfileEditPage />
      </RequireAuth>
    ),
  },
  {
    path: "/events",
    element: <EventsPage />,
  },
  {
    path: "/events/:eventId",
    element: <EventDetailPage />,
  },
  {
    path: "/events/:eventId/register",
    element: (
      <RequireAuth>
        <EventRegistrationPage />
      </RequireAuth>
    ),
  },
  {
    path: "/registrations/:registrationId",
    element: (
      <RequireAuth>
        <RegistrationDetailPage />
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
