import type {
  PostRegistrationAssignment,
  SavePostRegistrationResponse,
} from "@/api/post-registration/queries";
import type { RegistrationDetail } from "@/api/registrations/queries";
import { answerFor, type Answers } from "@/pages/event-registration/form";

export type DynamicForms = RegistrationDetail["forms"];

export function assignmentForms(
  assignment: PostRegistrationAssignment,
): DynamicForms {
  return [...assignment.sections]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((section) => ({
      id: section.id,
      name: section.title,
      description: section.description,
      orderIndex: section.orderIndex,
      audience: assignment.audience,
      isRequired: assignment.isRequired,
      questions: [...section.questions]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((question) => ({
          ...question,
          fieldType:
            question.fieldType as DynamicForms[number]["questions"][number]["fieldType"],
          validation:
            question.validation as DynamicForms[number]["questions"][number]["validation"],
        })),
    }));
}

export function answersFromAssignment(
  assignment: PostRegistrationAssignment,
): Answers {
  return Object.fromEntries(
    (assignment.response?.answers ?? []).flatMap((answer) =>
      typeof answer.value === "string" ||
      (Array.isArray(answer.value) &&
        answer.value.every((value) => typeof value === "string"))
        ? [[answer.questionId, answer.value as string | string[]]]
        : [],
    ),
  );
}

export function buildAssignmentPayload(
  assignment: PostRegistrationAssignment,
  answers: Answers,
): SavePostRegistrationResponse {
  const forms = assignmentForms(assignment);
  return {
    revision: assignment.response?.revision ?? null,
    answers: forms
      .flatMap((form) => form.questions)
      .map((question) =>
        answerFor(
          question,
          answers[question.id] ?? (question.fieldType === "CHECKBOX" ? [] : ""),
        ),
      )
      .filter(
        (answer): answer is NonNullable<typeof answer> => answer !== null,
      ),
  };
}
