import type { PostRegistrationAssignment } from "@/api/post-registration/queries";

export function postRegistrationCta(assignment: PostRegistrationAssignment) {
  if (assignment.canEdit) {
    if (assignment.completion === "NOT_STARTED") return "Start form";
    if (assignment.availability === "CORRECTION") return "Make correction";
    return "Continue form";
  }
  return assignment.availability === "UPCOMING" ? "Preview form" : "View form";
}

export function postRegistrationAvailability(availability: string) {
  return ({ OPEN: "Available now", UPCOMING: "Opens later", OVERDUE: "Closed", CORRECTION: "Correction requested", COMPLETED: "Completed" }[availability] ?? "View details");
}

export function postRegistrationCompletion(completion: string) {
  return ({ NOT_STARTED: "Not started", DRAFT: "In progress", NEEDS_CORRECTION: "Needs an update", SUBMITTED: "Completed", LOCKED: "Completed" }[completion] ?? "Status available in form");
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
