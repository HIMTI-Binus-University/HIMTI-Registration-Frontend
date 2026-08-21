import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import apiClient from "@/config/api-client";
import { queryKeys } from "@/constants/query-keys";
import {
  usePostRegistrationAssignment,
  usePostRegistrationAssignments,
  useSavePostRegistrationResponse,
  useSubmitPostRegistrationResponse,
} from "./queries";

vi.mock("@/config/api-client", () => ({
  default: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}));

const assignment = {
  id: "assignment/1",
  registrationId: "registration 1",
};

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

beforeEach(() => vi.clearAllMocks());

test("loads assignment list and exact detail from participant paths", async () => {
  vi.mocked(apiClient.get)
    .mockResolvedValueOnce({ data: { data: [assignment] } })
    .mockResolvedValueOnce({ data: { data: assignment } });
  const { wrapper } = setup();
  const list = renderHook(
    () => usePostRegistrationAssignments("registration 1"),
    { wrapper },
  );
  await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
  const detail = renderHook(
    () => usePostRegistrationAssignment("registration 1", "assignment/1"),
    { wrapper },
  );
  await waitFor(() => expect(detail.result.current.isSuccess).toBe(true));

  expect(apiClient.get).toHaveBeenNthCalledWith(
    1,
    "/api/v1/me/event-registrations/registration%201/post-registration-assignments",
  );
  expect(apiClient.get).toHaveBeenNthCalledWith(
    2,
    "/api/v1/me/event-registrations/registration%201/post-registration-assignments/assignment%2F1",
  );
});

test("saves CAS payload and invalidates the assignment list", async () => {
  vi.mocked(apiClient.put).mockResolvedValue({ data: { data: assignment } });
  const { client, wrapper } = setup();
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const hook = renderHook(
    () => useSavePostRegistrationResponse("registration 1", "assignment/1"),
    { wrapper },
  );
  const body = { revision: null, answers: [] };
  await act(() => hook.result.current.mutateAsync(body));

  expect(apiClient.put).toHaveBeenCalledWith(
    "/api/v1/me/event-registrations/registration%201/post-registration-assignments/assignment%2F1/response",
    body,
  );
  expect(invalidate).toHaveBeenCalledWith({
    queryKey: queryKeys.postRegistrationAssignments("registration 1"),
  });
});

test("submits revision with idempotency header and invalidates list", async () => {
  vi.mocked(apiClient.post).mockResolvedValue({ data: { data: assignment } });
  const { client, wrapper } = setup();
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const hook = renderHook(
    () => useSubmitPostRegistrationResponse("registration 1", "assignment/1"),
    { wrapper },
  );
  await act(() =>
    hook.result.current.mutateAsync({ revision: 4, idempotencyKey: "key-1" }),
  );

  expect(apiClient.post).toHaveBeenCalledWith(
    "/api/v1/me/event-registrations/registration%201/post-registration-assignments/assignment%2F1/submit",
    { revision: 4 },
    { headers: { "Idempotency-Key": "key-1" } },
  );
  expect(invalidate).toHaveBeenCalledWith({
    queryKey: queryKeys.postRegistrationAssignments("registration 1"),
  });
});
