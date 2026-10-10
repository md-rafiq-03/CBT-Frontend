"use client";

import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminShell from "@/components/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute role="ADMIN" loginPath="/login">
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
