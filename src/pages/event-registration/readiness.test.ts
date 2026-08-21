import { describe, expect, test } from "vitest";
import { readinessMessage } from "./readiness";

describe("participant readiness copy", () => {
  test("uses authoritative aggregates and blockers", () => {
    expect(
      readinessMessage({
        submittable: false,
        blockerCodes: ["UNCLAIMED_SEATS", "RESPONSES_INCOMPLETE"],
        claimedSeatCount: 2,
        seatCount: 4,
        completedResponseCount: 1,
        requiredResponseCount: 3,
      } as Parameters<typeof readinessMessage>[0]),
    ).toContain("2 of 4 seats claimed; 1 of 3 required responses complete");
  });

  test("trusts submittable instead of inferred counts", () => {
    expect(
      readinessMessage({ submittable: true } as Parameters<
        typeof readinessMessage
      >[0]),
    ).toBe("This registration is ready to submit.");
  });
});
