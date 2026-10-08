import type {
  RegistrationContext,
  ReplaceAnswersPayload,
} from "@/api/event-registrations/queries";
import type { UserProfile } from "@/api/users/queries";

export type RegistrationQuestion = NonNullable<
  RegistrationContext["form"]
>["sections"][number]["questions"][number];
export type AnswerValues = Record<string, string | string[]>;

export type StoredAnswer = {
  formQuestionId: string;
  textValue?: string | null;
  numberValue?: number | string | null;
  dateValue?: string | null;
  selectedOptions?: { option?: { value?: string } }[];
};

export const profileValues = (profile: UserProfile) => ({
  name: profile.name,
  email: profile.email,
  outlookEmail: profile.outlookEmail,
  nim: profile.nim,
  university: profile.university?.name ?? profile.universityName,
  studyProgram: profile.studyProgram?.name ?? profile.studyProgramName,
  region: profile.region?.name ?? null,
  phoneNumber: profile.phoneNumber,
});

export function missingProfileFields(profile: UserProfile) {
  const values = profileValues(profile);
  const required: (keyof typeof values)[] = ["name", "email", "phoneNumber"];
  required.push("university", "studyProgram");
  if (profile.institutionType === "BINUS")
    required.push("nim", "outlookEmail", "region");
  return [
    ...(!profile.institutionType ? ["institutionType"] : []),
    ...required.filter((field) => !values[field]),
  ];
}

export const formatIdr = (minor: string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(minor));

export const allQuestions = (
  sections: { questions: RegistrationQuestion[] }[],
) => sections.flatMap(({ questions }) => questions);

export const emptyAnswers = (questions: RegistrationQuestion[]): AnswerValues =>
  Object.fromEntries(
    questions.map((question) => [
      question.id,
      question.type === "CHECKBOX" ? [] : "",
    ]),
  );

export const restoreAnswers = (
  answers: StoredAnswer[],
  questions: RegistrationQuestion[] = [],
): AnswerValues =>
  Object.fromEntries(
    answers.map((answer) => {
      const selected = answer.selectedOptions
        ?.map(({ option }) => option?.value)
        .filter((value): value is string => Boolean(value));
      const question = questions.find(({ id }) => id === answer.formQuestionId);
      const value = selected?.length
        ? question?.type === "CHECKBOX" || !question
          ? selected
          : selected[0]
        : answer.numberValue != null
          ? String(answer.numberValue)
          : answer.dateValue
            ? answer.dateValue.slice(0, 10)
            : (answer.textValue ?? "");
      return [answer.formQuestionId, value];
    }),
  );

export function validateAnswers(
  questions: RegistrationQuestion[],
  values: AnswerValues,
) {
  return Object.fromEntries(
    questions.flatMap((question) => {
      const value = values[question.id];
      const missing = Array.isArray(value)
        ? value.length === 0
        : !value?.trim();
      return question.isRequired && missing
        ? [[question.id, `${question.label} is required`]]
        : [];
    }),
  );
}

export function buildAnswerPayload(
  questions: RegistrationQuestion[],
  values: AnswerValues,
): ReplaceAnswersPayload["answers"] {
  return questions.reduce<ReplaceAnswersPayload["answers"]>(
    (answers, question) => {
      const value = values[question.id];
      if (Array.isArray(value)) {
        if (value.length) answers.push({ questionId: question.id, value });
      } else if (value?.trim()) {
        answers.push({
          questionId: question.id,
          value: question.type === "NUMBER" ? Number(value) : value,
        });
      }
      return answers;
    },
    [],
  );
}
