const RETURN_PATH_KEY = "himti.auth.returnTo";
const ELECTION_RETURN_KEY = "himti.auth.electionReturnTo";

export function sanitizeReturnPath(value: unknown, fallback = "/dashboard") {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  )
    return fallback;
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}

export function currentReturnPath(location: {
  pathname: string;
  search: string;
  hash: string;
}) {
  return sanitizeReturnPath(
    `${location.pathname}${location.search}${location.hash}`,
  );
}

export function storeReturnPath(value: unknown) {
  const path = sanitizeReturnPath(value);
  sessionStorage.setItem(RETURN_PATH_KEY, path);
  return path;
}

export function consumeReturnPath(fallback = "/dashboard") {
  const value = sessionStorage.getItem(RETURN_PATH_KEY);
  sessionStorage.removeItem(RETURN_PATH_KEY);
  return sanitizeReturnPath(value, fallback);
}

export function getReturnPath() {
  return sanitizeReturnPath(sessionStorage.getItem(RETURN_PATH_KEY));
}

export function electionReturnPath(
  value: unknown,
  registrationOrigin = window.location.origin,
): string | null {
  if (typeof value !== "string") return null;
  const electionOrigin =
    registrationOrigin === "http://localhost:3001"
      ? "http://localhost:3002"
      : registrationOrigin === "https://dev-registration.himtibinus.or.id"
        ? "https://dev-election.himtibinus.or.id"
        : registrationOrigin === "https://registration.himtibinus.or.id"
          ? "https://election.himtibinus.or.id"
          : null;
  if (!electionOrigin) return null;
  try {
    const url = new URL(value);
    return url.origin === electionOrigin &&
      ["/", "/vote", "/candidates"].includes(url.pathname)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function rememberElectionReturn(
  value: unknown,
  registrationOrigin = window.location.origin,
) {
  const destination = electionReturnPath(value, registrationOrigin);
  if (destination) sessionStorage.setItem(ELECTION_RETURN_KEY, destination);
  return destination;
}

export function getElectionReturn(registrationOrigin = window.location.origin) {
  return electionReturnPath(
    sessionStorage.getItem(ELECTION_RETURN_KEY),
    registrationOrigin,
  );
}

export function clearElectionReturn() {
  sessionStorage.removeItem(ELECTION_RETURN_KEY);
}
