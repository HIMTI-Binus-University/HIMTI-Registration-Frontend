import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { apiPaths } from "@/constants/api";

export type Option = { id: string; name: string; shortName?: string | null };
export type Profile = {
  id: string; name: string; email: string; image: string | null; status: string;
  outlookEmail: string | null; outlookEmailVerified: boolean;
  nim: string | null; graduateBatch: string | null; phoneNumber: string | null; lineId: string | null;
  universityId: string | null; studyProgramId: string | null; regionId: string | null;
  university: Option | null; studyProgram: Option | null; region: Option | null;
  emailVerified: boolean;
  createdAt: string; updatedAt: string | null; createdBy: string | null; updatedBy: string | null;
  roles: string[]; permissions: string[]; registrationCompleted: boolean;
};
export type RegistrationOptions = { universities: Option[]; studyPrograms: Option[]; binusRegions: Option[] };

export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: () => apiClient.get<Profile>(apiPaths.profile).then((r) => r.data), retry: false });
}

export function useRegistrationOptions() {
  return useQuery({ queryKey: ["registration-options"], queryFn: () => apiClient.get<{ data: RegistrationOptions }>(apiPaths.options).then((r) => r.data.data) });
}

export function useCompleteProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiClient.patch<{ data: Profile }>(apiPaths.completeProfile, payload).then((r) => r.data.data),
    onSuccess: (profile) => client.setQueryData(["profile"], profile),
  });
}

export function useSendVerification() {
  return useMutation({ mutationFn: (email: string) => apiClient.post(apiPaths.sendVerification, { email }) });
}

export type MemberEvent = { id: string; name: string; publicDescription: string | null; coverImageUrl: string | null; subevents: Array<{ id: string; name: string; publicDescription: string | null; date: string; type: string; locationName: string | null; price: number }> };

export function usePublishedEvents() {
  return useQuery({ queryKey: ["published-events"], queryFn: () => apiClient.get<{ data: MemberEvent[] }>(apiPaths.publishedEvents).then((r) => r.data.data) });
}
