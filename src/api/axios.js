import axios from "axios";

/**
 * Reads VITE_API_URL from frontend/.env (must restart `npm run dev` after changes).
 * If someone writes http://127.0.0.1:8000 without /api, we append /api so login hits Laravel correctly.
 */
function normalizeApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (!raw) {
    return "http://127.0.0.1:8000/api";
  }
  let base = raw.replace(/\/+$/, "");
  if (!base.endsWith("/api")) {
    base = `${base}/api`;
  }
  return base;
}

const API = axios.create({
  baseURL: normalizeApiBaseUrl(),
});

// ✅ VERY IMPORTANT (TOKEN)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
