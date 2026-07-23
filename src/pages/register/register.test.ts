import { describe, expect, test } from "vitest";
import {
  buildRegistrationPayload,
  type RegistrationData,
} from "@/pages/register/payload";
import type { UserRegistrationOptions } from "@/api/users/queries";

const options: UserRegistrationOptions = {
  universities: [{ id: "binus-id", name: "BINUS University" }],
  studyPrograms: [{ id: "cs-id", name: "Computer Science" }],
  binusRegions: [{ id: "alam-sutera-id", name: "Alam Sutera" }],
};

const base: RegistrationData = {
  userType: "Student",
  institutionType: "BINUS",
  membershipPosition: "Staff",
  name: "HIMTI Member",
  phone: "08123456789",
  personalEmail: "google@example.com",
  lineId: "himti-member",
  nim: "2600000000",
  batch: "28",
  binusEmail: "member@binus.ac.id",
  region: "alam-sutera-id",
  major: "cs-id",
  university: "Example University",
  institution: "Example Organization",
  department: "Computer Science",
  affiliation: "Community member",
};

const common = {
  name: "HIMTI Member",
  phoneNumber: "08123456789",
  lineId: "himti-member",
  membershipPosition: "STAFF",
};

describe("registration payloads", () => {
  test.each([
    [
      "BINUS student",
      { userType: "Student", institutionType: "BINUS" },
      {
        ...common,
        memberType: "STUDENT",
        institutionType: "BINUS",
        universityId: "binus-id",
        regionId: "alam-sutera-id",
        outlookEmail: "member@binus.ac.id",
        studyProgramId: "cs-id",
        nim: "2600000000",
        graduateBatch: "28",
      },
    ],
    [
      "BINUS lecturer",
      { userType: "Lecturer", institutionType: "BINUS" },
      {
        ...common,
        memberType: "LECTURER",
        institutionType: "BINUS",
        universityId: "binus-id",
        regionId: "alam-sutera-id",
        outlookEmail: "member@binus.ac.id",
        department: "Computer Science",
      },
    ],
    [
      "BINUS other member",
      { userType: "Other", institutionType: "BINUS" },
      {
        ...common,
        memberType: "OTHER",
        institutionType: "BINUS",
        universityId: "binus-id",
        regionId: "alam-sutera-id",
        outlookEmail: "member@binus.ac.id",
        affiliation: "Community member",
      },
    ],
    [
      "non-BINUS student",
      {
        userType: "Student",
        institutionType: "Non-BINUS",
        major: "Computer Science",
      },
      {
        ...common,
        memberType: "STUDENT",
        institutionType: "NON_BINUS",
        universityName: "Example University",
        studyProgramName: "Computer Science",
        nim: "2600000000",
      },
    ],
    [
      "non-BINUS lecturer",
      { userType: "Lecturer", institutionType: "Non-BINUS" },
      {
        ...common,
        memberType: "LECTURER",
        institutionType: "NON_BINUS",
        universityName: "Example University",
        department: "Computer Science",
      },
    ],
    [
      "non-BINUS other member",
      { userType: "Other", institutionType: "Non-BINUS" },
      {
        ...common,
        memberType: "OTHER",
        institutionType: "NON_BINUS",
        universityName: "Example Organization",
        affiliation: "Community member",
      },
    ],
  ])("builds the %s contract", (_, path, expected) => {
    expect(
      buildRegistrationPayload(
        { ...base, ...(path as Partial<RegistrationData>) },
        options,
      ),
    ).toEqual(expected);
  });
});
