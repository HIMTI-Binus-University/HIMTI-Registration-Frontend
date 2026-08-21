import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { queryKeys } from "@/constants/query-keys";
import type { components, operations } from "@/generated/openapi";

type ContextResponse = components["schemas"]["RegistrationContextV1"];
type CreateRequest = components["schemas"]["CreateEventRegistrationV1"];
type DetailResponse = components["schemas"]["EventRegistrationDetailV1"];
type ListResponse = components["schemas"]["EventRegistrationListV1"];
export type RegistrationDetail = DetailResponse["data"];
export type RegistrationSummary = ListResponse["data"][number];
export type ResponsePayload =
  components["schemas"]["ReplaceRegistrationResponsesV1"];
type CreateInvitationBody =
  operations["createRegistrationInvitationV1"]["requestBody"]["content"]["application/json"];
type InvitationMutationResponse =
  operations["createRegistrationInvitationV1"]["responses"][201]["content"]["application/json"];
type InvitationMutation = InvitationMutationResponse["data"];
type ResendInvitationResponse =
  operations["resendRegistrationInvitationV1"]["responses"][200]["content"]["application/json"];
type RevokeInvitationResponse =
  operations["revokeRegistrationInvitationV1"]["responses"][200]["content"]["application/json"];
type DeclineInvitationResponse =
  operations["declineRegistrationInvitationV1"]["responses"][200]["content"]["application/json"];
type InvitationContextResponse =
  operations["getRegistrationInvitationContextV1"]["responses"][200]["content"]["application/json"];

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
    const cacheSafeRegistration = { ...registration };
    delete cacheSafeRegistration.createdInvitations;
    client.setQueryData(
      queryKeys.registration(registration.id),
      cacheSafeRegistration,
    );
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

export function useInvitationContext(token: string) {
  return useQuery({
    queryKey: queryKeys.registrationInvitation,
    queryFn: () =>
      apiClient
        .post<InvitationContextResponse>(
          "/api/v1/registration-invitations/context",
          { token },
        )
        .then(({ data }) => data.data),
    enabled: Boolean(token),
    retry: false,
    gcTime: 0,
  });
}

export function useAcceptInvitation(token: string) {
  const update = useRegistrationInvalidation();
  return useMutation({
    mutationFn: () =>
      apiClient
        .post<DetailResponse>("/api/v1/registration-invitations/accept", {
          token,
        })
        .then(({ data }) => data.data),
    onSuccess: update,
  });
}

export function useDeclineInvitation(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient
        .post<DeclineInvitationResponse>(
          "/api/v1/registration-invitations/decline",
          { token },
        )
        .then(({ data }) => data.data),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: queryKeys.registrationInvitation,
      });
      void client.invalidateQueries({ queryKey: queryKeys.registrations });
    },
  });
}

export function useCreateRegistrationInvitation(registrationId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInvitationBody) =>
      apiClient
        .post<ResendInvitationResponse>(
          `${detailPath(registrationId)}/invitations`,
          body,
        )
        .then(({ data }) => data.data),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: queryKeys.registration(registrationId),
      }),
  });
}

export function useResendRegistrationInvitation(registrationId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      invitationId,
      email,
    }: {
      invitationId: string;
      email?: string;
    }) =>
      apiClient
        .post<RevokeInvitationResponse>(
          `${detailPath(registrationId)}/invitations/${encodeURIComponent(invitationId)}/resend`,
          email ? { email } : undefined,
        )
        .then(({ data }) => data.data),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: queryKeys.registration(registrationId),
      }),
  });
}

export function useRevokeRegistrationInvitation(registrationId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      apiClient
        .post<InvitationMutationResponse>(
          `${detailPath(registrationId)}/invitations/${encodeURIComponent(invitationId)}/revoke`,
        )
        .then(({ data }) => data.data),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: queryKeys.registration(registrationId),
      }),
  });
}

export type { InvitationMutation };
