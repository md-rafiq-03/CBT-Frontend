"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import AttemptAnalysisView from "@/components/AttemptAnalysisView";
import { useAuth } from "@/contexts/AuthContext";
import { getAttemptAnalysis } from "@/lib/submissionApi";
import { AttemptAnalysis } from "@/lib/Interface";

export default function TestResultPage() {
  return (
    <ProtectedRoute role="STUDENT" loginPath="/login">
      <ResultInner />
    </ProtectedRoute>
  );
}

function ResultInner() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const testId = String(params?.id ?? "");
  const [analysis, setAnalysis] = useState<AttemptAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !testId) return;
    getAttemptAnalysis(user.userId, testId)
      .then(setAnalysis)
      .catch(() => setError("Could not load result analysis for this test."))
      .finally(() => setLoading(false));
  }, [user, testId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6">
        <p className="text-red-600">{error || "No analysis found"}</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-sm font-semibold text-blue-600">
            ← Dashboard
          </Link>
          <Link
            href={`/test/${testId}?mode=review`}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Review solutions
          </Link>
        </div>
        <AttemptAnalysisView analysis={analysis} />
      </div>
    </div>
  );
}
