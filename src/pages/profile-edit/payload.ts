import type { UpdateCurrentUserProfilePayload } from "@/api/users/queries";

export type ProfileFormData = {
  institutionType: "BINUS" | "NON_BINUS";
  name: string;
  phoneNumber: string;
  lineId: string;
  universityId: string;
  studyProgramId: string;
  regionId: string;
  nim: string;
  universityName: string;
  studyProgramName: string;
};

export function buildProfilePayload(
  data: ProfileFormData,
): UpdateCurrentUserProfilePayload {
  const common = {
    institutionType: data.institutionType,
    name: data.name,
    phoneNumber: data.phoneNumber,
    lineId: data.lineId,
  };

  return data.institutionType === "BINUS"
    ? {
        ...common,
        institutionType: "BINUS",
        universityId: data.universityId,
        studyProgramId: data.studyProgramId,
        regionId: data.regionId,
        nim: data.nim,
      }
    : {
        ...common,
        institutionType: "NON_BINUS",
        universityName: data.universityName,
        studyProgramName: data.studyProgramName,
      };
}
