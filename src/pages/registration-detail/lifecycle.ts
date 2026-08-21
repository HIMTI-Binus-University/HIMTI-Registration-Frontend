import type { RegistrationDetail } from "@/api/registrations/queries";

type Status = RegistrationDetail["status"];

const editable = new Set<Status>([
  "DRAFT",
  "AWAITING_MEMBERS",
  "HOLDING",
  "NEEDS_CORRECTION",
]);

const paymentAvailable = new Set<Status>([
  "SUBMITTED",
  "PENDING_PAYMENT",
  "PAYMENT_REVIEW",
  "PENDING_APPROVAL",
  "APPROVED",
  "NEEDS_CORRECTION",
  "WAITLISTED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
]);

export const canOpenResponseEditor = (detail: RegistrationDetail) =>
  editable.has(detail.status) &&
  (detail.viewer.capabilities.includes("SAVE_BUYER") ||
    detail.viewer.capabilities.includes("SAVE_OWN_MEMBER"));

export const shouldQueryPayment = (detail: RegistrationDetail) =>
  detail.viewer.role === "BUYER" &&
  detail.package.priceMinor !== "0" &&
  paymentAvailable.has(detail.status);
