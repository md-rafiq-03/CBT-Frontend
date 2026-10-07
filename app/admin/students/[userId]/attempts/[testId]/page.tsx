"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AttemptAnalysisView from "@/components/AttemptAnalysisView";
import {
  getAttemptAnalysis,
  resetStudentAttempt,
} from "@/lib/submissionApi";
import { getUsers } from "@/lib/authApi";
import { AttemptAnalysis } from "@/lib/Interface";

export default function AdminAttemptAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const userId = String(params?.userId ?? "");
  const testId = String(params?.testId ?? "");
  const [analysis, setAnalysis] = useState<AttemptAnalysis | null>(null);
  const [studentName, setStudentName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!userId || !testId) return;
    Promise.all([getAttemptAnalysis(userId, testId), getUsers()])
      .then(([a, users]) => {
        setAnalysis(a);
        const u = (users || []).find((x) => x.userId === userId);
        setStudentName(u ? `${u.fullName} (${u.rollNumber})` : userId);
      })
      .catch(() => setError("Failed to load attempt analysis"))
      .finally(() => setLoading(false));
  }, [userId, testId]);

  const handleAllowReattempt = async () => {
    const ok = confirm(
      "Allow reattempt?\n\nThis will permanently delete ALL submission records for this student on this test.\nNo score/result will remain. The student can take the test again from scratch."
    );
    if (!ok) return;

    setResetting(true);
    setError(null);
    try {
      const msg = await resetStudentAttempt(userId, testId);
      setMessage(msg);
      setAnalysis(null);
      setTimeout(() => router.push("/admin/students"), 1200);
    } catch {
      setError("Failed to reset attempt. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading analysis...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/students"
          className="inline-flex text-sm font-semibold text-blue-600"
        >
          ← Back to students
        </Link>
        {analysis && (
          <button
            onClick={handleAllowReattempt}
            disabled={resetting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
          >
            {resetting ? "Resetting..." : "Allow reattempt (wipe submission)"}
          </button>
        )}
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {analysis ? (
        <AttemptAnalysisView
          analysis={analysis}
          title={`${analysis.testName} — ${studentName}`}
        />
      ) : (
        !message && <p className="text-slate-500">No attempt data found.</p>
      )}
    </div>
  );
}
