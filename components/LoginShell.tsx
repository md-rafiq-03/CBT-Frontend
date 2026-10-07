"use client";

import { FormEvent, ReactNode } from "react";
import { BookOpen, Lock, User } from "lucide-react";
import Footer from "@/components/Footer";

interface LoginShellProps {
  title: string;
  subtitle: string;
  bannerTitle: string;
  bannerSubtitle: string;
  rollNumber: string;
  password: string;
  error: string;
  loading: boolean;
  onRollNumberChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  hint?: ReactNode;
}

export default function LoginShell({
  title,
  subtitle,
  bannerTitle,
  bannerSubtitle,
  rollNumber,
  password,
  error,
  loading,
  onRollNumberChange,
  onPasswordChange,
  onSubmit,
  hint,
}: LoginShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-blue-700 text-white text-center py-2 text-sm font-medium tracking-wide">
        Kinematics Classes CBT — Secure Login
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="lg:w-1/2 bg-linear-to-br from-blue-600 via-blue-500 to-blue-400 relative overflow-hidden flex items-center justify-center p-8">
          <div className="relative z-10 text-white text-center max-w-md">
            <div className="mb-8 flex justify-center">
              <div className="bg-white/20 backdrop-blur-lg p-6 rounded-3xl shadow-2xl">
                <BookOpen className="w-20 h-20 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
              {bannerTitle}
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed">
              {bannerSubtitle}
            </p>
          </div>
        </div>

        <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-600">{subtitle}</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="rollNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Roll Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="rollNumber"
                    value={rollNumber}
                    onChange={(e) => onRollNumberChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter roll number"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {hint && (
              <div className="mt-6 text-center text-sm text-gray-600">{hint}</div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
