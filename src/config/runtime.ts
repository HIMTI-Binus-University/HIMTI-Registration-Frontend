const normalizeUrl = (value: string) => value.replace(/\/+$/, "");
const normalizeApiOrigin = (value: string) =>
  normalizeUrl(value).replace(/\/api$/, "");

export const runtime = {
  apiBaseUrl: normalizeApiOrigin(
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  ),
  appUrl: normalizeUrl(import.meta.env.VITE_APP_URL ?? window.location.origin),
};
