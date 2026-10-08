import { expect, test } from "vitest";
import {
  buildAnswerPayload,
  restoreAnswers,
  validateAnswers,
  type RegistrationQuestion,
} from "./answers";

const questions = [
  { id: "name", label: "Display name", type: "TEXT", isRequired: true },
  { id: "size", label: "Size", type: "CHECKBOX", isRequired: true },
  { id: "age", label: "Age", type: "NUMBER", isRequired: false },
] as RegistrationQuestion[];

test("builds typed full replacements and validates required answers", () => {
  const values = { name: "Daffa", size: ["m", "l"], age: "20" };
  expect(validateAnswers(questions, values)).toEqual({});
  expect(buildAnswerPayload(questions, values)).toEqual([
    { questionId: "name", value: "Daffa" },
    { questionId: "size", value: ["m", "l"] },
    { questionId: "age", value: 20 },
  ]);
  expect(validateAnswers(questions, { name: "", size: [] })).toEqual({
    name: "Display name is required",
    size: "Size is required",
  });
});

test("restores scalar, date, and selected option answers", () => {
  expect(
    restoreAnswers([
      { formQuestionId: "age", numberValue: "20" },
      { formQuestionId: "date", dateValue: "2026-09-06T00:00:00.000Z" },
      {
        formQuestionId: "size",
        selectedOptions: [{ option: { value: "m" } }],
      },
    ]),
  ).toEqual({ age: "20", date: "2026-09-06", size: ["m"] });
  expect(
    restoreAnswers(
      [
        {
          formQuestionId: "choice",
          selectedOptions: [{ option: { value: "yes" } }],
        },
      ],
      [{ id: "choice", type: "RADIO" } as RegistrationQuestion],
    ),
  ).toEqual({ choice: "yes" });
});
