import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { queryKeys } from "@/constants/query-keys";
import type { components } from "@/generated/openapi";

type ContextResponse = components["schemas"]["RegistrationContextV1"];
type CreateRequest = components["schemas"]["CreateEventRegistrationV1"];
type DetailResponse = components["schemas"]["EventRegistrationDetailV1"];
type ListResponse = components["schemas"]["EventRegistrationListV1"];
export type RegistrationDetail = DetailResponse["data"];
export type RegistrationSummary = ListResponse["data"][number];
export type ResponsePayload =
  components["schemas"]["ReplaceRegistrationResponsesV1"];

const detailPath = (id: string) =>
  `/api/v1/me/event-registrations/${encodeURIComponent(id)}`;

export function useRegistrationContext(
  subEventId: string,
  inviteToken?: string,
) {
  return useQuery({
    queryKey: queryKeys.registrationContext(subEventId, inviteToken),
    queryFn: () =>
      apiClient
        .get<ContextResponse>(
          `/api/v1/sub-events/${encodeURIComponent(subEventId)}/registration-context`,
          { params: inviteToken ? { inviteToken } : undefined },
        )
        .then(({ data }) => data.data),
    enabled: Boolean(subEventId),
    retry: false,
  });
}

export function useMyRegistrations(page = 1) {
  return useQuery({
    queryKey: queryKeys.registrationList(page),
    queryFn: () =>
      apiClient
        .get<ListResponse>("/api/v1/me/event-registrations", {
          params: { page, limit: 50 },
        })
        .then(({ data }) => data),
  });
}

export function useRegistration(registrationId: string) {
  return useQuery({
    queryKey: queryKeys.registration(registrationId),
    queryFn: () =>
      apiClient
        .get<DetailResponse>(detailPath(registrationId))
        .then(({ data }) => data.data),
    enabled: Boolean(registrationId),
  });
}

function useRegistrationInvalidation() {
  const client = useQueryClient();
  return (registration: RegistrationDetail) => {
    client.setQueryData(queryKeys.registration(registration.id), registration);
    void client.invalidateQueries({ queryKey: queryKeys.registrations });
    void client.invalidateQueries({
      queryKey: queryKeys.registrationContext(registration.subEvent.id),
      exact: false,
    });
  };
}

export function useCreateRegistration(subEventId: string) {
  const update = useRegistrationInvalidation();
  return useMutation({
    mutationFn: (body: CreateRequest) =>
      apiClient
        .post<DetailResponse>(
          `/api/v1/sub-events/${encodeURIComponent(subEventId)}/registrations`,
          body,
        )
        .then(({ data }) => data.data),
    onSuccess: update,
  });
}

export function useReplaceRegistrationResponses(registrationId: string) {
  const update = useRegistrationInvalidation();
  return useMutation({
    mutationFn: (body: ResponsePayload) =>
      apiClient
        .put<DetailResponse>(`${detailPath(registrationId)}/response`, body)
        .then(({ data }) => data.data),
    onSuccess: update,
  });
}

export function useSubmitRegistration(registrationId: string) {
  const update = useRegistrationInvalidation();
  return useMutation({
    mutationFn: (idempotencyKey: string) =>
      apiClient
        .post<DetailResponse>(
          `${detailPath(registrationId)}/submit`,
          undefined,
          {
            headers: { "Idempotency-Key": idempotencyKey },
          },
        )
        .then(({ data }) => data.data),
    onSuccess: update,
  });
}

export function useCancelRegistration(registrationId: string) {
  const update = useRegistrationInvalidation();
  return useMutation({
    mutationFn: (reason?: string) =>
      apiClient
        .post<DetailResponse>(`${detailPath(registrationId)}/cancel`, {
          reason,
        })
        .then(({ data }) => data.data),
    onSuccess: update,
  });
}
