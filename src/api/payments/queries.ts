import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { queryKeys } from "@/constants/query-keys";
import type { components } from "@/generated/openapi";

export type ParticipantPayment =
  components["schemas"]["ParticipantEventPaymentDetailV1"];

type PaymentResponse = { data: ParticipantPayment; msg: "success" };
const fallbackProofTypes: ParticipantPayment["bankSnapshot"]["acceptedProofTypes"] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const fallbackMaxProofBytes = 10 * 1024 * 1024;

export const normalizeParticipantPayment = (
  payment: ParticipantPayment,
): ParticipantPayment => {
  const snapshot = payment.bankSnapshot as Partial<
    ParticipantPayment["bankSnapshot"]
  >;
  return {
    ...payment,
    bankSnapshot: {
      ...payment.bankSnapshot,
      acceptedProofTypes: Array.isArray(snapshot.acceptedProofTypes)
        ? snapshot.acceptedProofTypes
        : fallbackProofTypes,
      maxProofBytes:
        typeof snapshot.maxProofBytes === "number" &&
        Number.isFinite(snapshot.maxProofBytes) &&
        snapshot.maxProofBytes > 0
          ? snapshot.maxProofBytes
          : fallbackMaxProofBytes,
    },
  };
};
type UploadResponse = {
  data: {
    paymentId: string;
    proofId: string;
    status: "PROOF_SUBMITTED";
  };
  msg: "success";
};

export function useParticipantPayment(registrationId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.registrationPayment(registrationId),
    queryFn: () =>
      apiClient
        .get<PaymentResponse>(
          `/api/v1/me/event-registrations/${encodeURIComponent(registrationId)}/payment`,
        )
        .then(({ data }) => normalizeParticipantPayment(data.data)),
    enabled: enabled && Boolean(registrationId),
  });
}

export function useSubmitPaymentProof(
  registrationId: string,
  paymentId: string,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (percentage: number) => void;
    }) => {
      const body = new FormData();
      body.append("proof", file);
      return apiClient
        .post<UploadResponse>(
          `/api/v1/me/event-payments/${encodeURIComponent(paymentId)}/proof`,
          body,
          {
            onUploadProgress: ({ loaded, total }) => {
              if (total)
                onProgress?.(Math.min(100, Math.round((loaded / total) * 100)));
            },
          },
        )
        .then(({ data }) => data.data);
    },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: queryKeys.registrationPayment(registrationId),
        }),
        client.invalidateQueries({
          queryKey: queryKeys.registration(registrationId),
        }),
        client.invalidateQueries({ queryKey: queryKeys.registrations }),
        client.invalidateQueries({
          queryKey: queryKeys.registrationContexts,
        }),
      ]);
    },
  });
}

export async function getPrivateProofBlob(contentPath: string) {
  if (!/^\/api\/v1\/private\/payment-proofs\/[^/]+\/content$/.test(contentPath))
    throw new Error("The proof content path is invalid.");
  return apiClient
    .get<Blob>(contentPath, { responseType: "blob" })
    .then(({ data }) => data);
}
