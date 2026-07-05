import axios from "axios";
import { useAuthStore } from "../store/authStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const api = axios.create({ baseURL: BASE_URL, timeout: 60000 }); // 60s timeout

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log errors centrally so DevTools always shows what went wrong
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail =
      error?.response?.data?.detail ??
      error?.message ??
      "Unknown API error";
    console.error("ViaHer API error:", detail, error?.response);
    return Promise.reject(error);
  }
);

export default api;
