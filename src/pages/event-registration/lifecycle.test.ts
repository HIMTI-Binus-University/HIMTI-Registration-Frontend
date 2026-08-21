import { describe, expect, test } from "vitest";
import type { RegistrationDetail } from "@/api/registrations/queries";
import {
  isCompletedSubmissionOutcome,
  isCorrectionExpired,
  revisionFingerprint,
} from "./lifecycle";

const detail = (status: RegistrationDetail["status"]) =>
  ({
    status,
    correctionDeadlineAt: "2026-08-22T12:00:00.000Z",
    submissions: [{ id: "response", revision: 3 }],
  }) as unknown as RegistrationDetail;

describe("initial registration correction lifecycle", () => {
  test("does not treat an unresolved correction as successful resubmission", () => {
    expect(isCompletedSubmissionOutcome(detail("NEEDS_CORRECTION"))).toBe(
      false,
    );
    expect(isCompletedSubmissionOutcome(detail("DRAFT"))).toBe(false);
    expect(isCompletedSubmissionOutcome(detail("PENDING_APPROVAL"))).toBe(true);
    expect(isCompletedSubmissionOutcome(detail("PENDING_PAYMENT"))).toBe(true);
  });

  test("uses the server deadline and revisions when reconciling saves", () => {
    expect(
      isCorrectionExpired(
        detail("NEEDS_CORRECTION"),
        new Date("2026-08-22T12:00:00.000Z"),
      ),
    ).toBe(true);
    expect(revisionFingerprint(detail("NEEDS_CORRECTION"))).toBe("response:3");
  });
});
