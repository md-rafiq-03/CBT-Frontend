import { apiClient } from "./apiClient";
import { AuthUser, LoginResponse, UserDirectoryItem } from "./Interface";

export async function loginApi(
  rollNumber: string,
  password: string
): Promise<LoginResponse> {
  const res = await apiClient.post("/api/v1/auth/login", {
    rollNumber,
    password,
  });
  return res.data;
}

export async function logoutApi(): Promise<void> {
  try {
    await apiClient.post("/api/v1/auth/logout");
  } catch {
    // ignore — clear local session anyway
  }
}

export async function meApi(): Promise<AuthUser> {
  const res = await apiClient.get("/api/v1/auth/me");
  return res.data;
}

export async function getStudents(): Promise<UserDirectoryItem[]> {
  const res = await apiClient.get("/api/v1/auth/students");
  return res.data || [];
}

export async function getUsers(): Promise<UserDirectoryItem[]> {
  const res = await apiClient.get("/api/v1/auth/users");
  return res.data || [];
}
