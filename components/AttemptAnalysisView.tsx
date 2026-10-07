"use client";

import { AttemptAnalysis } from "@/lib/Interface";

function formatDuration(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export default function AttemptAnalysisView({
  analysis,
  title,
}: {
  analysis: AttemptAnalysis;
  title?: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {title || analysis.testName || "Attempt Analysis"}
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Submission {analysis.submissionId}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Score" value={`${analysis.score} / ${analysis.maxMarks}`} />
        <Stat label="Time taken" value={formatDuration(analysis.timeTakenMs || 0)} />
        <Stat
          label="Correct / Wrong"
          value={`${analysis.correctCount} / ${analysis.wrongCount}`}
        />
        <Stat label="Unanswered" value={String(analysis.unansweredCount)} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 font-semibold">
          Section-wise
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-5 py-3">Section</th>
                <th className="text-left px-5 py-3">Correct</th>
                <th className="text-left px-5 py-3">Wrong</th>
                <th className="text-left px-5 py-3">Unanswered</th>
                <th className="text-left px-5 py-3">Marks</th>
              </tr>
            </thead>
            <tbody>
              {(analysis.sections || []).map((s) => (
                <tr key={s.section} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-medium">{s.section}</td>
                  <td className="px-5 py-3 text-green-700">{s.correctCount}</td>
                  <td className="px-5 py-3 text-red-700">{s.wrongCount}</td>
                  <td className="px-5 py-3 text-amber-700">{s.unansweredCount}</td>
                  <td className="px-5 py-3">
                    {s.marksObtained} / {s.maxMarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 font-semibold">
          Question-wise
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Section</th>
                <th className="text-left px-4 py-3">Question</th>
                <th className="text-left px-4 py-3">Your</th>
                <th className="text-left px-4 py-3">Correct</th>
                <th className="text-left px-4 py-3">Result</th>
                <th className="text-left px-4 py-3">Marks</th>
              </tr>
            </thead>
            <tbody>
              {(analysis.questions || []).map((q, i) => (
                <tr key={q.questionId} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">{q.section}</td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="line-clamp-2">{q.stem}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {q.submittedValue || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-green-700">
                    {q.correctAnswer || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {!q.answered ? (
                      <span className="text-amber-700 text-xs font-semibold">
                        Skipped
                      </span>
                    ) : q.correct ? (
                      <span className="text-green-700 text-xs font-semibold">
                        Correct
                      </span>
                    ) : (
                      <span className="text-red-700 text-xs font-semibold">
                        Wrong
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {q.marksAwarded} / {q.maxMarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
        {label}
      </p>
      <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
