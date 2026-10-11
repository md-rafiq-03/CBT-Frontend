"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoginShell from "@/components/LoginShell";
import {
  clearAuthNotice,
  passwordPath,
  portalFromRole,
  readAuthNotice,
} from "@/lib/authPaths";

export default function StudentLoginPage() {
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setNotice(readAuthNotice());
    const id = window.setTimeout(clearAuthNotice, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.mustChangePassword) {
      router.replace(passwordPath(portalFromRole(user.role)));
      return;
    }
    router.replace(user.role === "ADMIN" ? "/admin" : "/");
  }, [user, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(rollNumber.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Login failed");
      return;
    }
    const portal = portalFromRole(result.role);
    if (result.mustChangePassword) {
      router.push(passwordPath(portal));
      return;
    }
    router.push(portal === "admin" ? "/admin" : "/");
  };

  return (
    <LoginShell
      title="Login"
      subtitle="Students and admins sign in here"
      bannerTitle="Kinematics Classes"
      bannerSubtitle="Sign in to tests, results, and the admin console"
      rollNumber={rollNumber}
      password={password}
      error={error}
      notice={notice}
      loading={loading}
      onRollNumberChange={setRollNumber}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      hint={
        <p>
          <Link href="/account/password" className="text-blue-600 hover:underline">
            Forgot password
          </Link>
        </p>
      }
    />
  );
}
