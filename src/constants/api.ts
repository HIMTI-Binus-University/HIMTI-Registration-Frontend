export const apiPaths = {
  users: "/users",
  session: "/auth/get-session",
  currentUser: "/user/me",
  completeCurrentUserProfile: "/user/me/complete-profile",
  updateCurrentUserProfile: "/user/me",
  sendUserEmailVerification: "/user/me/binus-email/send-verification",
  verifyUserEmail: "/user/binus-email/verify",
  userRegistrationOptions: "/user/registration-options",
  publishedEvents: "/event/published",
} as const;
