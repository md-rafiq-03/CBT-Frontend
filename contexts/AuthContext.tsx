"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthUser, UserRole } from "../lib/Interface";
import { loginApi, logoutApi, meApi } from "../lib/authApi";
import { AUTH_STORAGE_KEY } from "../lib/apiClient";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (
    rollNumber: string,
    password: string,
    expectedRole?: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return;

        const saved = JSON.parse(raw) as AuthUser;
        if (!saved?.token) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          return;
        }

        // Keep token available for apiClient while validating
        setUser(saved);
        try {
          const me = await meApi();
          const refreshed: AuthUser = {
            token: saved.token,
            userId: me.userId,
            rollNumber: me.rollNumber,
            fullName: me.fullName,
            role: me.role,
          };
          setUser(refreshed);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(refreshed));
        } catch {
          // Backend restarted or token expired — force re-login
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setUser(null);
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  const login = async (
    rollNumber: string,
    password: string,
    expectedRole?: UserRole
  ) => {
    try {
      const data = await loginApi(rollNumber, password);
      if (expectedRole && data.role !== expectedRole) {
        return {
          success: false,
          error:
            expectedRole === "ADMIN"
              ? "This account is not an admin. Use student login."
              : "This account is not a student. Use admin login.",
        };
      }
      const authUser: AuthUser = {
        token: data.token,
        userId: data.userId,
        rollNumber: data.rollNumber,
        fullName: data.fullName,
        role: data.role,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return { success: true };
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Invalid roll number or password.";
      return {
        success: false,
        error: typeof msg === "string" ? msg : "Login failed. Please try again.",
      };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
