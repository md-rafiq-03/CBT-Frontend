import { UserRole } from "./Interface";

export type AuthPortal = "student" | "admin";

const NOTICE_KEY = "cbt_auth_notice";

export function portalFromRole(role?: UserRole | null): AuthPortal {
  return role === "ADMIN" ? "admin" : "student";
}

export function portalFromQuery(
  value: string | null,
  role?: UserRole | null
): AuthPortal {
  if (value === "admin" || value === "student") return value;
  return portalFromRole(role);
}

export function passwordPath(portal: AuthPortal): string {
  return `/account/password?portal=${portal}`;
}

export function loginPath(): string {
  return "/login";
}

export function homePath(portal: AuthPortal): string {
  return portal === "admin" ? "/admin" : "/";
}

export function setAuthNotice(message: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(NOTICE_KEY, message);
}

export function readAuthNotice(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(NOTICE_KEY) ?? "";
}

export function clearAuthNotice() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(NOTICE_KEY);
}
