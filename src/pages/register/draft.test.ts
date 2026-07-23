import { beforeEach, describe, expect, it } from "vitest";

import {
  clearRegistrationDraft,
  readRegistrationDraft,
  registrationDraftKey,
  REGISTRATION_DRAFT_TTL_MS,
  writeRegistrationDraft,
  type RegistrationDraftContext,
} from "./draft";
import type { RegistrationData } from "./payload";

const context: RegistrationDraftContext = {
  userId: "user-1",
  mode: "register",
  membershipPeriodId: "2027/2028",
};

const data: RegistrationData = {
  userType: "Student",
  institutionType: "BINUS",
  membershipPosition: "Officer",
  name: "HIMTI Member",
  phone: "08123456789",
  personalEmail: "member@example.com",
  lineId: "member-line",
  nim: "2600000000",
  batch: "28",
  binusEmail: "member@binus.ac.id",
  region: "kemanggisan",
  major: "computer-science",
  university: "BINUS University",
  institution: "",
  department: "",
  affiliation: "",
};

beforeEach(() => window.localStorage.clear());

describe("registration draft", () => {
  it("writes and reads a user, mode, and period-specific draft", () => {
    writeRegistrationDraft(
      context,
      { step: 2, data, verificationSentFor: data.binusEmail },
      window.localStorage,
      1000,
    );

    expect(readRegistrationDraft(context, window.localStorage, 2000)).toEqual({
      step: 2,
      data,
      verificationSentFor: data.binusEmail,
    });
    expect(registrationDraftKey(context)).toContain("2027%2F2028");
    expect(registrationDraftKey(context)).toContain("registration-draft:v2");
  });

  it("removes expired and malformed drafts", () => {
    writeRegistrationDraft(
      context,
      { step: 2, data, verificationSentFor: null },
      window.localStorage,
      1000,
    );
    expect(
      readRegistrationDraft(
        context,
        window.localStorage,
        1000 + REGISTRATION_DRAFT_TTL_MS,
      ),
    ).toBeNull();

    window.localStorage.setItem(registrationDraftKey(context), "not-json");
    expect(readRegistrationDraft(context)).toBeNull();

    writeRegistrationDraft(context, {
      step: 1,
      data,
      verificationSentFor: null,
    });
    const malformed = JSON.parse(
      window.localStorage.getItem(registrationDraftKey(context))!,
    );
    malformed.data.membershipPosition = "CHAIRPERSON";
    window.localStorage.setItem(
      registrationDraftKey(context),
      JSON.stringify(malformed),
    );
    expect(readRegistrationDraft(context)).toBeNull();
  });

  it("ignores drafts stored under the v1 key", () => {
    const v1Key = registrationDraftKey(context).replace("v2", "v1");
    window.localStorage.setItem(v1Key, JSON.stringify({ data }));

    expect(readRegistrationDraft(context)).toBeNull();
    expect(window.localStorage.getItem(v1Key)).not.toBeNull();
  });

  it("isolates registration modes, periods, and users", () => {
    writeRegistrationDraft(context, {
      step: 2,
      data,
      verificationSentFor: null,
    });

    expect(
      readRegistrationDraft({ ...context, mode: "reregister" }),
    ).toBeNull();
    expect(
      readRegistrationDraft({ ...context, membershipPeriodId: "2028-2029" }),
    ).toBeNull();
    expect(readRegistrationDraft({ ...context, userId: "user-2" })).toBeNull();
  });

  it("clears only the matching draft", () => {
    const otherContext = { ...context, userId: "user-2" };
    writeRegistrationDraft(context, {
      step: 2,
      data,
      verificationSentFor: null,
    });
    writeRegistrationDraft(otherContext, {
      step: 1,
      data,
      verificationSentFor: null,
    });

    clearRegistrationDraft(context);
    expect(readRegistrationDraft(context)).toBeNull();
    expect(readRegistrationDraft(otherContext)?.step).toBe(1);
  });
});
