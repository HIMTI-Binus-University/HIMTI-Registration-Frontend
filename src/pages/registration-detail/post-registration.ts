import type { PostRegistrationAssignment } from "@/api/post-registration/queries";

export function postRegistrationCta(assignment: PostRegistrationAssignment) {
  if (assignment.canEdit) {
    if (assignment.completion === "NOT_STARTED") return "Start form";
    if (assignment.availability === "CORRECTION") return "Make correction";
    return "Continue form";
  }
  return assignment.availability === "UPCOMING" ? "Preview form" : "View form";
}

export function postRegistrationOrganizerNotice(
  assignment: PostRegistrationAssignment,
) {
  if (assignment.availability === "CORRECTION")
    return {
      kind: "correction" as const,
      title: "Correction requested",
      reason: assignment.correctionReason,
      deadlineAt: assignment.correctionDeadlineAt,
    };
  if (
    assignment.canEdit &&
    (assignment.reopenReason || assignment.reopenDeadlineAt)
  )
    return {
      kind: "reopen" as const,
      title: "Response window reopened",
      reason: assignment.reopenReason,
      deadlineAt: assignment.reopenDeadlineAt,
    };
  return null;
}
