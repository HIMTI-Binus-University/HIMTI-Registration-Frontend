import { describe, expect, test } from "vitest";
import { getSafeElectionReturnUrl } from "@/config/runtime";

describe("election return URL", () => {
  test("allows only the configured election origin", () => {
    expect(getSafeElectionReturnUrl("http://localhost:3002/vote")).toBe(
      "http://localhost:3002/vote",
    );
    expect(
      getSafeElectionReturnUrl("https://attacker.example/vote"),
    ).toBeNull();
    expect(
      getSafeElectionReturnUrl("http://localhost:3002.attacker.example/vote"),
    ).toBeNull();
  });
});
