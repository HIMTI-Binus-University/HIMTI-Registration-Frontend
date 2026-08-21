import { expect, test } from "vitest";
import type { PostRegistrationAssignment } from "@/api/post-registration/queries";
import {
  postRegistrationCta,
  postRegistrationOrganizerNotice,
} from "./post-registration";

const assignment = {
  canEdit: false,
  availability: "UPCOMING",
  completion: "NOT_STARTED",
} as PostRegistrationAssignment;

test.each([
  [{ ...assignment, availability: "UPCOMING" }, "Preview form"],
  [{ ...assignment, availability: "OVERDUE" }, "View form"],
  [
    {
      ...assignment,
      availability: "COMPLETED",
      completion: "LOCKED",
    },
    "View form",
  ],
  [{ ...assignment, canEdit: true, availability: "OPEN" }, "Start form"],
  [
    {
      ...assignment,
      canEdit: true,
      availability: "OPEN",
      completion: "DRAFT",
    },
    "Continue form",
  ],
  [
    {
      ...assignment,
      canEdit: true,
      availability: "CORRECTION",
      completion: "NEEDS_CORRECTION",
    },
    "Make correction",
  ],
] as const)(
  "maps authoritative assignment state to its CTA",
  (value, label) => {
    expect(postRegistrationCta(value as PostRegistrationAssignment)).toBe(
      label,
    );
  },
);

test("prefers correction context over reopen context in correction state", () => {
  expect(
    postRegistrationOrganizerNotice({
      ...assignment,
      canEdit: true,
      availability: "CORRECTION",
      correctionReason: "Fix the attendee name.",
      correctionDeadlineAt: "2026-08-23T10:00:00.000Z",
      reopenReason: "Old reopen reason",
      reopenDeadlineAt: "2026-08-24T10:00:00.000Z",
    }),
  ).toEqual({
    kind: "correction",
    title: "Correction requested",
    reason: "Fix the attendee name.",
    deadlineAt: "2026-08-23T10:00:00.000Z",
  });
});

test("uses reopen context for an editable response reopened after its deadline", () => {
  expect(
    postRegistrationOrganizerNotice({
      ...assignment,
      canEdit: true,
      availability: "OPEN",
      reopenReason: "Extended after the original deadline.",
      reopenDeadlineAt: "2026-08-24T10:00:00.000Z",
    }),
  ).toEqual({
    kind: "reopen",
    title: "Response window reopened",
    reason: "Extended after the original deadline.",
    deadlineAt: "2026-08-24T10:00:00.000Z",
  });
});

test("hides stale reopen context after the response locks", () => {
  expect(
    postRegistrationOrganizerNotice({
      ...assignment,
      availability: "COMPLETED",
      completion: "LOCKED",
      reopenReason: "Previously reopened",
      reopenDeadlineAt: "2026-08-24T10:00:00.000Z",
    }),
  ).toBeNull();
});
