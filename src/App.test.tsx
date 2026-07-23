import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { StrictMode, type ReactNode } from "react";
import App from "@/App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useCurrentUser,
  useUserRegistrationOptions,
} from "@/api/users/queries";
import {
  useMembershipResources,
  useMembershipStatus,
  useReregisterCurrentUser,
} from "@/api/membership/queries";
import { signOut, useSession } from "@/api/auth";
import apiClient from "@/config/api-client";

vi.mock("@/api/users/queries", () => ({
  useCurrentUser: vi.fn(),
  useUserRegistrationOptions: vi.fn(),
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

vi.mock("@/api/membership/queries", () => ({
  useMembershipStatus: vi.fn(),
  useMembershipResources: vi.fn(),
  useReregisterCurrentUser: vi.fn(),
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

vi.mock("@/config/api-client", () => ({
  default: { get: vi.fn() },
}));

const profile = {
  id: "user-1",
  name: "HIMTI Member",
  email: "member@example.com",
  image: null,
  status: "ACTIVE",
  memberType: null,
  institutionType: null,
  universityName: null,
  studyProgramName: null,
  department: null,
  affiliation: null,
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
  membershipPeriod: null,
  reregistrationPeriod: null,
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
  vi.mocked(apiClient.get).mockReset();
  mockProfile();
  vi.mocked(useUserRegistrationOptions).mockReturnValue({
    data: undefined,
  } as never);
  vi.mocked(useMembershipStatus).mockReturnValue({
    data: {
      currentPeriod: { id: "period-1", label: "2025/2026" },
      availablePeriod: null,
      activePeriod: { id: "period-1", label: "2025/2026" },
    },
    isPending: false,
    isError: false,
    isSuccess: true,
  } as never);
  vi.mocked(useMembershipResources).mockReturnValue({
    data: {
      period: { id: "period-1", label: "2025/2026" },
      resources: [],
    },
    isPending: false,
    isError: false,
    isSuccess: true,
    refetch: vi.fn(),
  } as never);
  vi.mocked(useReregisterCurrentUser).mockReturnValue({
    isPending: false,
    mutate: vi.fn(),
  } as never);
  vi.mocked(useSession).mockReturnValue({
    data: null,
    isPending: false,
    isError: false,
  } as never);
});

function renderApp(ui: ReactNode) {
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
  expect(screen.getByLabelText(/membership period/i)).toHaveValue("2025/2026");
  expect(screen.getByLabelText(/membership period/i)).toHaveAttribute(
    "readonly",
  );
  expect(screen.getByLabelText(/membership period/i)).toHaveClass("block");
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
    screen.getByRole("heading", { name: "Member resources" }),
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
    screen.getByText(/no member resources have been published/i),
  ).toBeInTheDocument();
});

test("renders all current-period resources and the reregistration prompt", () => {
  mockProfile({
    registrationCompleted: true,
    registrationCompletedAt: "2026-07-21T00:00:00.000Z",
  });
  vi.mocked(useMembershipStatus).mockReturnValue({
    data: {
      currentPeriod: { id: "period-1", label: "2025/2026" },
      availablePeriod: { id: "period-2", label: "2026/2027" },
      activePeriod: { id: "period-2", label: "2026/2027" },
    },
    isPending: false,
    isError: false,
    isSuccess: true,
  } as never);
  vi.mocked(useMembershipResources).mockReturnValue({
    data: {
      period: { id: "period-1", label: "2025/2026" },
      resources: [
        {
          id: "resource-1",
          periodId: "period-1",
          title: "Alam Sutera member group",
          description: "Connect with members in your region.",
          url: "https://example.com/group",
          position: 1,
          region: {
            id: "region-1",
            name: "Alam Sutera",
            shortName: "ALSUT",
          },
        },
        {
          id: "resource-2",
          periodId: "period-1",
          title: "Member handbook",
          description: "Read the current member handbook.",
          url: null,
          position: 2,
          region: {
            id: "region-2",
            name: "Kemanggisan",
            shortName: "KMG",
          },
        },
      ],
    },
    isPending: false,
    isError: false,
    isSuccess: true,
    refetch: vi.fn(),
  } as never);

  renderApp(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText("Alam Sutera member group")).toBeInTheDocument();
  expect(screen.getByText("Member handbook")).toBeInTheDocument();
  expect(screen.getByText("ALSUT")).toBeInTheDocument();
  expect(screen.getByText("KMG")).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /open resource/i })).toHaveLength(
    1,
  );
  expect(screen.getByRole("link", { name: /reregister now/i })).toHaveAttribute(
    "href",
    "/reregister",
  );
  expect(screen.getByText(/member period 2026\/2027/i)).toBeInTheDocument();
  expect(screen.queryByText(/pengurus/i)).not.toBeInTheDocument();
});

