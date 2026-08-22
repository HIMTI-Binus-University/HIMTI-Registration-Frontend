import { describe, expect, test } from "vitest";
import type { RegistrationDetail } from "@/api/registrations/queries";
import { rosterReadinessPresentation } from "./roster-readiness";

const detail = {
  status: "HOLDING",
  readiness: {
    submittable: false,
    blockerCodes: ["ORDER_NOT_SUBMITTABLE"],
    claimedSeatCount: 2,
    seatCount: 2,
    completedResponseCount: 2,
    requiredResponseCount: 2,
  },
} as RegistrationDetail;

describe("roster readiness presentation", () => {
  test("separates roster completion from submission availability", () => {
    expect(rosterReadinessPresentation(detail)).toMatchObject({
      rosterComplete: true,
      showSubmissionBlockers: true,
      badge: "Participant list complete",
    });
  });

  test.each(["PENDING_PAYMENT", "PAYMENT_REVIEW", "PENDING_APPROVAL", "APPROVED"] as const)(
    "does not present stale submission blockers after moving to %s",
    (status) => {
      const result = rosterReadinessPresentation({ ...detail, status });
      expect(result.showSubmissionBlockers).toBe(false);
      expect(result.workflow).not.toContain("submit");
    },
  );
});
