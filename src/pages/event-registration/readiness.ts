import type { RegistrationDetail } from "@/api/registrations/queries";

type Readiness = RegistrationDetail["readiness"];

const blockerCopy: Record<string, string> = {
  UNCLAIMED_SEATS: "Some package seats are not claimed.",
  PENDING_INVITATIONS: "Some invitations are still pending.",
  RESPONSES_INCOMPLETE: "Required participant responses are incomplete.",
  MEMBER_RESPONSES_INCOMPLETE: "Required participant responses are incomplete.",
};

export function readinessMessage(readiness: Readiness) {
  if (readiness.submittable) return "This registration is ready to submit.";
  const blockers = readiness.blockerCodes.map(
    (code) => blockerCopy[code] ?? code.toLowerCase().replaceAll("_", " "),
  );
  const aggregate = `${readiness.claimedSeatCount} of ${readiness.seatCount} seats claimed; ${readiness.completedResponseCount} of ${readiness.requiredResponseCount} required responses complete.`;
  return `Your responses are saved, but whole-order submission is blocked. ${aggregate}${blockers.length ? ` ${blockers.join(" ")}` : ""}`;
}
