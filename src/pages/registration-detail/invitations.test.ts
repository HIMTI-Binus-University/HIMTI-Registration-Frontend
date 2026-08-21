import { describe, expect, test } from "vitest";
import { invitationUrl } from "./invitation-link";

describe("registration invitation links", () => {
  test("uses the contract invitation path without exposing a second copy", () => {
    expect(
      invitationUrl({
        invitationPath: "/event-registration/invitations#token=raw-token",
      }),
    ).toBe(
      "http://localhost:3000/event-registration/invitations#token=raw-token",
    );
  });

  test("falls back to the returned one-time token", () => {
    expect(invitationUrl({ token: "a token" })).toBe(
      "http://localhost:3000/event-registration/invitations#token=a%20token",
    );
    expect(invitationUrl({})).toBeNull();
  });
});
