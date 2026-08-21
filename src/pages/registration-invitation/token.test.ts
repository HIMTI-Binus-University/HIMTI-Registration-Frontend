import { describe, expect, test, vi } from "vitest";
import { consumeInvitationToken } from "./token";

describe("invitation fragment token", () => {
  test("reads the fragment and immediately clears browser history", () => {
    const replaceState = vi.fn();
    const token = consumeInvitationToken(
      {
        hash: "#token=raw%20secret",
        pathname: "/event-registration/invitations",
        search: "?safe=value",
      } as Location,
      { state: { key: 1 }, replaceState } as unknown as History,
    );
    expect(token).toBe("raw secret");
    expect(replaceState).toHaveBeenCalledWith(
      { key: 1 },
      "",
      "/event-registration/invitations?safe=value",
    );
  });

  test("does not accept a token from the query string", () => {
    expect(
      consumeInvitationToken(
        { hash: "", pathname: "/invite", search: "?token=leak" } as Location,
        { replaceState: vi.fn() } as unknown as History,
      ),
    ).toBe("");
  });
});