test("prefills and submits the reregistration flow", async () => {
  const user = userEvent.setup();
  const mutate = vi.fn();
  mockProfile({
    registrationCompleted: true,
    registrationCompletedAt: "2026-07-21T00:00:00.000Z",
    memberType: "STUDENT",
    institutionType: "BINUS",
    phoneNumber: "08123456789",
    lineId: "himti-member",
    outlookEmail: "member@binus.ac.id",
    outlookEmailVerified: true,
    nim: "2600000000",
    graduateBatch: "28",
    universityId: "binus-id",
    studyProgramId: "cs-id",
    regionId: "alam-sutera-id",
    university: { id: "binus-id", name: "BINUS University" },
    studyProgram: { id: "cs-id", name: "Computer Science" },
    region: { id: "alam-sutera-id", name: "Alam Sutera" },
  });
  vi.mocked(useMembershipStatus).mockReturnValue({
    data: {
      currentPeriod: { id: "period-1", label: "2025/2026" },
      availablePeriod: { id: "period-2", label: "2026/2027" },
      activePeriod: { id: "period-2", label: "2026/2027" },
    },
    isPending: false,
    isError: false,
    isSuccess: true,
  } as never);
  vi.mocked(useUserRegistrationOptions).mockReturnValue({
    data: {
      universities: [{ id: "binus-id", name: "BINUS University" }],
      studyPrograms: [{ id: "cs-id", name: "Computer Science" }],
      binusRegions: [{ id: "alam-sutera-id", name: "Alam Sutera" }],
    },
  } as never);
  vi.mocked(useReregisterCurrentUser).mockReturnValue({
    isPending: false,
    mutate,
  } as never);

  renderApp(
    <MemoryRouter initialEntries={["/reregister"]}>
      <App />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("heading", { name: /confirm your member details/i }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText(/membership period/i)).toHaveValue("2026/2027");
  expect(screen.getByLabelText(/membership period/i)).toHaveAttribute(
    "readonly",
  );

  await user.click(screen.getByRole("button", { name: /continue/i }));
  expect(screen.getByLabelText(/full name/i)).toHaveValue("HIMTI Member");
  await user.click(screen.getByRole("button", { name: /continue/i }));
  expect(screen.getByText("Verified")).toBeInTheDocument();
  expect(screen.getByLabelText(/binusian batch/i)).toHaveValue("28");
  expect(
    screen.queryByRole("button", { name: /send verification/i }),
  ).toBeNull();
  await user.click(screen.getByRole("button", { name: /continue/i }));
  await user.click(
    screen.getByRole("button", { name: /submit reregistration/i }),
  );

  expect(mutate).toHaveBeenCalledWith(
    {
      memberType: "STUDENT",
      institutionType: "BINUS",
      name: "HIMTI Member",
      phoneNumber: "08123456789",
      lineId: "himti-member",
      universityId: "binus-id",
      regionId: "alam-sutera-id",
      outlookEmail: "member@binus.ac.id",
      studyProgramId: "cs-id",
      nim: "2600000000",
      graduateBatch: "28",
    },
    expect.any(Object),
  );
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

test("verifies an Outlook token once and shows success", async () => {
  vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { msg: "success" } });

  renderApp(
    <StrictMode>
      <MemoryRouter initialEntries={["/verify-outlook?token=success-token"]}>
        <App />
      </MemoryRouter>
    </StrictMode>,
  );

  expect(await screen.findByText(/email confirmed/i)).toBeInTheDocument();
  expect(apiClient.get).toHaveBeenCalledTimes(1);
  expect(apiClient.get).toHaveBeenCalledWith("/user/binus-email/verify", {
    params: { token: "success-token" },
  });
});

test("shows an invalid state for a rejected Outlook token", async () => {
  vi.mocked(apiClient.get).mockRejectedValueOnce({
    isAxiosError: true,
    response: { status: 400 },
  });

  renderApp(
    <MemoryRouter initialEntries={["/verify-outlook?token=invalid-token"]}>
      <App />
    </MemoryRouter>,
  );

  expect(await screen.findByText(/link unavailable/i)).toBeInTheDocument();
});

test("shows a retry option for a temporary verification failure", async () => {
  vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("Network error"));

  renderApp(
    <MemoryRouter initialEntries={["/verify-outlook?token=network-token"]}>
      <App />
    </MemoryRouter>,
  );

  expect(
    await screen.findByText(/verification unavailable/i),
  ).toBeInTheDocument();
  expect(screen.getByText("Try again")).toBeInTheDocument();
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
