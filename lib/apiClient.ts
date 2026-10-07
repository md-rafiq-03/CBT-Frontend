import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
export const AUTH_STORAGE_KEY = "cbt_auth";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const auth = JSON.parse(raw);
    return auth?.token || null;
  } catch {
    return null;
  }
}

apiClient.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    // AxiosHeaders-safe set
    if (config.headers && typeof (config.headers as any).set === "function") {
      (config.headers as any).set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = {
        ...(config.headers as any),
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      const path = window.location.pathname || "";
      // Don't loop on login pages
      if (!path.includes("/login")) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        const loginPath = path.startsWith("/admin")
          ? "/admin/login"
          : "/login";
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);
