import { beforeEach, describe, expect, test } from "vitest";
import {
  consumeReturnPath,
  electionReturnPath,
  getElectionReturn,
  rememberElectionReturn,
  registrationContinueLabel,
  sanitizeReturnPath,
  storeReturnPath,
} from "./return-path";

describe("authentication return paths", () => {
  beforeEach(() => sessionStorage.clear());

  test("preserves same-origin pathname, search, and hash", () => {
    const path =
      "/events/event-1/subevents/sub-1/register?inviteToken=abc#form";
    expect(consumeReturnPath(storeReturnPath(path))).toBe(path);
  });

  test.each([
    "https://evil.example/path",
    "//evil.example/path",
    "javascript:x",
  ])("rejects unsafe path %s", (path) =>
    expect(sanitizeReturnPath(path)).toBe("/dashboard"),
  );
});

describe("election registration returns", () => {
  test.each([
    ["http://localhost:3001", "http://localhost:3000"],
    [
      "https://dev-registration.himtibinus.or.id",
      "https://dev-admin.himtibinus.or.id",
    ],
    ["https://registration.himtibinus.or.id", "https://admin.himtibinus.or.id"],
  ])("preserves Internal Tools return for %s", (registration, internal) => {
    const destination = `${internal}/login`;
    expect(rememberElectionReturn(destination, registration)).toBe(destination);
    expect(getElectionReturn(registration)).toBe(destination);
    expect(registrationContinueLabel(destination)).toBe(
      "Continue to HIMTI Internal Tools",
    );
    expect(
      electionReturnPath(`${internal}/auth/error`, registration),
    ).toBeNull();
  });
  test("allows only the local election ballot from local registration", () => {
    const origin = "http://localhost:3001";
    expect(electionReturnPath("http://localhost:3002/vote", origin)).toBe(
      "http://localhost:3002/vote",
    );
    for (const url of [
      "http://localhost:3000/vote",
      "https://election.himtibinus.or.id/vote",
      "http://localhost:3002/auth/error",
      "http://localhost:3002.evil.test/vote",
      "//localhost:3002/vote",
      "javascript:alert(1)",
    ])
      expect(electionReturnPath(url, origin)).toBeNull();
  });
  test("keeps the election destination across the registration login redirect", () => {
    const registration = "http://localhost:3001";
    const destination = "http://localhost:3002/vote";
    expect(rememberElectionReturn(destination, registration)).toBe(destination);
    expect(getElectionReturn(registration)).toBe(destination);
    expect(
      getElectionReturn("https://registration.himtibinus.or.id"),
    ).toBeNull();
  });
  test.each([
    [
      "https://dev-registration.himtibinus.or.id",
      "https://dev-election.himtibinus.or.id",
    ],
    [
      "https://registration.himtibinus.or.id",
      "https://election.himtibinus.or.id",
    ],
  ])("keeps %s in its own environment", (registration, election) => {
    expect(electionReturnPath(`${election}/vote`, registration)).toBe(
      `${election}/vote`,
    );
    expect(
      electionReturnPath("http://localhost:3002/vote", registration),
    ).toBeNull();
  });
});
