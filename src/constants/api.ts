export const apiPaths = {
  users: "/users",
  session: "/auth/get-session",
  profile: "/registration/me",
  completeProfile: "/registration/complete-profile",
  sendVerification: "/registration/binus-email/send-verification",
  verifyEmail: "/registration/verify-outlook",
  options: "/registration/options",
  publishedEvents: "/event/published",
} as const;
