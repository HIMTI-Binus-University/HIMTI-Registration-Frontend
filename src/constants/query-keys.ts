export const queryKeys = {
  users: ["users"] as const,
  currentUser: ["users", "me"] as const,
  userRegistrationOptions: ["users", "registration-options"] as const,
  membershipStatus: ["membership", "status"] as const,
  membershipResources: ["membership", "resources"] as const,
  publicEventGroups: ["event-groups", "public"] as const,
  publicEvents: ["events", "public"] as const,
  publicEvent: (eventId: string) => ["events", "public", eventId] as const,
  session: ["session"] as const,
} as const;
