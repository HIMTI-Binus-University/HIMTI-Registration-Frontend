import { useQuery } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { apiPaths } from "@/constants/api";
import { runtime } from "@/config/runtime";
import { queryKeys } from "@/constants/query-keys";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};
export type Session = {
  user: SessionUser;
  session: { id: string; expiresAt: string };
};

export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: async () => {
      const { data } = await apiClient.get<Session | null>(apiPaths.session);
      return data;
    },
    retry: false,
  });
}

let signingIn = false;
export async function signInWithGoogle(returnTo?: string) {
  if (signingIn) return;
  signingIn = true;
  try {
    const { data } = await apiClient.post<{ url?: string }>(
      "/api/auth/sign-in/social",
      {
        provider: "google",
        errorCallbackURL: `${runtime.appUrl}/auth/error`,
        callbackURL: `${runtime.appUrl}/auth/callback${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`,
      },
    );
    if (!data.url)
      throw new Error("Google sign-in did not return a redirect URL.");
    window.location.assign(data.url);
  } catch (error) {
    signingIn = false;
    throw error;
  }
}

export async function signOut() {
  await apiClient.post("/api/auth/sign-out");
}
