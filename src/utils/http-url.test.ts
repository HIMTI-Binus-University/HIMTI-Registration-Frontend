import { describe, expect, it } from "vitest";

import { getSafeHttpUrl } from "./http-url";

describe("getSafeHttpUrl", () => {
  it("returns absolute HTTP(S) links", () => {
    expect(getSafeHttpUrl("https://example.com/resource")).toBe(
      "https://example.com/resource",
    );
    expect(getSafeHttpUrl("http://example.com")).toBe("http://example.com/");
  });

  it("rejects unsafe, relative, and missing links", () => {
    expect(getSafeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(getSafeHttpUrl("https://user:password@example.com")).toBeNull();
    expect(getSafeHttpUrl("youtube.com")).toBeNull();
    expect(getSafeHttpUrl(null)).toBeNull();
  });
});
