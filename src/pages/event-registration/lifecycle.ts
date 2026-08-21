import type { RegistrationDetail } from "@/api/registrations/queries";

export const isCorrection = (detail: RegistrationDetail) =>
  detail.status === "NEEDS_CORRECTION";

export const isCorrectionExpired = (
  detail: RegistrationDetail,
  now = new Date(),
) =>
  isCorrection(detail) &&
  Boolean(
    detail.correctionDeadlineAt && now >= new Date(detail.correctionDeadlineAt),
  );

export const isCompletedSubmissionOutcome = (detail: RegistrationDetail) =>
  detail.status !== "DRAFT" && detail.status !== "NEEDS_CORRECTION";

export const revisionFingerprint = (detail: RegistrationDetail) =>
  detail.submissions.map((item) => `${item.id}:${item.revision}`).join("|");
