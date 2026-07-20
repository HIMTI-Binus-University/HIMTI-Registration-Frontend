import HomePage from "@/pages/home";
import type { AppRoute } from "@/types/common";

export const routes: AppRoute[] = [
  { path: "*", element: <HomePage /> },
];
