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
import { apiErrorMessage } from "../lib/apiError";
import { AUTH_STORAGE_KEY } from "../lib/apiClient";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (
    rollNumber: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: string;
    mustChangePassword?: boolean;
    role?: UserRole;
  }>;
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
        setUser({
          ...saved,
          mustChangePassword: Boolean(saved.mustChangePassword),
        });
        try {
          const me = await meApi();
          const refreshed: AuthUser = {
            token: saved.token,
            userId: me.userId,
            rollNumber: me.rollNumber,
            fullName: me.fullName,
            role: me.role,
            mustChangePassword: Boolean(me.mustChangePassword),
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

  const login = async (rollNumber: string, password: string) => {
    try {
      const data = await loginApi(rollNumber, password);
      const authUser: AuthUser = {
        token: data.token,
        userId: data.userId,
        rollNumber: data.rollNumber,
        fullName: data.fullName,
        role: data.role,
        mustChangePassword: Boolean(data.mustChangePassword),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return {
        success: true,
        mustChangePassword: authUser.mustChangePassword,
        role: authUser.role,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: apiErrorMessage(err, "Invalid username or password."),
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
