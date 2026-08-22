import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import apiClient from "@/config/api-client";
import { useMyTicket, useMyTickets, useTicketCredential } from "./queries";

vi.mock("@/config/api-client", () => ({ default: { get: vi.fn() } }));

const ticket = {
  id: "ticket/1",
  status: "ACTIVE",
  issuedAt: "2026-08-01T00:00:00.000Z",
  expiresAt: null,
  subEvent: { id: "event-1", name: "Techno", date: "2026-09-01T00:00:00.000Z" },
};

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => vi.clearAllMocks());

test("loads only participant-owned list and detail paths", async () => {
  vi.mocked(apiClient.get)
    .mockResolvedValueOnce({ data: { msg: "success", data: [ticket] } })
    .mockResolvedValueOnce({ data: { msg: "success", data: ticket } });
  const list = renderHook(() => useMyTickets(), { wrapper });
  await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
  const detail = renderHook(() => useMyTicket("ticket/1"), { wrapper });
  await waitFor(() => expect(detail.result.current.isSuccess).toBe(true));
  expect(apiClient.get).toHaveBeenNthCalledWith(1, "/api/v1/me/event-tickets");
  expect(apiClient.get).toHaveBeenNthCalledWith(2, "/api/v1/me/event-tickets/ticket%2F1");
});

test("does not fetch a credential before the ticket is confirmed presentable", async () => {
  const hook = renderHook(() => useTicketCredential("ticket/1", false), { wrapper });
  await waitFor(() => expect(hook.result.current.fetchStatus).toBe("idle"));
  expect(apiClient.get).not.toHaveBeenCalled();
});

test("fetches the owned credential only in presentation mode", async () => {
  vi.mocked(apiClient.get).mockResolvedValue({ data: { msg: "success", data: { credential: "ht1_private" } } });
  const hook = renderHook(() => useTicketCredential("ticket/1", true), { wrapper });
  await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
  expect(apiClient.get).toHaveBeenCalledWith("/api/v1/me/event-tickets/ticket%2F1/credential");
});

test("does not fetch credentials for an ineligible presentation", async () => {
  const hook = renderHook(() => useTicketCredential("ticket/1", false), { wrapper });
  await waitFor(() => expect(hook.result.current.fetchStatus).toBe("idle"));
  expect(apiClient.get).not.toHaveBeenCalled();
});
