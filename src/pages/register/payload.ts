import type { UserRegistrationOptions } from "@/api/users/queries";

export type UserType = "Student" | "Lecturer" | "Other";
export type InstitutionType = "BINUS" | "Non-BINUS";
export type RegistrationData = {
  userType: UserType | "";
  institutionType: InstitutionType | "";
  name: string;
  phone: string;
  personalEmail: string;
  lineId: string;
  nim: string;
  batch: string;
  binusEmail: string;
  region: string;
  major: string;
  university: string;
  institution: string;
  department: string;
  affiliation: string;
};

export function buildRegistrationPayload(
  data: RegistrationData,
  options: UserRegistrationOptions,
) {
  const common = {
    memberType: data.userType.toUpperCase(),
    institutionType: data.institutionType === "BINUS" ? "BINUS" : "NON_BINUS",
    name: data.name,
    phoneNumber: data.phone,
    lineId: data.lineId,
  };

  if (data.institutionType === "BINUS") {
    const binusUniversityId = options.universities.find((university) =>
      university.name.toLowerCase().includes("binus"),
    )?.id;
    const binus = {
      ...common,
      universityId: binusUniversityId,
      regionId: data.region,
      outlookEmail: data.binusEmail,
    };
    if (data.userType === "Student")
      return {
        ...binus,
        studyProgramId: data.major,
        nim: data.nim,
        graduateBatch: data.batch,
      };
    if (data.userType === "Lecturer")
      return { ...binus, department: data.department };
    return { ...binus, affiliation: data.affiliation };
  }

  const universityName =
    data.userType === "Other" ? data.institution : data.university;
  if (data.userType === "Student")
    return {
      ...common,
      universityName,
      studyProgramName: data.major,
      nim: data.nim,
    };
  if (data.userType === "Lecturer")
    return { ...common, universityName, department: data.department };
  return { ...common, universityName, affiliation: data.affiliation };
}
