import type { ParticipantTicket, TicketStatus } from "@/api/tickets/queries";

export type TicketViewState = TicketStatus | "FORM_BLOCKED";

export const effectiveTicketStatus = (
  ticket: Pick<ParticipantTicket, "status" | "expiresAt">,
  now = Date.now(),
): TicketViewState =>
  ticket.status === "ACTIVE" &&
  ticket.expiresAt &&
  new Date(ticket.expiresAt).getTime() <= now
    ? "EXPIRED"
    : ticket.status;

export const isTicketPresentable = (
  ticket: Pick<ParticipantTicket, "status" | "expiresAt" | "checkInEligibility">,
  now = Date.now(),
) =>
  effectiveTicketStatus(ticket, now) === "ACTIVE" &&
  ticket.checkInEligibility.state === "READY" &&
  ticket.checkInEligibility.canPresentQr;

export const ticketStatusCopy: Record<
  TicketViewState,
  { label: string; detail: string; tone: string }
> = {
  PENDING: {
    label: "Pending",
    detail: "Your ticket is still being prepared. Check again shortly.",
    tone: "bg-amber-100 text-amber-950",
  },
  ACTIVE: {
    label: "Ready",
    detail: "This ticket is ready to present at check-in.",
    tone: "bg-emerald-100 text-emerald-900",
  },
  FORM_BLOCKED: {
    label: "Form needed",
    detail: "Complete the required form before you can check in.",
    tone: "bg-amber-100 text-amber-950",
  },
  USED: {
    label: "Checked in",
    detail: "This ticket has already been used for check-in.",
    tone: "bg-blue-100 text-brand-navy",
  },
  REVOKED: {
    label: "Revoked",
    detail: "This ticket is no longer valid. Contact the organizer if this seems wrong.",
    tone: "bg-red-100 text-red-900",
  },
  EXPIRED: {
    label: "Expired",
    detail: "This ticket has passed its validity period.",
    tone: "bg-slate-200 text-slate-800",
  },
};
