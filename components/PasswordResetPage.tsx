"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiErrorMessage } from "@/lib/apiError";
import { confirmPasswordChange, requestPasswordCode } from "@/lib/authApi";
import {
  homePath,
  loginPath,
  portalFromQuery,
  setAuthNotice,
} from "@/lib/authPaths";

export default function PasswordResetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, logout } = useAuth();
  const portal = portalFromQuery(searchParams.get("portal"), user?.role);
  const forced = Boolean(user?.mustChangePassword);

  const [rollNumber, setRollNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.rollNumber) setRollNumber(user.rollNumber);
  }, [user?.rollNumber]);

  const requestCode = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");
    const roll = rollNumber.trim();
    if (!roll) {
      setError("Username is required");
      return;
    }
    setSubmitting(true);
    try {
      const message = await requestPasswordCode(roll);
      setRollNumber(roll);
      setInfo(message);
      setStep("confirm");
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Could not send a code. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmChange = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const code = otp.trim();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from the email.");
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 72) {
      setError("Password must be 8 to 72 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const message = await confirmPasswordChange({
        rollNumber: rollNumber.trim(),
        otp: code,
        newPassword,
      });
      await logout();
      setAuthNotice(message || "Password updated. Sign in with your new password.");
      router.replace(loginPath());
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Could not update the password."));
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace(loginPath());
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-blue-700 text-white text-center py-2 text-sm font-medium tracking-wide">
        Kinematics Classes CBT — Password
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <KeyRound className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {forced ? "Set a new password" : "Change password"}
              </h1>
              <p className="text-sm text-gray-600">
                {forced
                  ? "Your first password was your date of birth. We will email a code so you can replace it."
                  : "We email a one-time code to the address on this account. You will sign in again after it is updated."}
              </p>
            </div>
          </div>

          {step === "request" ? (
            <form onSubmit={requestCode} className="space-y-5">
              <div>
                <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="rollNumber"
                  value={rollNumber}
                  onChange={(event) => setRollNumber(event.target.value)}
                  disabled={Boolean(user)}
                  maxLength={32}
                  required
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  placeholder="Enter your username"
                />
              </div>
              {info && <StatusBanner tone="info" text={info} />}
              {error && <StatusBanner tone="error" text={error} />}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Email me a code"}
              </button>
            </form>
          ) : (
            <form onSubmit={confirmChange} className="space-y-5">
              {info && <StatusBanner tone="info" text={info} />}
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Code
                </label>
                <input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  maxLength={6}
                  required
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="6-digit code"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  minLength={8}
                  maxLength={72}
                  required
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="8 to 72 characters"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={8}
                  maxLength={72}
                  required
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <p className="text-xs text-gray-500">
                The new password cannot be your current password or your date of birth. The code expires in 10 minutes.
              </p>
              {error && <StatusBanner tone="error" text={error} />}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Update password"}
              </button>
              {!user && (
                <button
                  type="button"
                  onClick={() => {
                    setStep("request");
                    setError("");
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="w-full text-sm text-blue-600 hover:underline"
                >
                  Use a different username
                </button>
              )}
            </form>
          )}

          <div className="mt-6 flex items-center justify-between text-sm">
            {user ? (
              <button onClick={handleLogout} className="text-red-600 hover:underline">
                Logout
              </button>
            ) : (
              <Link href={loginPath()} className="text-blue-600 hover:underline">
                Back to login
              </Link>
            )}
            {user && !forced && (
              <Link href={homePath(portal)} className="text-blue-600 hover:underline">
                Back to app
              </Link>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function StatusBanner({ tone, text }: { tone: "info" | "error"; text: string }) {
  const className =
    tone === "error"
      ? "bg-red-50 border-red-200 text-red-700"
      : "bg-blue-50 border-blue-200 text-blue-800";
  return (
    <div className={`border px-4 py-3 rounded-lg text-sm ${className}`}>{text}</div>
  );
}
