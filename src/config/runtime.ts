export const runtime = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000",
  appUrl: import.meta.env.VITE_APP_URL ?? window.location.origin,
};
