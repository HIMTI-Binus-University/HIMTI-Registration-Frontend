import { useQuery } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { apiPaths } from "@/constants/api";
import { queryKeys } from "@/constants/query-keys";

export interface User {
  id: string;
  name: string;
  email: string;
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => apiClient.get<User[]>(apiPaths.users).then(({ data }) => data),
  });
}
