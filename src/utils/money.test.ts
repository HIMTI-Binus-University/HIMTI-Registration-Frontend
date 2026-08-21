import { describe, expect, test } from "vitest";
import { formatMoney, formatPackageAmount } from "./money";

describe("registration money formatting", () => {
  test("keeps free package copy unchanged", () => {
    expect(formatPackageAmount({ currency: "IDR", priceMinor: "0" })).toBe(
      "Free - no payment required",
    );
  });

  test("formats contract minor units using the contract currency", () => {
    expect(formatMoney("25000", "IDR")).toMatch(/Rp\s?25[.,]000/);
    expect(
      formatPackageAmount({ currency: "USD", priceMinor: "1250" }),
    ).toMatch(/US\$\s?12[.,]5/);
  });
});
