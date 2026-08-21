export function invitationUrl(invitation: {
  invitationPath?: string;
  token?: string;
}) {
  const path =
    invitation.invitationPath ??
    (invitation.token
      ? `/event-registration/invitations#token=${encodeURIComponent(invitation.token)}`
      : "");
  return path ? new URL(path, window.location.origin).toString() : null;
}
