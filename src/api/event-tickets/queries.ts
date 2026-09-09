import { useQuery } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { queryKeys } from "@/constants/query-keys";
import type { operations } from "@/generated/openapi";

export type EventTicket =
  operations["listMyEventTickets"]["responses"][200]["content"]["application/json"]["data"][number];

export function useMyEventTickets() {
  return useQuery({
    queryKey: queryKeys.myEventTickets,
    queryFn: () =>
      apiClient
        .get<{ data: EventTicket[] }>("/api/me/event-tickets")
        .then(({ data }) => data.data),
  });
}

export function useMyEventTicket(ticketId: string) {
  return useQuery({
    queryKey: queryKeys.myEventTicket(ticketId),
    queryFn: () =>
      apiClient
        .get<{ data: EventTicket }>(
          `/api/me/event-tickets/${encodeURIComponent(ticketId)}`,
        )
        .then(({ data }) => data.data),
    enabled: Boolean(ticketId),
  });
}

export function useMyEventTicketCredential(ticketId: string, enabled: boolean) {
  return useQuery({
    queryKey: [...queryKeys.myEventTicket(ticketId), "credential"],
    queryFn: () =>
      apiClient
        .get<
          operations["getMyEventTicketCredential"]["responses"][200]["content"]["application/json"]
        >(`/api/me/event-tickets/${encodeURIComponent(ticketId)}/credential`)
        .then(({ data }) => data.data),
    enabled: Boolean(ticketId) && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
