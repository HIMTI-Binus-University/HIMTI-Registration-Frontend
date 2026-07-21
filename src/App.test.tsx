import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type React from "react";
import App from "@/App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCurrentUser } from "@/api/users/queries";
import { signOut, useSession } from "@/api/auth";

vi.mock("@/api/users/queries", () => ({
  useCurrentUser: vi.fn(),
  useUserRegistrationOptions: () => ({ data: undefined }),
  useCompleteCurrentUserProfile: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
  useUpdateCurrentUserProfile: () => ({ isPending: false, mutate: vi.fn() }),
  useSendUserEmailVerification: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
}));

vi.mock("@/api/events/queries", () => ({
  usePublishedEvents: () => ({
    data: [],
    isPending: false,
    isError: false,
    isSuccess: true,
  }),
}));

vi.mock("@/api/auth", () => ({
  useSession: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
}));

const profile = {
  id: "user-1",
  name: "HIMTI Member",
  email: "member@example.com",
  image: null,
  status: "ACTIVE",
  outlookEmail: null,
  outlookEmailVerified: false,
  nim: null,
  graduateBatch: null,
  phoneNumber: null,
  lineId: null,
  universityId: null,
  studyProgramId: null,
  regionId: null,
  university: null,
  studyProgram: null,
  region: null,
  emailVerified: true,
  createdAt: "2026-07-21T00:00:00.000Z",
  updatedAt: null,
  createdBy: null,
  updatedBy: null,
  registrationCompletedAt: null,
  roles: [],
  permissions: [],
  registrationCompleted: false,
};

function mockProfile(overrides = {}) {
  vi.mocked(useCurrentUser).mockReturnValue({
    data: { ...profile, ...overrides },
    isPending: false,
    isError: false,
    isSuccess: true,
    refetch: vi.fn(),
  } as never);
}

afterEach(cleanup);
beforeEach(() => {
  mockProfile();
  vi.mocked(useSession).mockReturnValue({
    data: null,
    isPending: false,
    isError: false,
  } as never);
});

function renderApp(ui: React.ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>,
  );
}

test("renders the HIMTI landing page", () => {
  renderApp(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );

  expect(
    screen.getByRole("heading", { name: /join once/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /register as a himti member to unlock event registration/i,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getAllByRole("link", { name: /register|start registration/i }),
  ).toHaveLength(2);
  expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute(
    "href",
    "/login",
  );
  expect(screen.getByRole("link", { name: /discover himti/i })).toHaveAttribute(
    "href",
    "https://ofog.himtibinus.or.id",
  );
});

test("renders the registration wizard and advances through the first step", async () => {
  renderApp(
    <MemoryRouter initialEntries={["/register"]}>
      <App />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("heading", { name: /tell us about yourself/i }),
  ).toBeInTheDocument();
  expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute(
    "href",
    "/login",
  );
  expect(screen.getAllByText(/Step 1 of 4/)).not.toHaveLength(0);
  expect(
    screen.getByLabelText(/registration progress, step 1 of 4/i),
  ).toBeInTheDocument();
});

test("renders the member dashboard sections", () => {
  mockProfile({
    registrationCompleted: true,
    registrationCompletedAt: "2026-07-21T00:00:00.000Z",
  });
  renderApp(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <App />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("heading", { name: "HIMTI Member" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Your Events" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Events" })).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Member support" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /edit profile/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /edit profile/i })).toHaveAttribute(
    "href",
    "/profile/edit",
  );
  expect(
    screen.getByText(/you are not registered for any events yet/i),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/support resources are not available yet/i),
  ).toBeInTheDocument();
});

test("redirects authenticated users from root to the dashboard", async () => {
  vi.mocked(useSession).mockReturnValue({
    data: { user: { id: "user-1" } },
    isPending: false,
  } as never);
  mockProfile({
    registrationCompleted: true,
    registrationCompletedAt: "2026-07-21T00:00:00.000Z",
  });
  renderApp(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>,
  );

  expect(
    await screen.findByRole("heading", { name: "HIMTI Member" }),
  ).toBeInTheDocument();
});

test("logs out from the dashboard", async () => {
  const user = userEvent.setup();
  mockProfile({
    registrationCompleted: true,
    registrationCompletedAt: "2026-07-21T00:00:00.000Z",
  });
  renderApp(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <App />
    </MemoryRouter>,
  );

  await user.click(screen.getByRole("button", { name: /logout/i }));
  await waitFor(() => expect(signOut).toHaveBeenCalledOnce());
});

