import axios from "axios";
import { passwordPath, type AuthPortal } from "./authPaths";

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

function existingAuthorization(headers: any): string {
  if (!headers) return "";
  if (typeof headers.get === "function") {
    return String(headers.get("Authorization") || "");
  }
  return String(headers.Authorization || headers.authorization || "");
}

apiClient.interceptors.request.use((config) => {
  if (existingAuthorization(config.headers)) return config;
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

function markPasswordChangeRequired() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return;
    const auth = JSON.parse(raw);
    if (!auth || typeof auth !== "object") return;
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ ...auth, mustChangePassword: true })
    );
  } catch {
    // ignore corrupt storage
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === "undefined") return Promise.reject(error);
    const status = error?.response?.status;
    const path = window.location.pathname || "";
    const message = error?.response?.data?.message;

    const url = String(error?.config?.url || "");
    const failedLogin = url.includes("/auth/login");

    if (status === 401 && !failedLogin) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      const stay =
        path.startsWith("/account/password") || path.includes("/login");
      if (!stay) {
        window.location.href = "/login";
      }
    }

    if (status === 403 && message === "Password change required") {
      markPasswordChangeRequired();
      if (!path.startsWith("/account/password")) {
        const portal: AuthPortal = path.startsWith("/admin")
          ? "admin"
          : "student";
        window.location.href = passwordPath(portal);
      }
    }

    return Promise.reject(error);
  }
);
