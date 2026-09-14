export const apiPaths = {
  users: "/api/users",
  session: "/api/auth/get-session",
  currentUser: "/api/user/me",
  completeCurrentUserProfile: "/api/user/me/complete-profile",
  updateCurrentUserProfile: "/api/user/me",
  sendUserEmailVerification: "/api/user/me/binus-email/send-verification",
  verifyUserEmail: "/api/user/binus-email/verify",
  userRegistrationOptions: "/api/user/registration-options",
  membershipStatus: "/api/membership/status",
  membershipResources: "/api/membership/resources",
  reregisterCurrentUser: "/api/user/me/reregister",
} as const;
