import axios from "axios";
import { runtime } from "@/config/runtime";

const apiClient = axios.create({
  baseURL: runtime.apiBaseUrl,
  withCredentials: true,
});

export default apiClient;
