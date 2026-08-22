import { describe, expect, test } from "vitest";
import type { RegistrationDetail } from "@/api/registrations/queries";
import {
  canCancelRegistration,
  canOpenResponseEditor,
  shouldQueryPayment,
} from "./lifecycle";

const detail = (
  status: RegistrationDetail["status"],
  role: RegistrationDetail["viewer"]["role"] = "BUYER",
) =>
  ({
    status,
    viewer: { role, capabilities: ["SAVE_BUYER"] },
    package: { priceMinor: "1000" },
  }) as RegistrationDetail;

describe("participant detail lifecycle", () => {
  test.each(["AWAITING_MEMBERS", "HOLDING"] as const)(
    "allows response editing in %s when save is authorized",
    (status) => expect(canOpenResponseEditor(detail(status))).toBe(true),
  );

  test("does not infer edit access without a save capability", () => {
    const value = detail("HOLDING");
    value.viewer.capabilities = [];
    expect(canOpenResponseEditor(value)).toBe(false);
  });

  test.each(["DRAFT", "AWAITING_MEMBERS", "HOLDING"] as const)(
    "does not query payment during %s assembly",
    (status) => expect(shouldQueryPayment(detail(status))).toBe(false),
  );

  test("keeps payment buyer-only", () => {
    expect(shouldQueryPayment(detail("PENDING_PAYMENT", "MEMBER"))).toBe(false);
    expect(shouldQueryPayment(detail("PENDING_PAYMENT"))).toBe(true);
  });

  test("never allows participant cancellation after approval", () => {
    const value = detail("APPROVED");
    value.viewer.capabilities = ["CANCEL"];
    expect(canCancelRegistration(value)).toBe(false);
  });

  test("allows authorized cancellation before approval", () => {
    const value = detail("PENDING_APPROVAL");
    value.viewer.capabilities = ["CANCEL"];
    expect(canCancelRegistration(value)).toBe(true);
  });

  test("does not infer cancellation without the capability", () => {
    expect(canCancelRegistration(detail("PENDING_APPROVAL"))).toBe(false);
  });
});
