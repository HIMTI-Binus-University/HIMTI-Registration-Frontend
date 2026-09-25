import type { UserRegistrationOptions } from "@/api/users/queries";
import { resolveBinusUniversity, type RegistrationData } from "./payload";

export type RegistrationErrors = Partial<
  Record<keyof RegistrationData, string>
>;
export type RegistrationValidation = {
  fields: RegistrationErrors;
  form?: string;
};
export type RegistrationContext = {
  options?: UserRegistrationOptions;
  membershipPeriodAvailable: boolean;
  reregister: boolean;
  emailVerified: boolean;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const validBinusEmail = (email: string) =>
  email.length <= 100 &&
  emailPattern.test(email) &&
  /@(?:binus\.ac\.id|binus\.edu)$/i.test(email);

export function validateRegistrationStep(
  data: RegistrationData,
  step: number,
  context: RegistrationContext,
): RegistrationValidation {
  const fields: RegistrationErrors = {};
  let form: string | undefined;
  const required = (
    key: keyof RegistrationData,
    label: string,
    max: number,
  ) => {
    const value = data[key].trim();
    if (!value) fields[key] = `${label} is required`;
    else if (value.length > max)
      fields[key] = `${label} must be ${max} characters or fewer`;
  };
  if (step === 0) {
    if (!["Student", "Lecturer", "Other"].includes(data.userType))
      fields.userType = "Choose a user type";
    if (!["BINUS", "Non-BINUS"].includes(data.institutionType))
      fields.institutionType = "Choose an institution type";
    if (
      context.reregister &&
      !["Officer", "Staff", "Member"].includes(data.membershipPosition)
    )
      fields.membershipPosition = "Choose a HIMTI position";
    if (!context.membershipPeriodAvailable)
      form = "No active membership period is available";
  }
  if (step === 1) {
    required("name", "Full name", 255);
    required("phone", "Phone number", 20);
    if (
      !fields.phone &&
      (!/[0-9]/.test(data.phone) || !/^[+\d\s\-()/]+$/.test(data.phone))
    )
      fields.phone = "Enter a valid phone number";
    if (
      !emailPattern.test(data.personalEmail.trim()) ||
      data.personalEmail.trim().length > 100
    )
      fields.personalEmail =
        "Your Google email is invalid. Sign in with another account";
    if (data.lineId.trim().length > 50)
      fields.lineId = "LINE ID must be 50 characters or fewer";
  }
  if (step === 2) {
    if (!data.userType || !data.institutionType) {
      form = "Choose your registration path first";
    } else if (data.institutionType === "BINUS") {
      required("binusEmail", "BINUS email", 100);
      if (!fields.binusEmail && !validBinusEmail(data.binusEmail.trim()))
        fields.binusEmail = "Use a valid @binus.ac.id or @binus.edu email";
      else if (!fields.binusEmail && !context.emailVerified)
        fields.binusEmail = "Verify your BINUS email";
      if (!context.options) form = "Registration options could not be loaded";
      else {
        if (!resolveBinusUniversity(context.options))
          form = "BINUS University is unavailable";
        if (
          !context.options.binusRegions.some(
            (region) => region.id === data.region,
          )
        )
          fields.region = "Choose an available BINUS region";
        if (
          data.userType === "Student" &&
          !context.options.studyPrograms.some(
            (program) => program.id === data.major,
          )
        )
          fields.major = "Choose an available BINUS major";
      }
      if (data.userType === "Student") {
        required("nim", "NIM", 50);
        required("batch", "BINUSian batch", 20);
      }
    } else {
      required(
        data.userType === "Other" ? "institution" : "university",
        "University / institution",
        255,
      );
      if (data.userType === "Student") {
        required("nim", "Student ID / NIM", 50);
        required("major", "Major", 255);
      }
    }
    if (data.userType === "Lecturer")
      required("department", "Department / program", 255);
    if (data.userType === "Other")
      required("affiliation", "Affiliation / role", 255);
  }
  return { fields, form };
}
