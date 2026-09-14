export const queryKeys = {
  users: ["users"] as const,
  currentUser: ["users", "me"] as const,
  userRegistrationOptions: ["users", "registration-options"] as const,
  membershipStatus: ["membership", "status"] as const,
  membershipResources: ["membership", "resources"] as const,
  publicEventGroups: ["event-groups", "public"] as const,
  publicEventGroup: (eventGroupId: string) =>
    ["event-groups", "public", eventGroupId] as const,
  publicEvents: ["events", "public"] as const,
  publicEvent: (eventId: string) => ["events", "public", eventId] as const,
  eventRegistrationContext: (eventId: string) =>
    ["event-registrations", "context", eventId] as const,
  myEventRegistrations: ["event-registrations", "me"] as const,
  myEventRegistration: (registrationId: string) =>
    ["event-registrations", "me", registrationId] as const,
  myEventTickets: ["event-tickets", "me"] as const,
  myEventTicket: (ticketId: string) =>
    ["event-tickets", "me", ticketId] as const,
  session: ["session"] as const,
} as const;
