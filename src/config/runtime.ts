export const runtime = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000",
  appUrl: import.meta.env.VITE_APP_URL ?? window.location.origin,
  electionAppUrl:
    import.meta.env.VITE_ELECTION_APP_URL ?? "http://localhost:3002",
};

export const getSafeElectionReturnUrl = (value: string | null) => {
  if (!value) return null;
  try {
    const target = new URL(value);
    const electionOrigin = new URL(runtime.electionAppUrl).origin;
    return target.origin === electionOrigin && target.pathname.startsWith("/")
      ? target.toString()
      : null;
  } catch {
    return null;
  }
};
