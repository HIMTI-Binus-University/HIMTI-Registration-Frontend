import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { apiPaths } from "@/constants/api";
import { queryKeys } from "@/constants/query-keys";
import type { RegistrationPayload } from "@/pages/register/payload";

export type MembershipPeriod = { id: string; label: string };

export type MembershipStatus = {
  currentPeriod: MembershipPeriod | null;
  availablePeriod: MembershipPeriod | null;
  activePeriod: MembershipPeriod | null;
};

export type MembershipResource = {
  id: string;
  periodId: string;
  title: string;
  description: string;
  url: string | null;
  position: number;
  region: { id: string; name: string; shortName: string | null } | null;
};

export type MembershipResources = {
  period: MembershipPeriod;
  resources: MembershipResource[];
};

export function useMembershipStatus() {
  return useQuery({
    queryKey: queryKeys.membershipStatus,
    queryFn: () =>
      apiClient
        .get<{ data: MembershipStatus }>(apiPaths.membershipStatus)
        .then(({ data }) => data.data),
  });
}

export function useMembershipResources() {
  return useQuery({
    queryKey: queryKeys.membershipResources,
    queryFn: () =>
      apiClient
        .get<{ data: MembershipResources }>(apiPaths.membershipResources)
        .then(({ data }) => data.data),
  });
}

export function useReregisterCurrentUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegistrationPayload) =>
      apiClient.patch(apiPaths.reregisterCurrentUser, payload),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.currentUser }),
        queryClient.invalidateQueries({ queryKey: queryKeys.membershipStatus }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.membershipResources,
        }),
      ]),
  });
}
