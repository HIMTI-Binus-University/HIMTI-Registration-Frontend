import type {
  RegistrationDetail,
  ResponsePayload,
} from "@/api/registrations/queries";

export type Answers = Record<string, string | string[]>;
export type FormErrors = Record<string, string>;
type Form = RegistrationDetail["forms"][number];
type Question = Form["questions"][number];

const supported = new Set([
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "DATE",
  "SELECT",
  "RADIO",
  "CHECKBOX",
]);

export function sortedForms(forms: RegistrationDetail["forms"]) {
  return [...forms]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((form) => ({
      ...form,
      questions: [...form.questions].sort(
        (a, b) => a.orderIndex - b.orderIndex,
      ),
    }));
}

export function validateAnswers(
  forms: RegistrationDetail["forms"],
  answers: Answers,
) {
  const errors: FormErrors = {};
  for (const form of forms)
    for (const question of form.questions) {
      if (!supported.has(question.fieldType)) {
        errors[question.id] =
          question.fieldType === "FILE"
            ? "File questions are not supported yet."
            : "This question type is not supported.";
        continue;
      }
      const value = answers[question.id];
      const empty = Array.isArray(value) ? value.length === 0 : !value?.trim();
      if (question.isRequired && empty)
        errors[question.id] = "This question is required.";
      if (
        question.fieldType === "NUMBER" &&
        !empty &&
        !Number.isFinite(Number(value))
      )
        errors[question.id] = "Enter a valid number.";
      const text = typeof value === "string" ? value : "";
      if (
        !empty &&
        question.validation.minLength !== undefined &&
        text.length < question.validation.minLength
      )
        errors[question.id] =
          `Enter at least ${question.validation.minLength} characters.`;
      if (
        !empty &&
        question.validation.maxLength !== undefined &&
        text.length > question.validation.maxLength
      )
        errors[question.id] =
          `Enter no more than ${question.validation.maxLength} characters.`;
      if (
        question.fieldType === "NUMBER" &&
        !empty &&
        question.validation.min !== undefined &&
        Number(value) < question.validation.min
      )
        errors[question.id] = `Enter ${question.validation.min} or more.`;
      if (
        question.fieldType === "NUMBER" &&
        !empty &&
        question.validation.max !== undefined &&
        Number(value) > question.validation.max
      )
        errors[question.id] = `Enter ${question.validation.max} or less.`;
      if (
        question.fieldType === "DATE" &&
        !empty &&
        question.validation.minDate &&
        text < question.validation.minDate
      )
        errors[question.id] = `Choose ${question.validation.minDate} or later.`;
      if (
        question.fieldType === "DATE" &&
        !empty &&
        question.validation.maxDate &&
        text > question.validation.maxDate
      )
        errors[question.id] =
          `Choose ${question.validation.maxDate} or earlier.`;
      if (
        (question.fieldType === "SELECT" || question.fieldType === "RADIO") &&
        !empty &&
        !question.options.some((option) => option.id === value)
      )
        errors[question.id] = "Choose an available option.";
      if (
        question.fieldType === "CHECKBOX" &&
        Array.isArray(value) &&
        value.some((id) => !question.options.some((option) => option.id === id))
      )
        errors[question.id] = "Choose only available options.";
      if (
        question.fieldType === "CHECKBOX" &&
        Array.isArray(value) &&
        question.validation.minSelections !== undefined &&
        value.length < question.validation.minSelections
      )
        errors[question.id] =
          `Choose at least ${question.validation.minSelections} options.`;
      if (
        question.fieldType === "CHECKBOX" &&
        Array.isArray(value) &&
        question.validation.maxSelections !== undefined &&
        value.length > question.validation.maxSelections
      )
        errors[question.id] =
          `Choose no more than ${question.validation.maxSelections} options.`;
    }
  return errors;
}

function answerFor(question: Question, value: string | string[]) {
  const empty = Array.isArray(value) ? value.length === 0 : value.trim() === "";
  if (empty) return null;
  switch (question.fieldType) {
    case "TEXT":
    case "TEXTAREA":
    case "NUMBER":
    case "DATE":
      return {
        questionId: question.id,
        type: question.fieldType,
        value: String(value ?? ""),
      } as const;
    case "SELECT":
    case "RADIO":
      return {
        questionId: question.id,
        type: question.fieldType,
        optionId: String(value),
      } as const;
    case "CHECKBOX":
      if (!Array.isArray(value) || value.length === 0) return null;
      return {
        questionId: question.id,
        type: "CHECKBOX",
        optionIds: Array.isArray(value) ? value : [],
      } as const;
    default:
      return null;
  }
}

export function buildResponsePayload(
  detail: RegistrationDetail,
  answers: Answers,
): ResponsePayload {
  return {
    submissions: detail.submissions.map((submission) => {
      const form = detail.forms.find((item) => item.id === submission.formId);
      return {
        submissionId: submission.id,
        revision: submission.revision,
        answers: (form?.questions ?? [])
          .map((question) =>
            answerFor(
              question,
              answers[question.id] ??
                (question.fieldType === "CHECKBOX" ? [] : ""),
            ),
          )
          .filter(
            (answer): answer is NonNullable<typeof answer> => answer !== null,
          ),
      };
    }),
  };
}

export function answersFromDetail(detail: RegistrationDetail): Answers {
  return Object.fromEntries(
    detail.submissions.flatMap((submission) =>
      submission.answers.map((answer) => [answer.questionId, answer.value]),
    ),
  );
}
