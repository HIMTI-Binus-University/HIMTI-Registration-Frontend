import { expect, test } from "vitest";
import type { PostRegistrationAssignment } from "@/api/post-registration/queries";
import {
  answersFromAssignment,
  assignmentForms,
  buildAssignmentPayload,
} from "./form";

const assignment = {
  id: "assignment-1",
  registrationId: "registration-1",
  formId: "form-1",
  logicalFormKey: "survey",
  formName: "Participant survey",
  formDescription: null,
  version: 7,
  audience: "BUYER",
  memberId: null,
  participant: { id: "user-1", name: "Daffa", email: "daffa@example.com" },
  isRequired: true,
  blocksCheckIn: true,
  opensAt: null,
  closesAt: null,
  assignedAt: "2026-08-21T00:00:00.000Z",
  orderIndex: 0,
  availability: "CORRECTION",
  completion: "NEEDS_CORRECTION",
  canEdit: true,
  canSubmit: true,
  correctionReason: "Update the participant name.",
  correctionDeadlineAt: "2026-08-22T00:00:00.000Z",
  reopenReason: null,
  reopenDeadlineAt: null,
  sections: [
    {
      id: "section-1",
      title: "Details",
      description: null,
      orderIndex: 0,
      questions: [
        {
          id: "text-1",
          fieldKey: "name",
          fieldType: "TEXT",
          label: "Name",
          helpText: null,
          isRequired: true,
          orderIndex: 0,
          options: [],
          validation: { minLength: 2 },
        },
        {
          id: "check-1",
          fieldKey: "topics",
          fieldType: "CHECKBOX",
          label: "Topics",
          helpText: null,
          isRequired: false,
          orderIndex: 1,
          options: [
            { id: "option-1", label: "Web", value: "web", orderIndex: 0 },
          ],
          validation: {},
        },
      ],
    },
  ],
  response: {
    id: "response-1",
    revision: 3,
    status: "DRAFT",
    answers: [
      {
        questionId: "text-1",
        type: "TEXT",
        value: "Daffa",
        selectedOptions: [],
      },
      {
        questionId: "check-1",
        type: "CHECKBOX",
        value: ["option-1"],
        selectedOptions: [{ id: "option-1", label: "Web", value: "web" }],
      },
    ],
  },
} satisfies PostRegistrationAssignment;

test("adapts the immutable assignment version to shared dynamic forms", () => {
  const forms = assignmentForms(assignment);
  expect(forms[0]).toMatchObject({
    id: "section-1",
    name: "Details",
    audience: "BUYER",
    isRequired: true,
  });
  expect(forms[0].questions.map((question) => question.id)).toEqual([
    "text-1",
    "check-1",
  ]);
});

test("hydrates answers and builds exact-version CAS save payload", () => {
  const answers = answersFromAssignment(assignment);
  expect(answers).toEqual({
    "text-1": "Daffa",
    "check-1": ["option-1"],
  });
  expect(buildAssignmentPayload(assignment, answers)).toEqual({
    revision: 3,
    answers: [
      { questionId: "text-1", type: "TEXT", value: "Daffa" },
      {
        questionId: "check-1",
        type: "CHECKBOX",
        optionIds: ["option-1"],
      },
    ],
  });
});

test("uses null revision for a new response", () => {
  expect(
    buildAssignmentPayload(
      { ...assignment, response: null },
      { "text-1": "Ada" },
    ),
  ).toMatchObject({ revision: null });
});
