export function consumeInvitationToken(location: Location, history: History) {
  const fragment = location.hash.startsWith("#")
    ? location.hash.slice(1)
    : location.hash;
  const params = new URLSearchParams(
    fragment.startsWith("?") ? fragment.slice(1) : fragment,
  );
  const token = params.get("token") ?? "";
  if (location.hash)
    history.replaceState(
      history.state,
      "",
      location.pathname + location.search,
    );
  return token;
}
