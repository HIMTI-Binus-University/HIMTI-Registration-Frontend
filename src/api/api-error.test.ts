import { expect, test } from "vitest";
import { parseApiError } from "./api-error";

test("canonical API errors preserve code and question field errors", () => {
  expect(
    parseApiError({
      message: "Invalid answers",
      code: "VALIDATION_ERROR",
      details: { fieldErrors: { "question-1": "Required" } },
    }),
  ).toEqual({
    message: "Invalid answers",
    code: "VALIDATION_ERROR",
    details: { fieldErrors: { "question-1": "Required" } },
    fieldErrors: { "question-1": "Required" },
  });
});

test("maps array field errors by question ID and keeps the first deterministically", () => {
  expect(
    parseApiError({
      message: "Invalid",
      details: {
        fieldErrors: [
          { questionId: "q2", code: "BAD", message: "Second" },
          { questionId: "q1", code: "REQUIRED", message: "First" },
          { questionId: "q1", code: "OTHER", message: "Ignored" },
        ],
      },
    }).fieldErrors,
  ).toEqual({ q2: "Second", q1: "First" });
});
