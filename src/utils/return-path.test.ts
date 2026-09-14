import { beforeEach, describe, expect, test } from "vitest";
import {
  consumeReturnPath,
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
