const RETURN_PATH_KEY = "himti.auth.returnTo";

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
