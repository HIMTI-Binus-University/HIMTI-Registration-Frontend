import type { RegistrationDetail } from "@/api/registrations/queries";

const assemblingStatuses = new Set<RegistrationDetail["status"]>([
  "DRAFT",
  "AWAITING_MEMBERS",
  "HOLDING",
  "NEEDS_CORRECTION",
]);

const workflowCopy: Partial<Record<RegistrationDetail["status"], string>> = {
  SUBMITTED: "Your registration has been submitted.",
  PENDING_PAYMENT: "Your participant list is complete. Payment is the next step.",
  PAYMENT_REVIEW: "Your payment is being reviewed.",
  PENDING_APPROVAL: "Your registration is waiting for organizer approval.",
  APPROVED: "Your registration is approved.",
  WAITLISTED: "Your registration is on the waitlist.",
  REJECTED: "Your registration was not approved.",
  EXPIRED: "This registration has expired.",
  CANCELLED: "This registration has been cancelled.",
};

export function rosterReadinessPresentation(detail: RegistrationDetail) {
  const rosterComplete =
    detail.readiness.claimedSeatCount === detail.readiness.seatCount &&
    detail.readiness.completedResponseCount ===
      detail.readiness.requiredResponseCount;
  return {
    rosterComplete,
    showSubmissionBlockers:
      assemblingStatuses.has(detail.status) && !detail.readiness.submittable,
    badge: rosterComplete
      ? "Participant list complete"
      : "Participant list incomplete",
    workflow:
      workflowCopy[detail.status] ??
      (detail.readiness.submittable
        ? "All participant details are complete. You can submit the registration."
        : "Complete every seat and required response before submitting."),
  };
}
