import { expect, test } from "vitest";
import { buildProfilePayload, type ProfileFormData } from "./payload";

const profile: ProfileFormData = {
  institutionType: "BINUS",
  name: "Daffa",
  phoneNumber: "08123456789",
  lineId: "daffa",
  universityId: "university-1",
  studyProgramId: "program-1",
  regionId: "region-1",
  nim: "2700000000",
  universityName: "Other University",
  studyProgramName: "Other Program",
};

test("builds only the selected institution path payload", () => {
  expect(buildProfilePayload(profile)).toEqual({
    institutionType: "BINUS",
    name: "Daffa",
    phoneNumber: "08123456789",
    lineId: "daffa",
    universityId: "university-1",
    studyProgramId: "program-1",
    regionId: "region-1",
    nim: "2700000000",
  });

  expect(
    buildProfilePayload({ ...profile, institutionType: "NON_BINUS" }),
  ).toEqual({
    institutionType: "NON_BINUS",
    name: "Daffa",
    phoneNumber: "08123456789",
    lineId: "daffa",
    universityName: "Other University",
    studyProgramName: "Other Program",
  });
});
