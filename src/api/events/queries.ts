import { useQuery } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { apiPaths } from "@/constants/api";
import { queryKeys } from "@/constants/query-keys";
import type { components } from "@/generated/openapi";

type PublishedEventResponse =
  components["schemas"]["PublishedEventListResponse"];
export type MemberEvent = PublishedEventResponse["data"][number];
export type MemberSubevent = MemberEvent["subevents"][number];

export function usePublishedEvents() {
  return useQuery({
    queryKey: queryKeys.publishedEvents,
    queryFn: () =>
      apiClient
        .get<PublishedEventResponse>(apiPaths.publishedEvents)
        .then(({ data }) => data.data),
  });
}

type PublicEventListResponse = components["schemas"]["PublicEventListV1"];
type PublicEventDetailResponse = components["schemas"]["PublicEventDetailV1"];
export type PublicEvent = PublicEventListResponse["data"][number];
export type PublicSubEvent =
  PublicEventDetailResponse["data"]["subEvents"][number] & {
    destinationUrl?: string | null;
  };

export function usePublicEvents(page = 1) {
  return useQuery({
    queryKey: [...queryKeys.publicEvents, page],
    queryFn: () =>
      apiClient
        .get<PublicEventListResponse>("/api/v1/events", {
          params: { page, limit: 50 },
        })
        .then(({ data }) => data),
  });
}

export function usePublicEvent(eventId: string) {
  return useQuery({
    queryKey: queryKeys.publicEvent(eventId),
    queryFn: () =>
      apiClient
        .get<PublicEventDetailResponse>(
          `/api/v1/events/${encodeURIComponent(eventId)}`,
        )
        .then(({ data }) => data.data),
    enabled: Boolean(eventId),
  });
}
