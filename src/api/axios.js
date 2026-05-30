import axios from "axios";

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
  headers: {
    Accept: "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const path = window.location.pathname;
    const isAuthScreen = path === "/" || path === "/register";

    if (status === 401 && !isAuthScreen && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default API;
