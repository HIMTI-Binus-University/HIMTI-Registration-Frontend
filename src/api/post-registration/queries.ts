import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { queryKeys } from "@/constants/query-keys";
import type { components, operations } from "@/generated/openapi";

type ListResponse =
  components["schemas"]["PostRegistrationAssignmentListResponseV1"];
type DetailResponse =
  components["schemas"]["PostRegistrationAssignmentResponseV1"];
export type PostRegistrationAssignment = DetailResponse["data"];
export type SavePostRegistrationResponse =
  operations["saveMyPostRegistrationResponseV1"]["requestBody"]["content"]["application/json"];

const assignmentsPath = (registrationId: string) =>
  `/api/v1/me/event-registrations/${encodeURIComponent(registrationId)}/post-registration-assignments`;
const assignmentPath = (registrationId: string, assignmentId: string) =>
  `${assignmentsPath(registrationId)}/${encodeURIComponent(assignmentId)}`;

export function usePostRegistrationAssignments(
  registrationId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.postRegistrationAssignments(registrationId),
    queryFn: () =>
      apiClient
        .get<ListResponse>(assignmentsPath(registrationId))
        .then(({ data }) => data.data),
    enabled: enabled && Boolean(registrationId),
  });
}

export function usePostRegistrationAssignment(
  registrationId: string,
  assignmentId: string,
) {
  return useQuery({
    queryKey: queryKeys.postRegistrationAssignment(
      registrationId,
      assignmentId,
    ),
    queryFn: () =>
      apiClient
        .get<DetailResponse>(assignmentPath(registrationId, assignmentId))
        .then(({ data }) => data.data),
    enabled: Boolean(registrationId && assignmentId),
    retry: false,
  });
}

function useAssignmentInvalidation(
  registrationId: string,
  assignmentId: string,
) {
  const client = useQueryClient();
  return (assignment: PostRegistrationAssignment) => {
    client.setQueryData(
      queryKeys.postRegistrationAssignment(registrationId, assignmentId),
      assignment,
    );
    void client.invalidateQueries({
      queryKey: queryKeys.postRegistrationAssignments(registrationId),
    });
  };
}

export function useSavePostRegistrationResponse(
  registrationId: string,
  assignmentId: string,
) {
  const update = useAssignmentInvalidation(registrationId, assignmentId);
  return useMutation({
    mutationFn: (body: SavePostRegistrationResponse) =>
      apiClient
        .put<DetailResponse>(
          `${assignmentPath(registrationId, assignmentId)}/response`,
          body,
        )
        .then(({ data }) => data.data),
    onSuccess: update,
  });
}

export function useSubmitPostRegistrationResponse(
  registrationId: string,
  assignmentId: string,
) {
  const update = useAssignmentInvalidation(registrationId, assignmentId);
  return useMutation({
    mutationFn: ({
      revision,
      idempotencyKey,
    }: {
      revision: number;
      idempotencyKey: string;
    }) =>
      apiClient
        .post<DetailResponse>(
          `${assignmentPath(registrationId, assignmentId)}/submit`,
          { revision },
          { headers: { "Idempotency-Key": idempotencyKey } },
        )
        .then(({ data }) => data.data),
    onSuccess: update,
  });
}
