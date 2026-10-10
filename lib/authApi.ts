import { apiClient } from "./apiClient";
import {
  CreateStudentRequest,
  LoginResponse,
  MeResponse,
  UserDirectoryItem,
} from "./Interface";

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

export async function logoutApi(token?: string): Promise<void> {
  try {
    await apiClient.post(
      "/api/v1/auth/logout",
      null,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
  } catch {
    // ignore — clear local session anyway
  }
}

export async function meApi(): Promise<MeResponse> {
  const res = await apiClient.get("/api/v1/auth/me");
  return res.data;
}

export async function requestPasswordCode(rollNumber: string): Promise<string> {
  const res = await apiClient.post("/api/v1/auth/change-or-forgot", {
    rollNumber,
  });
  return (
    res.data?.message ||
    "If that roll number exists, a code has been sent to the registered email."
  );
}

export async function confirmPasswordChange(body: {
  rollNumber: string;
  otp: string;
  newPassword: string;
}): Promise<string> {
  const res = await apiClient.post("/api/v1/auth/change-or-forgot", body);
  return res.data?.message || "Password updated.";
}

export async function createStudent(
  body: CreateStudentRequest
): Promise<UserDirectoryItem> {
  const res = await apiClient.post("/api/v1/auth/students", body);
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
