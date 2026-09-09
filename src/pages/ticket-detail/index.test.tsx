import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import TicketDetailPage from ".";

let attendance: { checkedInAt: string; checkedOutAt: null } | null = null;
const credential = vi.fn((enabled: boolean) => {
  void enabled;
  return {
    data: undefined,
    isPending: false,
    isError: false,
  };
});
vi.mock("@/api/event-tickets/queries", () => ({
  useMyEventTicket: () => ({
    isPending: false,
    isError: false,
    data: {
      id: "ticket",
      eventId: "event",
      status: "ACTIVE",
      issuedAt: "2026-09-09T00:00:00.000Z",
      expiresAt: null,
      event: {
        name: "Workshop",
        startsAt: null,
        endsAt: null,
        attendanceEnabled: false,
        attendanceCheckoutEnabled: false,
      },
      attendance,
    },
  }),
  useMyEventTicketCredential: (_id: string, enabled: boolean) => {
    credential(enabled);
    return enabled
      ? {
          data: {
            credential: "AAAAA-BBBBB-CCCCC-DDDDD-EEEEE-F",
            qrPayload: "AAAAA-BBBBB-CCCCC-DDDDD-EEEEE-F",
          },
          isPending: false,
          isError: false,
        }
      : { data: undefined, isPending: false, isError: false };
  },
}));
vi.mock("@/api/auth", () => ({
  useSession: () => ({ data: null }),
  signOut: vi.fn(),
}));

afterEach(() => {
  attendance = null;
  cleanup();
});

describe("TicketDetailPage", () => {
  it("shows the QR directly before check-in without a redundant reveal button", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/tickets/ticket"]}>
          <Routes>
            <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(
      screen.getByText("AAAAA-BBBBB-CCCCC-DDDDD-EEEEE-F"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Show QR ticket" }),
    ).not.toBeInTheDocument();
    expect(credential).toHaveBeenLastCalledWith(true);
  });

  it("does not request or display the credential after check-in", () => {
    attendance = {
      checkedInAt: "2026-09-09T16:24:00.000Z",
      checkedOutAt: null,
    };
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/tickets/ticket"]}>
          <Routes>
            <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText("Checked-in event ticket")).toBeInTheDocument();
    expect(
      screen.queryByText("AAAAA-BBBBB-CCCCC-DDDDD-EEEEE-F"),
    ).not.toBeInTheDocument();
    expect(credential).toHaveBeenLastCalledWith(false);
  });
});
