"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import AttemptAnalysisView from "@/components/AttemptAnalysisView";
import { useAuth } from "@/contexts/AuthContext";
import { getAttemptAnalysis } from "@/lib/submissionApi";
import { AttemptAnalysis } from "@/lib/Interface";
import Link from "next/link";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading result...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 p-6">
        <p className="text-red-600">{error || "No analysis found"}</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold"
          >
            Dashboard
          </Link>
          <Link
            href={`/test/${testId}?mode=review`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
          >
            Review answers
          </Link>
        </div>
        <AttemptAnalysisView analysis={analysis} />
      </div>
    </div>
  );
}
