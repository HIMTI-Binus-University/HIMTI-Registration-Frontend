import { describe, expect, test } from "vitest";
import { reconcilePackageSelection } from "./package-selection";

describe("registration package selection", () => {
  test("automatically selects the sole eligible package", () => {
    expect(reconcilePackageSelection(["only"], "")).toBe("only");
  });

  test("requires an explicit choice among multiple packages", () => {
    expect(reconcilePackageSelection(["a", "b"], "")).toBe("");
  });

  test("clears a choice that is no longer eligible", () => {
    expect(reconcilePackageSelection(["a", "b"], "stale")).toBe("");
    expect(reconcilePackageSelection(["a", "b"], "b")).toBe("b");
  });
});
