"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoginShell from "@/components/LoginShell";

export default function AdminLoginPage() {
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(rollNumber.trim(), password, "ADMIN");
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Login failed");
      return;
    }
    router.push("/admin");
  };

  return (
    <LoginShell
      title="Admin Login"
      subtitle="Manage tests and questions"
      bannerTitle="Admin Portal"
      bannerSubtitle="Create tests, upload questions, and review student activity"
      rollNumber={rollNumber}
      password={password}
      error={error}
      loading={loading}
      onRollNumberChange={setRollNumber}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      hint={
        <p>
          Dev admin: roll <strong>100</strong>, password <strong>-100</strong>
          <br />
          <Link href="/login" className="text-blue-600 hover:underline">
            Student login
          </Link>
        </p>
      }
    />
  );
}
