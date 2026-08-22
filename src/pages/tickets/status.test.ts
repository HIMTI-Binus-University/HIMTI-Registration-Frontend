import { describe, expect, test } from "vitest";
import { effectiveTicketStatus, isTicketPresentable, ticketStatusCopy } from "./status";

describe("participant ticket states", () => {
  test("shows an active unexpired ticket as ready", () => {
    expect(effectiveTicketStatus({ status: "ACTIVE", expiresAt: null })).toBe("ACTIVE");
  });

  test("does not present a locally expired active ticket as ready", () => {
    expect(
      effectiveTicketStatus(
        { status: "ACTIVE", expiresAt: "2026-01-01T00:00:00.000Z" },
        Date.parse("2026-01-02T00:00:00.000Z"),
      ),
    ).toBe("EXPIRED");
  });

  test("has plain-language copy for every UX state", () => {
    expect(Object.keys(ticketStatusCopy).sort()).toEqual(
      ["ACTIVE", "EXPIRED", "FORM_BLOCKED", "PENDING", "REVOKED", "USED"].sort(),
    );
  });

  test("only presents eligible active tickets without blocking forms", () => {
    const ready = { status: "ACTIVE" as const, expiresAt: null, checkInEligibility: { state: "READY" as const, canPresentQr: true, blockingForms: [] } };
    expect(isTicketPresentable(ready)).toBe(true);
    expect(isTicketPresentable({ ...ready, checkInEligibility: { state: "BLOCKED_BY_FORMS", canPresentQr: false, blockingForms: [] } })).toBe(false);
    expect(isTicketPresentable({ ...ready, status: "USED" })).toBe(false);
  });
});
