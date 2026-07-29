import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { apiPaths } from "@/constants/api";
import { queryKeys } from "@/constants/query-keys";

export interface User {
  id: string;
  name: string;
  email: string;
}

export type UserOption = {
  id: string;
  name: string;
  shortName?: string | null;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  status: string;
  memberType: "STUDENT" | "LECTURER" | "OTHER" | null;
  institutionType: "BINUS" | "NON_BINUS" | null;
  universityName: string | null;
  studyProgramName: string | null;
  department: string | null;
  affiliation: string | null;
  outlookEmail: string | null;
  outlookEmailVerified: boolean;
  nim: string | null;
  graduateBatch: string | null;
  phoneNumber: string | null;
  lineId: string | null;
  universityId: string | null;
  studyProgramId: string | null;
  regionId: string | null;
  university: UserOption | null;
  studyProgram: UserOption | null;
  region: UserOption | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  registrationCompletedAt: string | null;
  roles: string[];
  permissions: string[];
  registrationCompleted: boolean;
  membershipPeriod: { id: string; label: string } | null;
  reregistrationPeriod: { id: string; label: string } | null;
};

export type UserRegistrationOptions = {
  universities: UserOption[];
  studyPrograms: UserOption[];
  binusRegions: UserOption[];
};

type UsersResponse = {
  msg: string;
  data: User[];
  meta: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
};

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () =>
      apiClient.get<UsersResponse>(apiPaths.users).then(({ data }) => data),
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () =>
      apiClient.get<UserProfile>(apiPaths.currentUser).then(({ data }) => data),
    retry: false,
  });
}

export function useUserRegistrationOptions() {
  return useQuery({
    queryKey: queryKeys.userRegistrationOptions,
    queryFn: () =>
      apiClient
        .get<{ data: UserRegistrationOptions }>(
          apiPaths.userRegistrationOptions,
        )
        .then(({ data }) => data.data),
  });
}

export function useCompleteCurrentUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.patch(apiPaths.completeCurrentUserProfile, payload),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.currentUser }),
        queryClient.invalidateQueries({ queryKey: queryKeys.membershipStatus }),
      ]),
  });
}

export function useUpdateCurrentUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name: string;
      phoneNumber: string;
      lineId: string;
    }) => apiClient.patch(apiPaths.updateCurrentUserProfile, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser }),
  });
}

export function useSendUserEmailVerification() {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post(apiPaths.sendUserEmailVerification, { email }),
  });
}
