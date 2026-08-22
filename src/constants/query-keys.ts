export const queryKeys = {
  users: ["users"] as const,
  currentUser: ["users", "me"] as const,
  userRegistrationOptions: ["users", "registration-options"] as const,
  membershipStatus: ["membership", "status"] as const,
  membershipResources: ["membership", "resources"] as const,
  publishedEvents: ["events", "published"] as const,
  publicEvents: ["events", "public"] as const,
  publicEvent: (eventId: string) => ["events", "public", eventId] as const,
  registrations: ["event-registrations"] as const,
  registrationContexts: ["event-registrations", "context"] as const,
  registrationList: (page: number) =>
    ["event-registrations", "list", page] as const,
  registration: (registrationId: string) =>
    ["event-registrations", "detail", registrationId] as const,
  registrationInvitation: ["event-registrations", "invitation"] as const,
  registrationPayment: (registrationId: string) =>
    ["event-registrations", "detail", registrationId, "payment"] as const,
  postRegistrationAssignments: (registrationId: string) =>
    [
      "event-registrations",
      "detail",
      registrationId,
      "post-registration-assignments",
    ] as const,
  postRegistrationAssignment: (registrationId: string, assignmentId: string) =>
    [
      "event-registrations",
      "detail",
      registrationId,
      "post-registration-assignments",
      assignmentId,
    ] as const,
  registrationContext: (subEventId: string, inviteToken?: string) =>
    [
      "event-registrations",
      "context",
      subEventId,
      inviteToken ?? null,
    ] as const,
  tickets: ["event-tickets"] as const,
  ticketList: ["event-tickets", "list"] as const,
  ticket: (ticketId: string) => ["event-tickets", "detail", ticketId] as const,
  ticketCredential: (ticketId: string) =>
    ["event-tickets", "credential", ticketId] as const,
  session: ["session"] as const,
} as const;
