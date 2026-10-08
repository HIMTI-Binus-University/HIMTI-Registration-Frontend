import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import apiClient from "@/config/api-client";
import { queryKeys } from "@/constants/query-keys";
import type { components, operations } from "@/generated/openapi";

export type RegistrationContext =
  components["schemas"]["EventRegistrationContextResponse"]["data"];
export type EventRegistration =
  components["schemas"]["EventRegistrationResponse"]["data"];
export type CreateRegistrationPayload = NonNullable<
  operations["createEventRegistration"]["requestBody"]
>["content"]["application/json"];
export type ReplaceAnswersPayload = NonNullable<
  operations["replaceMyEventRegistrationAnswers"]["requestBody"]
>["content"]["application/json"];
export type CreateBundlePayload = NonNullable<
  operations["createEventBundle"]["requestBody"]
>["content"]["application/json"];
export type JoinBundlePayload = NonNullable<
  operations["joinEventBundle"]["requestBody"]
>["content"]["application/json"];

type RegistrationResponse = components["schemas"]["EventRegistrationResponse"];
type RegistrationListResponse =
  operations["listMyEventRegistrations"]["responses"][200]["content"]["application/json"];

export function useEventRegistrationContext(eventId: string) {
  return useQuery({
    queryKey: queryKeys.eventRegistrationContext(eventId),
    queryFn: () =>
      apiClient
        .get<components["schemas"]["EventRegistrationContextResponse"]>(
          `/api/events/${encodeURIComponent(eventId)}/registration-context`,
        )
        .then(({ data }) => data.data),
    enabled: Boolean(eventId),
  });
}

export function useCreateEventRegistration(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRegistrationPayload) =>
      apiClient
        .post<RegistrationResponse>(
          `/api/events/${encodeURIComponent(eventId)}/registrations`,
          payload,
        )
        .then(({ data }) => data.data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.myEventRegistrations,
      }),
  });
}

export function useCreateEventBundle(eventId: string) {
  const queryClient = useQueryClient();
  const idempotencyKey = useRef(crypto.randomUUID());
  return useMutation({
    mutationFn: (payload: CreateBundlePayload) =>
      apiClient
        .post<
          operations["createEventBundle"]["responses"][201]["content"]["application/json"]
        >(`/api/events/${encodeURIComponent(eventId)}/bundles`, payload, {
          headers: { "Idempotency-Key": idempotencyKey.current },
        })
        .then(({ data }) => data.data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.myEventRegistrations,
      }),
  });
}

export function useJoinEventBundle(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JoinBundlePayload) =>
      apiClient
        .post<RegistrationResponse>(
          `/api/events/${encodeURIComponent(eventId)}/bundles/join`,
          payload,
        )
        .then(({ data }) => data.data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.myEventRegistrations,
      }),
  });
}

export function useMyEventRegistrations(enabled = true) {
  return useQuery({
    queryKey: queryKeys.myEventRegistrations,
    queryFn: () =>
      apiClient
        .get<RegistrationListResponse>("/api/me/event-registrations")
        .then(({ data }) => data.data),
    enabled,
    retry: false,
  });
}

export function useMyEventRegistration(registrationId: string) {
  return useQuery({
    queryKey: queryKeys.myEventRegistration(registrationId),
    queryFn: () =>
      apiClient
        .get<RegistrationResponse>(
          `/api/me/event-registrations/${encodeURIComponent(registrationId)}`,
        )
        .then(({ data }) => data.data),
    enabled: Boolean(registrationId),
    refetchInterval: (query) =>
      query.state.data?.status === "ASSEMBLING" ? 5000 : false,
  });
}

export function useReplaceMyEventRegistrationAnswers(
  registrationId: string,
  additional = false,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReplaceAnswersPayload) =>
      apiClient
        .put<RegistrationResponse>(
          `/api/me/event-registrations/${encodeURIComponent(registrationId)}/${additional ? "additional-answers" : "answers"}`,
          payload,
        )
        .then(({ data }) => data.data),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.myEventRegistration(registrationId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.myEventRegistrations,
        }),
      ]),
  });
}

export function useCancelMyEventRegistration(registrationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expectedRevision: number) =>
      apiClient
        .post<RegistrationResponse>(
          `/api/me/event-registrations/${encodeURIComponent(registrationId)}/cancel`,
          { expectedRevision },
        )
        .then(({ data }) => data.data),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.myEventRegistration(registrationId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.myEventRegistrations,
        }),
      ]),
  });
}

export function useLeaveMyBundle(registrationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expectedRevision: number) =>
      apiClient.post(
        `/api/me/event-registrations/${encodeURIComponent(registrationId)}/leave`,
        { expectedRevision },
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.myEventRegistrations,
        }),
        queryClient.removeQueries({
          queryKey: queryKeys.myEventRegistration(registrationId),
        }),
      ]),
  });
}

export function useReplaceMyBundleCode(registrationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expectedRevision: number) =>
      apiClient
        .post<
          operations["replaceMyBundleCode"]["responses"][200]["content"]["application/json"]
        >(
          `/api/me/event-registrations/${encodeURIComponent(registrationId)}/bundle-code/replace`,
          { expectedRevision },
        )
        .then(({ data }) => data.data),
    onSuccess: ({ registration }) =>
      queryClient.setQueryData(
        queryKeys.myEventRegistration(registrationId),
        registration,
      ),
  });
}
