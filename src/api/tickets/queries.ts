import { useQuery } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { queryKeys } from "@/constants/query-keys";
import type { operations } from "@/generated/openapi";

type TicketListResponse =
  operations["listMyEventTicketsV1"]["responses"][200]["content"]["application/json"];
type TicketResponse =
  operations["getMyEventTicketV1"]["responses"][200]["content"]["application/json"];
type CredentialResponse =
  operations["getMyEventTicketCredentialV1"]["responses"][200]["content"]["application/json"];
export type ParticipantTicket = TicketResponse["data"];
export type TicketStatus = ParticipantTicket["status"];

const ticketPath = (ticketId: string) =>
  `/api/me/event-tickets/${encodeURIComponent(ticketId)}`;

export function useMyTickets() {
  return useQuery({
    queryKey: queryKeys.ticketList,
    queryFn: () =>
      apiClient
        .get<TicketListResponse>("/api/me/event-tickets")
        .then(({ data }) => data.data),
    refetchOnWindowFocus: true,
  });
}

export function useMyTicket(ticketId: string) {
  return useQuery({
    queryKey: queryKeys.ticket(ticketId),
    queryFn: () =>
      apiClient
        .get<TicketResponse>(ticketPath(ticketId))
        .then(({ data }) => data.data),
    enabled: Boolean(ticketId),
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export function useTicketCredential(ticketId: string, presentable: boolean) {
  return useQuery({
    queryKey: queryKeys.ticketCredential(ticketId),
    queryFn: () =>
      apiClient
        .get<CredentialResponse>(`${ticketPath(ticketId)}/credential`)
        .then(({ data }) => data.data.credential),
    enabled: presentable && Boolean(ticketId),
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}
