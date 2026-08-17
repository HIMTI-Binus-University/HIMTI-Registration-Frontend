import { describe, expect, test } from "vitest";
import type { RegistrationDetail } from "@/api/registrations/queries";
import { buildResponsePayload, validateAnswers } from "./form";

const detail = {
  forms: [
    {
      id: "form-1",
      name: "Attendee",
      description: null,
      audience: "OWNER",
      isRequired: true,
      orderIndex: 0,
      questions: [
        {
          id: "name",
          fieldKey: "name",
          fieldType: "TEXT",
          helpText: null,
          isRequired: true,
          label: "Name",
          options: [],
          orderIndex: 0,
          validation: {},
        },
        {
          id: "topics",
          fieldKey: "topics",
          fieldType: "CHECKBOX",
          helpText: null,
          isRequired: true,
          label: "Topics",
          options: [{ id: "web", label: "Web", value: "web" }],
          orderIndex: 1,
          validation: {},
        },
      ],
    },
  ],
  submissions: [
    {
      id: "submission-1",
      formId: "form-1",
      revision: 7,
      status: "DRAFT",
      answers: [],
    },
  ],
} as unknown as RegistrationDetail;

describe("participant form contract", () => {
  test("validates required dynamic questions", () => {
    expect(validateAnswers(detail.forms, {})).toEqual({
      name: "This question is required.",
      topics: "This question is required.",
    });
  });

  test("serializes every supported field and omits unanswered optional values", () => {
    const types = [
      "TEXT",
      "TEXTAREA",
      "NUMBER",
      "DATE",
      "SELECT",
      "RADIO",
      "CHECKBOX",
    ].map((fieldType, index) => ({
      id: fieldType,
      fieldKey: fieldType,
      fieldType,
      helpText: null,
      isRequired: false,
      label: fieldType,
      options: [
        { id: `${fieldType}-option`, label: "Option", value: "option" },
      ],
      orderIndex: index,
      validation: {},
    }));
    const complete = {
      ...detail,
      forms: [{ ...detail.forms[0], questions: types }],
      submissions: [{ ...detail.submissions[0] }],
    } as RegistrationDetail;
    expect(
      buildResponsePayload(complete, {
        TEXT: "text",
        TEXTAREA: "area",
        NUMBER: "3",
        DATE: "2026-08-17",
        SELECT: "SELECT-option",
        RADIO: "RADIO-option",
        CHECKBOX: ["CHECKBOX-option"],
      }).submissions[0].answers,
    ).toEqual([
      { questionId: "TEXT", type: "TEXT", value: "text" },
      { questionId: "TEXTAREA", type: "TEXTAREA", value: "area" },
      { questionId: "NUMBER", type: "NUMBER", value: "3" },
      { questionId: "DATE", type: "DATE", value: "2026-08-17" },
      { questionId: "SELECT", type: "SELECT", optionId: "SELECT-option" },
      { questionId: "RADIO", type: "RADIO", optionId: "RADIO-option" },
      {
        questionId: "CHECKBOX",
        type: "CHECKBOX",
        optionIds: ["CHECKBOX-option"],
      },
    ]);
    expect(
      buildResponsePayload(complete, {
        TEXT: "",
        NUMBER: "",
        DATE: "",
        SELECT: "",
        RADIO: "",
        CHECKBOX: [],
      }).submissions[0].answers,
    ).toEqual([]);
  });

  test("uses question IDs, option IDs, submission ID, and loaded revision", () => {
    expect(
      buildResponsePayload(detail, { name: "Daffa", topics: ["web"] }),
    ).toEqual({
      submissions: [
        {
          submissionId: "submission-1",
          revision: 7,
          answers: [
            { questionId: "name", type: "TEXT", value: "Daffa" },
            { questionId: "topics", type: "CHECKBOX", optionIds: ["web"] },
          ],
        },
      ],
    });
  });
});
