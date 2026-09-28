import { beforeEach, expect, test, vi } from "vitest";
import apiClient from "@/config/api-client";
import { signInWithGoogle, signOut } from "./auth";

vi.mock("@/config/api-client", () => ({ default: { post: vi.fn() } }));

beforeEach(() => vi.mocked(apiClient.post).mockReset());

test("rejects social sign-in responses without a redirect URL", async () => {
  vi.mocked(apiClient.post).mockResolvedValue({ data: {} });
  await expect(signInWithGoogle("/events?open=1#activity")).rejects.toThrow(
    "Google sign-in did not return a redirect URL",
  );
  expect(apiClient.post).toHaveBeenCalledWith(
    "/api/auth/sign-in/social",
    expect.objectContaining({
      provider: "google",
      callbackURL: expect.stringContaining("returnTo="),
    }),
  );
});

test("uses the Better Auth API-prefixed sign-out path", async () => {
  vi.mocked(apiClient.post).mockResolvedValue({ data: {} });
  await signOut();
  expect(apiClient.post).toHaveBeenCalledWith("/api/auth/sign-out");
});
