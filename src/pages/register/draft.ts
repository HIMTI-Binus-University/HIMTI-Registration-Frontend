import type { RegistrationData } from "@/pages/register/payload";

const DRAFT_VERSION = 1;
export const REGISTRATION_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

const registrationDataKeys: Array<keyof RegistrationData> = [
  "userType",
  "institutionType",
  "name",
  "phone",
  "personalEmail",
  "lineId",
  "nim",
  "batch",
  "binusEmail",
  "region",
  "major",
  "university",
  "institution",
  "department",
  "affiliation",
];

export interface RegistrationDraftContext {
  userId: string;
  mode: "register" | "reregister";
  membershipPeriodId: string | null;
}

export interface RegistrationDraft {
  step: number;
  data: RegistrationData;
  verificationSentFor: string | null;
}

interface StoredRegistrationDraft extends RegistrationDraft {
  version: number;
  context: RegistrationDraftContext;
  expiresAt: number;
}

export const registrationDraftKey = ({
  userId,
  mode,
  membershipPeriodId,
}: RegistrationDraftContext) =>
  [
    "himti:registration-draft:v1",
    encodeURIComponent(userId),
    mode,
    encodeURIComponent(membershipPeriodId ?? "none"),
  ].join(":");

const isRegistrationData = (value: unknown): value is RegistrationData => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return registrationDataKeys.every((key) => typeof record[key] === "string");
};

const matchesContext = (
  stored: RegistrationDraftContext,
  expected: RegistrationDraftContext,
) =>
  stored.userId === expected.userId &&
  stored.mode === expected.mode &&
  stored.membershipPeriodId === expected.membershipPeriodId;

export const readRegistrationDraft = (
  context: RegistrationDraftContext,
  storage: Storage = window.localStorage,
  now = Date.now(),
): RegistrationDraft | null => {
  const key = registrationDraftKey(context);
  const serialized = storage.getItem(key);
  if (!serialized) return null;

  try {
    const stored = JSON.parse(serialized) as Partial<StoredRegistrationDraft>;
    if (
      stored.version !== DRAFT_VERSION ||
      !stored.context ||
      !matchesContext(stored.context, context) ||
      typeof stored.expiresAt !== "number" ||
      stored.expiresAt <= now ||
      typeof stored.step !== "number" ||
      !Number.isInteger(stored.step) ||
      stored.step < 0 ||
      stored.step > 3 ||
      !isRegistrationData(stored.data) ||
      !(
        stored.verificationSentFor === null ||
        typeof stored.verificationSentFor === "string"
      )
    ) {
      storage.removeItem(key);
      return null;
    }

    return {
      step: stored.step,
      data: stored.data,
      verificationSentFor: stored.verificationSentFor,
    };
  } catch {
    storage.removeItem(key);
    return null;
  }
};

export const writeRegistrationDraft = (
  context: RegistrationDraftContext,
  draft: RegistrationDraft,
  storage: Storage = window.localStorage,
  now = Date.now(),
) => {
  const stored: StoredRegistrationDraft = {
    version: DRAFT_VERSION,
    context,
    expiresAt: now + REGISTRATION_DRAFT_TTL_MS,
    step: draft.step,
    data: draft.data,
    verificationSentFor: draft.verificationSentFor,
  };
  storage.setItem(registrationDraftKey(context), JSON.stringify(stored));
};

export const clearRegistrationDraft = (
  context: RegistrationDraftContext,
  storage: Storage = window.localStorage,
) => storage.removeItem(registrationDraftKey(context));
