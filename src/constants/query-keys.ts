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
  registrationList: (page: number) =>
    ["event-registrations", "list", page] as const,
  registration: (registrationId: string) =>
    ["event-registrations", "detail", registrationId] as const,
  registrationContext: (subEventId: string, inviteToken?: string) =>
    [
      "event-registrations",
      "context",
      subEventId,
      inviteToken ?? null,
    ] as const,
  session: ["session"] as const,
} as const;
