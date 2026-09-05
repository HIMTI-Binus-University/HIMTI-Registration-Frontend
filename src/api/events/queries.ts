import { useQuery } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { queryKeys } from "@/constants/query-keys";
import type { paths } from "@/generated/openapi";

type PublicEvent = {
  id: string;
  eventGroupId: string | null;
  name: string;
  publicDescription: string | null;
  startsAt: string | null;
  endsAt: string | null;
  locationName: string | null;
  locationAddress: string | null;
  locationUrl: string | null;
  coverImageUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  status: "PUBLISHED" | "CLOSED" | "CANCELLED";
  eventGroup: {
    name: string;
    coverImageUrl: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
  } | null;
};

export type PublicEventGroup = {
  id: string;
  name: string;
  publicDescription: string | null;
  coverImageUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  events: PublicEvent[];
};

type EventListResponse = { data: PublicEvent[] };
type EventResponse = { data: PublicEvent };
type EventGroupListResponse = { data: PublicEventGroup[] };

const eventGroupsPath: keyof paths = "/api/event-groups";
const eventsPath: keyof paths = "/api/events";

export function usePublicEventGroups() {
  return useQuery({
    queryKey: queryKeys.publicEventGroups,
    queryFn: () =>
      apiClient
        .get<EventGroupListResponse>(eventGroupsPath)
        .then(({ data }) => data.data),
  });
}

export function usePublicEvents() {
  return useQuery({
    queryKey: queryKeys.publicEvents,
    queryFn: () =>
      apiClient
        .get<EventListResponse>(eventsPath)
        .then(({ data }) => data.data),
  });
}

export function usePublicEvent(eventId: string) {
  return useQuery({
    queryKey: queryKeys.publicEvent(eventId),
    queryFn: () =>
      apiClient
        .get<EventResponse>(`/api/events/${encodeURIComponent(eventId)}`)
        .then(({ data }) => data.data),
    enabled: Boolean(eventId),
  });
}
