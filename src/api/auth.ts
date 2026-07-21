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

export async function signInWithGoogle() {
  const { data } = await apiClient.post<{ url?: string }>(
    "/auth/sign-in/social",
    {
      provider: "google",
      callbackURL: `${runtime.appUrl}/auth/callback`,
    },
  );
  if (data.url) window.location.assign(data.url);
}

export async function signOut() {
  await apiClient.post("/auth/sign-out");
}
