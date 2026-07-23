import { useQuery } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { apiPaths } from "@/constants/api";
import { queryKeys } from "@/constants/query-keys";

export type MemberEvent = {
  id: string;
  name: string;
  publicDescription: string | null;
  coverImageUrl: string | null;
  subevents: MemberSubevent[];
};

export type MemberSubevent = {
  id: string;
  name: string;
  publicDescription: string | null;
  date: string;
  type: string;
  locationName: string | null;
  locationUrl: string | null;
  posterUrl: string | null;
  destinationUrl: string | null;
  position: number;
  price: number;
  maxParticipants: number | null;
  isRegistrationOpen: boolean;
};

export function usePublishedEvents() {
  return useQuery({
    queryKey: queryKeys.publishedEvents,
    queryFn: () =>
      apiClient
        .get<{ data: MemberEvent[] }>(apiPaths.publishedEvents)
        .then(({ data }) => data.data),
  });
}
