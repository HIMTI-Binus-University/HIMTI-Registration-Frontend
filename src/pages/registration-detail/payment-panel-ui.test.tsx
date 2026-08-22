import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import {
  useParticipantPayment,
  useSubmitPaymentProof,
} from "@/api/payments/queries";
import { PaymentPanel } from "./payment-panel";

vi.mock("@/api/payments/queries", () => ({
  getPrivateProofBlob: vi.fn(),
  normalizeParticipantPayment: vi.fn((payment) => ({
    ...payment,
    bankSnapshot: {
      ...payment.bankSnapshot,
      acceptedProofTypes: Array.isArray(payment.bankSnapshot.acceptedProofTypes)
        ? payment.bankSnapshot.acceptedProofTypes
        : ["image/jpeg", "image/png", "image/webp", "application/pdf"],
      maxProofBytes:
        typeof payment.bankSnapshot.maxProofBytes === "number"
          ? payment.bankSnapshot.maxProofBytes
          : 10 * 1024 * 1024,
    },
  })),
  useParticipantPayment: vi.fn(),
  useSubmitPaymentProof: vi.fn(),
}));

afterEach(cleanup);

test("renders authoritative rejected payment details and upload rules", () => {
  vi.mocked(useParticipantPayment).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      id: "payment-1",
      registrationOrderId: "registration-1",
      orderNumber: "REG-001",
      orderStatus: "PENDING_PAYMENT",
      amountMinor: "25000",
      currency: "IDR",
      status: "REJECTED",
      revision: 2,
      expiresAt: "2026-08-20T12:00:00.000Z",
      deadlineExpired: false,
      submittedAt: "2026-08-19T12:00:00.000Z",
      verifiedAt: null,
      rejectionReason: "The transfer receipt is unreadable.",
      canUploadProof: true,
      canReplaceProof: true,
      bankSnapshot: {
        bankName: "BCA",
        accountHolder: "HIMTI BINUS",
        accountNumber: "1234567890",
        instructions: "Use the registration number as the transfer note.",
        acceptedProofTypes: ["image/png", "application/pdf"],
        maxProofBytes: 5 * 1024 * 1024,
      },
      proofs: [],
      history: [],
    },
  } as never);
  vi.mocked(useSubmitPaymentProof).mockReturnValue({
    isPending: false,
    isError: false,
    mutateAsync: vi.fn(),
  } as never);

  render(<PaymentPanel registrationId="registration-1" />);

  expect(screen.getByText(/Rp\s?25[.,]000/)).toBeInTheDocument();
  expect(screen.getByText("BCA")).toBeInTheDocument();
  expect(screen.getByText("1234567890")).toBeInTheDocument();
  expect(screen.getByText(/receipt is unreadable/i)).toBeInTheDocument();
  expect(screen.getByText(/PNG, PDF up to 5 MB/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Replace proof" })).toBeDisabled();
});

test("renders stale payment responses with safe upload defaults", () => {
  vi.mocked(useParticipantPayment).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      id: "payment-legacy",
      registrationOrderId: "registration-1",
      orderNumber: "REG-001",
      orderStatus: "PENDING_PAYMENT",
      amountMinor: "25000",
      currency: "IDR",
      status: "UNPAID",
      revision: 1,
      expiresAt: "2026-08-20T12:00:00.000Z",
      deadlineExpired: false,
      submittedAt: null,
      verifiedAt: null,
      rejectionReason: null,
      canUploadProof: true,
      canReplaceProof: false,
      bankSnapshot: {
        bankName: "BCA",
        accountHolder: "HIMTI BINUS",
        accountNumber: "1234567890",
        instructions: null,
      },
      proofs: [],
      history: [],
    },
  } as never);
  vi.mocked(useSubmitPaymentProof).mockReturnValue({
    isPending: false,
    isError: false,
    mutateAsync: vi.fn(),
  } as never);

  render(<PaymentPanel registrationId="registration-1" />);

  expect(screen.getByText(/JPEG, PNG, WEBP, PDF up to 10 MB/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Submit proof" })).toBeDisabled();
});
