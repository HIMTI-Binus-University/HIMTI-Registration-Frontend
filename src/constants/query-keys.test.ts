import { describe, expect, test } from "vitest";
import { queryKeys } from "./query-keys";

describe("participant registration query keys", () => {
  test("never stores an invitation token in a query key", () => {
    expect(queryKeys.registrationInvitation).toEqual([
      "event-registrations",
      "invitation",
    ]);
    expect(queryKeys.registration("order-1")).toEqual([
      "event-registrations",
      "detail",
      "order-1",
    ]);
  });

  test("separates ticket metadata from private credentials", () => {
    expect(queryKeys.ticket("ticket/1")).toEqual(["event-tickets", "detail", "ticket/1"]);
    expect(queryKeys.ticketCredential("ticket/1")).toEqual(["event-tickets", "credential", "ticket/1"]);
  });
});
