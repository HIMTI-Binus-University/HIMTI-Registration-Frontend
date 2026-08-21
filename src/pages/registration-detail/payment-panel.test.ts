import { describe, expect, test } from "vitest";
import { validateProofFile } from "./payment-file";

describe("payment proof client validation", () => {
  const accepted = ["image/png", "application/pdf"];

  test("accepts one contract-approved file within the authoritative limit", () => {
    const file = new File(["proof"], "proof.png", { type: "image/png" });
    expect(validateProofFile(file, accepted, 10)).toBeUndefined();
  });

  test("rejects unlisted MIME types and oversized files", () => {
    expect(
      validateProofFile(
        new File(["proof"], "proof.txt", { type: "text/plain" }),
        accepted,
        10,
      ),
    ).toMatch(/accepted/i);
    expect(
      validateProofFile(
        new File(["too large"], "proof.pdf", { type: "application/pdf" }),
        accepted,
        3,
      ),
    ).toMatch(/smaller/i);
  });
});
