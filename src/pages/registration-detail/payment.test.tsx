import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, test, vi } from "vitest";
import apiClient from "@/config/api-client";
import { PaymentSection } from "./payment";

vi.mock("@/config/api-client", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const payment = {
  id: "payment",
  status: "COLLECTING",
  revision: 7,
  currency: "IDR",
  amountMinor: "50000",
  acknowledgementCount: 1,
  requiredCount: 2,
  expiresAt: "2099-01-01T00:00:00Z",
  bank: { bankName: "Bank", accountNumber: "123", accountHolder: "HIMTI" },
  allowedMediaTypes: ["image/png"],
  maxBytes: 1572864,
  members: [
    {
      id: "self",
      correction: {
        reason: "Please upload a clearer copy",
        deadlineAt: "2099-01-01T00:00:00Z",
      },
      proofs: [],
    },
  ],
};

test("shows shared count and own correction, validates size and submits multipart with revision and idempotency", async () => {
  vi.mocked(apiClient.get).mockResolvedValue({ data: { data: payment } });
  vi.mocked(apiClient.post).mockResolvedValue({ data: {} });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const updated = vi.fn();
  render(
    <QueryClientProvider client={client}>
      <PaymentSection registrationId="order" onUpdated={updated} />
    </QueryClientProvider>,
  );
  expect(await screen.findByText("1 / 2")).toBeInTheDocument();
  expect(screen.getByText("Please upload a clearer copy")).toBeInTheDocument();
  const input = screen.getByLabelText("Upload your proof copy");
  fireEvent.change(input, {
    target: {
      files: [
        new File([new Uint8Array(1572865)], "large.png", { type: "image/png" }),
      ],
    },
  });
  expect(
    screen.getByRole("button", { name: "Submit acknowledgement" }),
  ).toBeDisabled();
  fireEvent.change(input, {
    target: { files: [new File(["png"], "proof.png", { type: "image/png" })] },
  });
  expect(screen.getByText("proof.png")).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Submit acknowledgement" }),
  );
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledTimes(1));
  const [url, body, config] = vi.mocked(apiClient.post).mock.calls[0];
  expect(url).toBe("/api/me/event-payments/payment/acknowledgement");
  expect((body as FormData).get("expectedRevision")).toBe("7");
  expect((body as FormData).get("file")).toBeInstanceOf(File);
  expect(config?.headers?.["Idempotency-Key"]).toBeTruthy();
  await screen.findByText("Your acknowledgement was submitted.");
  expect(updated).toHaveBeenCalled();
  client.clear();
});

test("terminal payments do not offer an uploader", async () => {
  vi.mocked(apiClient.get).mockResolvedValue({
    data: { data: { ...payment, status: "VERIFIED" } },
  });
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <PaymentSection registrationId="order" onUpdated={() => {}} />
    </QueryClientProvider>,
  );
  await screen.findByText("VERIFIED");
  expect(screen.queryByLabelText("Upload your proof copy")).toBeNull();
  client.clear();
});