test("profile editing excludes registration and academic fields", () => {
  mockProfile({
    registrationCompleted: true,
    registrationCompletedAt: "2026-07-21T00:00:00.000Z",
  });
  renderApp(
    <MemoryRouter initialEntries={["/profile/edit"]}>
      <App />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("heading", { name: /edit contact information/i }),
  ).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Student" })).toBeNull();
  expect(
    screen.queryByLabelText(/university|study program|region|nim/i),
  ).toBeNull();
  expect(screen.getByLabelText(/google email/i)).toBeDisabled();
});

test("sends completed users from registration to the dashboard", () => {
  mockProfile({
    registrationCompleted: true,
    registrationCompletedAt: "2026-07-21T00:00:00.000Z",
  });
  renderApp(
    <MemoryRouter initialEntries={["/register"]}>
      <App />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("heading", { name: "HIMTI Member" }),
  ).toBeInTheDocument();
});

test("sends incomplete users from the dashboard to registration", () => {
  renderApp(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <App />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("heading", { name: /tell us about yourself/i }),
  ).toBeInTheDocument();
});

test("routes completed Google sign-ins to the dashboard", async () => {
  mockProfile({
    registrationCompleted: true,
    registrationCompletedAt: "2026-07-21T00:00:00.000Z",
  });
  renderApp(
    <MemoryRouter initialEntries={["/auth/callback"]}>
      <App />
    </MemoryRouter>,
  );

  expect(
    await screen.findByRole("heading", { name: "HIMTI Member" }),
  ).toBeInTheDocument();
});

test("routes incomplete Google sign-ins to registration", async () => {
  renderApp(
    <MemoryRouter initialEntries={["/auth/callback"]}>
      <App />
    </MemoryRouter>,
  );

  expect(
    await screen.findByRole("heading", { name: /tell us about yourself/i }),
  ).toBeInTheDocument();
});

test("sends unauthenticated users to Google login", () => {
  vi.mocked(useCurrentUser).mockReturnValue({
    isPending: false,
    isError: true,
    isSuccess: false,
    error: { isAxiosError: true, response: { status: 401 } },
  } as never);
  renderApp(
    <MemoryRouter initialEntries={["/register"]}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText("Continue with Google")).toBeInTheDocument();
});

test("shows a retryable account error instead of logging in on server failure", () => {
  vi.mocked(useCurrentUser).mockReturnValue({
    isPending: false,
    isError: true,
    isSuccess: false,
    error: { isAxiosError: true, response: { status: 500 } },
    refetch: vi.fn(),
  } as never);
  renderApp(
    <MemoryRouter initialEntries={["/register"]}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText(/account could not be loaded/i)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /try again/i }),
  ).toBeInTheDocument();
  expect(screen.queryByText("Continue with Google")).toBeNull();
});

test("does not trust a successful verification status without a token", () => {
  renderApp(
    <MemoryRouter initialEntries={["/verify-outlook?status=success"]}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText(/link unavailable/i)).toBeInTheDocument();
});

test("shows BINUS verification and clears institution details when the path changes", async () => {
  const user = userEvent.setup();
  renderApp(
    <MemoryRouter initialEntries={["/register"]}>
      <App />
    </MemoryRouter>,
  );

  await user.click(screen.getByRole("button", { name: "Student" }));
  await user.click(screen.getByRole("button", { name: "BINUS" }));
  await user.click(screen.getByRole("button", { name: /continue/i }));
  await user.clear(screen.getByLabelText(/full name/i));
  await user.type(screen.getByLabelText(/full name/i), "HIMTI Member");
  await user.type(screen.getByLabelText(/phone number/i), "08123456789");
  expect(screen.getByLabelText(/google email/i)).toHaveAttribute("readonly");
  await user.type(screen.getByLabelText(/line id/i), "himti-member");
  await user.click(screen.getByRole("button", { name: /continue/i }));

  expect(screen.getByLabelText(/binus major/i).tagName).toBe("SELECT");
  expect(screen.getByText(/verify your binus email/i)).toBeInTheDocument();
  await user.type(screen.getByLabelText(/^nim/i), "2600000000");
  await user.click(screen.getByRole("button", { name: /back/i }));
  await user.click(screen.getByRole("button", { name: /back/i }));
  await user.click(screen.getByRole("button", { name: "Lecturer" }));
  await user.click(screen.getByRole("button", { name: /continue/i }));

  expect(screen.getByLabelText(/full name/i)).toHaveValue("HIMTI Member");
  expect(
    screen.getByText(/institution details were cleared/i),
  ).toBeInTheDocument();
});
