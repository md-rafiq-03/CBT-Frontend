"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/Interface";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: UserRole;
  loginPath?: string;
}

export default function ProtectedRoute({
  children,
  role,
  loginPath = "/login",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(loginPath);
      return;
    }
    if (role && user.role !== role) {
      router.replace(user.role === "ADMIN" ? "/admin" : "/");
    }
  }, [user, loading, role, loginPath, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user || (role && user.role !== role)) {
    return null;
  }

  return <>{children}</>;
}
