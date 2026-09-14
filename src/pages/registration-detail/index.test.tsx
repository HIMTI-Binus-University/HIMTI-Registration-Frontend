import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import apiClient from "@/config/api-client";
import RegistrationDetailPage from ".";

vi.mock("@/config/api-client", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));
vi.mock("@/components/layout/app-header", () => ({ AppHeader: () => null }));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test("added questions appear with registration answers and use their own revision", async () => {
  const question = {
    id: "extra",
    logicalId: "logical",
    label: "Diet",
    fieldKey: "diet",
    type: "TEXT",
    isRequired: true,
    orderIndex: 2,
    options: [],
    validation: {},
  };
  const answeredQuestion = {
    ...question,
    id: "answered-extra",
    logicalId: "answered-logical",
    label: "Arrival time",
    fieldKey: "arrivalTime",
    orderIndex: 1,
  };
  const registration = {
    id: "order-2",
    revision: 9,
    eventId: "event",
    orderNumber: "ORDER-002",
    status: "PENDING_PAYMENT",
    totalMinor: "10000",
    profile: null,
    event: { name: "Workshop", cancellationClosesAt: null },
    ticketPackage: { name: "Individual" },
    members: [
      {
        isCurrentUser: true,
        status: "LOCKED",
        submissions: [],
        supplementalRevision: 3,
        supplementalRequests: [
          { id: "request", question, answeredAt: null, withdrawnAt: null },
          {
            id: "answered-request",
            question: answeredQuestion,
            answer: "09:00",
            answeredAt: "2026-09-08T09:00:00.000Z",
            withdrawnAt: null,
          },
        ],
      },
    ],
  };
  vi.mocked(apiClient.get).mockResolvedValue({ data: { data: registration } });
  vi.mocked(apiClient.put).mockResolvedValue({ data: { data: registration } });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/registrations/order-2"]}>
        <Routes>
          <Route
            path="/registrations/:registrationId"
            element={<RegistrationDetailPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  const answers = (
    await screen.findByRole("heading", {
      name: "Registration answers",
    })
  ).closest("section");
  expect(answers).not.toBeNull();
  expect(within(answers!).getByRole("textbox", { name: /Diet/ })).toBeEnabled();
  expect(
    within(answers!).getByRole("textbox", { name: /Arrival time/ }),
  ).toBeDisabled();
  expect(
    within(answers!).getByRole("textbox", { name: /Arrival time/ }),
  ).toHaveValue("09:00");
  expect(
    within(answers!)
      .getAllByRole("textbox")
      .map((field) => field.getAttribute("aria-label")),
  ).toEqual(["Arrival time", "Diet"]);
  expect(screen.queryByText(/additional|supplemental|outstanding/i)).toBeNull();
  expect(screen.queryByText(/currently unavailable/i)).toBeNull();
  expect(screen.getByText("PENDING PAYMENT")).toBeInTheDocument();
  fireEvent.change(screen.getByRole("textbox", { name: /Diet/ }), {
    target: { value: "Vegetarian" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save answers" }));
  await waitFor(() =>
    expect(apiClient.put).toHaveBeenCalledWith(
      "/api/me/event-registrations/order-2/additional-answers",
      {
        expectedRevision: 3,
        answers: [{ questionId: "extra", value: "Vegetarian" }],
      },
    ),
  );
  expect(screen.getByText("PENDING PAYMENT")).toBeInTheDocument();
  client.clear();
});

test("answered added questions are read-only without a save action", async () => {
  const registration = {
    id: "order-3",
    revision: 1,
    eventId: "event",
    orderNumber: "ORDER-003",
    status: "CONFIRMED",
    totalMinor: "0",
    profile: null,
    event: { name: "Workshop", cancellationClosesAt: null },
    ticketPackage: { name: "Individual" },
    members: [
      {
        isCurrentUser: true,
        status: "LOCKED",
        submissions: [],
        supplementalRevision: 4,
        supplementalRequests: [
          {
            id: "answered-request",
            question: {
              id: "answered-extra",
              logicalId: "answered-logical",
              label: "Diet",
              fieldKey: "diet",
              type: "TEXT",
              isRequired: true,
              orderIndex: 1,
              options: [],
              validation: {},
            },
            answer: "Vegetarian",
            answeredAt: "2026-09-08T09:00:00.000Z",
            withdrawnAt: null,
          },
        ],
      },
    ],
  };
  vi.mocked(apiClient.get).mockResolvedValue({ data: { data: registration } });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/registrations/order-3"]}>
        <Routes>
          <Route
            path="/registrations/:registrationId"
            element={<RegistrationDetailPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  expect(await screen.findByRole("textbox", { name: /Diet/ })).toBeDisabled();
  expect(screen.getByRole("textbox", { name: /Diet/ })).toHaveValue(
    "Vegetarian",
  );
  expect(screen.queryByRole("button", { name: "Save answers" })).toBeNull();
  client.clear();
});

test("unapproved cancellation requires confirmation and sends the expected revision once", async () => {
  // jsdom has no native modal implementation; browser focus trapping is not simulated.
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false;
    },
  });
  const registration = {
    id: "order-1",
    revision: 3,
    eventId: "event-1",
    orderNumber: "ORDER-001",
    status: "PENDING_PAYMENT",
    totalMinor: "0",
    members: [{ isCurrentUser: true, status: "LOCKED" }],
    profile: null,
    event: { name: "Workshop", cancellationClosesAt: null },
    ticketPackage: { name: "Individual" },
  };
  vi.mocked(apiClient.get).mockResolvedValue({ data: { data: registration } });
  let reject!: (error: Error) => void;
  vi.mocked(apiClient.post).mockImplementation(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/registrations/order-1"]}>
        <Routes>
          <Route
            path="/registrations/:registrationId"
            element={<RegistrationDetailPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  fireEvent.click(
    await screen.findByRole("button", { name: "Cancel registration" }),
  );
  let dialog = screen.getByRole("dialog");
  expect(dialog).toHaveTextContent("ORDER-001");
  expect(dialog).toHaveTextContent("Workshop");
  fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
  expect(apiClient.post).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Cancel registration" }));
  dialog = screen.getByRole("dialog");
  const confirm = within(dialog).getByRole("button", {
    name: "Cancel registration",
  });
  fireEvent.click(confirm);
  fireEvent.click(confirm);
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledTimes(1));
  expect(apiClient.post).toHaveBeenCalledWith(
    "/api/me/event-registrations/order-1/cancel",
    { expectedRevision: 3 },
  );
  expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeDisabled();
  reject(new Error("offline"));
  await waitFor(() =>
    expect(within(dialog).getByRole("alert")).toBeInTheDocument(),
  );
  expect(
    within(dialog).getByRole("button", { name: "Cancel registration" }),
  ).toBeEnabled();
  client.clear();
});

test("confirmed registrations do not expose participant cancellation", async () => {
  const registration = {
    id: "confirmed-order",
    revision: 4,
    eventId: "event-1",
    orderNumber: "ORDER-004",
    status: "CONFIRMED",
    seatCount: 1,
    totalMinor: "0",
    members: [{ isCurrentUser: true, status: "LOCKED" }],
    profile: null,
    event: { name: "Workshop", cancellationClosesAt: null },
    ticketPackage: { name: "Individual" },
  };
  vi.mocked(apiClient.get).mockResolvedValue({ data: { data: registration } });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/registrations/confirmed-order"]}>
        <Routes>
          <Route
            path="/registrations/:registrationId"
            element={<RegistrationDetailPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  await screen.findByText(/ORDER-004/);
  expect(
    screen.queryByRole("button", { name: "Cancel registration" }),
  ).toBeNull();
  client.clear();
});

test("shows the API Bundle Code after a direct refresh without navigation state", async () => {
  const registration = {
    id: "bundle",
    revision: 2,
    eventId: "event",
    orderNumber: "BUNDLE-001",
    status: "ASSEMBLING",
    seatCount: 2,
    totalMinor: "90000",
    bundleCode: "AAAA-BBBB-CCCC-DDDD",
    profile: null,
    event: { name: "Mini Soccer", cancellationClosesAt: null },
    ticketPackage: { name: "Team Bundle" },
    members: [
      {
        id: "one",
        name: "Member One",
        isCurrentUser: true,
        ready: true,
        status: "ACTIVE",
        submissions: [],
        supplementalRequests: [],
        supplementalRevision: 1,
      },
      {
        id: "two",
        name: "Member Two",
        isCurrentUser: false,
        ready: false,
        status: "ACTIVE",
      },
    ],
  };
  vi.mocked(apiClient.get).mockResolvedValue({ data: { data: registration } });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/registrations/bundle"]}>
        <Routes>
          <Route
            path="/registrations/:registrationId"
            element={<RegistrationDetailPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  expect(await screen.findByText("Member One (you)")).toBeInTheDocument();
  expect(screen.getByText("Member Two")).toBeInTheDocument();
  expect(screen.getByText("AAAA-BBBB-CCCC-DDDD")).toBeInTheDocument();
  expect(screen.getByText("Answers pending")).toBeInTheDocument();
  expect(screen.queryByText(/leader|owner|buyer|payer/i)).toBeNull();
  client.clear();
});
