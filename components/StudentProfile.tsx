"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getTests } from "@/lib/testApi";
import { getAttemptAnalysis, getSubmissionsByUserId } from "@/lib/submissionApi";
import { passwordPath } from "@/lib/authPaths";
import { Submission, Test } from "@/lib/Interface";

type AttemptRow = {
  testId: string;
  testName: string;
  score: number;
  maxMarks: number;
  endTime: number;
  correct: number | null;
  wrong: number | null;
  unanswered: number | null;
};

const CHART_LIMIT = 8;

function formatDate(ms: number) {
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function StudentProfile() {
  const { user } = useAuth();
  const [rows, setRows] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [tests, mine] = await Promise.all([
          getTests(),
          getSubmissionsByUserId(user.userId),
        ]);
        const byTest = new Map<string, Test>();
        for (const test of tests || []) {
          if (test.testId) byTest.set(test.testId, test);
          if (test.id) byTest.set(test.id, test);
        }

        const latest = new Map<string, Submission>();
        for (const submission of mine || []) {
          const prev = latest.get(submission.testId);
          if (!prev || (submission.endTime || 0) > (prev.endTime || 0)) {
            latest.set(submission.testId, submission);
          }
        }

        const built = await Promise.all(
          Array.from(latest.values()).map(async (submission) => {
            const test = byTest.get(submission.testId);
            let analysis = null;
            try {
              analysis = await getAttemptAnalysis(user.userId, submission.testId);
            } catch {
              analysis = null;
            }
            const maxMarks = analysis?.maxMarks || test?.maxMarks || 0;
            const score = analysis?.score ?? submission.score ?? 0;
            return {
              testId: submission.testId,
              testName:
                analysis?.testName || test?.testName || submission.testId,
              score,
              maxMarks,
              endTime: submission.endTime || analysis?.endTime || 0,
              correct: analysis ? analysis.correctCount : null,
              wrong: analysis ? analysis.wrongCount : null,
              unanswered: analysis ? analysis.unansweredCount : null,
            } satisfies AttemptRow;
          })
        );

        if (cancelled) return;
        built.sort((a, b) => b.endTime - a.endTime);
        setRows(built);
      } catch {
        if (!cancelled) setError("Could not load your profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const chartRows = useMemo(() => {
    return [...rows].sort((a, b) => a.endTime - b.endTime).slice(-CHART_LIMIT);
  }, [rows]);

  if (!user) return null;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      <p className="mt-1 text-gray-600">
        Your details and how you did on recent tests.
      </p>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Personal info</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Name" value={user.fullName} />
          <Field label="Roll number" value={user.rollNumber} />
          <div className="md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="password"
                value="********"
                disabled
                aria-label="Password hidden"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-base text-gray-500 sm:max-w-xs"
              />
              <Link
                href={passwordPath("student")}
                className="inline-flex items-center justify-center rounded-xl border border-blue-500 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
              >
                Forgot password
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Progress</h2>
        <p className="text-sm text-gray-500">
          Last {Math.min(CHART_LIMIT, chartRows.length) || CHART_LIMIT} tests,
          scored as a percentage. Hover a point for the test name and score.
        </p>
        {loading ? (
          <p className="py-16 text-center text-gray-500">Loading progress...</p>
        ) : error ? (
          <p className="py-16 text-center text-red-600">{error}</p>
        ) : chartRows.length === 0 ? (
          <p className="py-16 text-center text-gray-500">
            No attempted tests yet.
          </p>
        ) : (
          <ProgressChart rows={chartRows} />
        )}
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent tests</h2>
          <p className="text-sm text-gray-500">
            {rows.length} attempted test{rows.length === 1 ? "" : "s"}, newest
            first.
          </p>
        </div>
        {loading ? (
          <p className="px-5 py-10 text-gray-500">Loading tests...</p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-10 text-gray-500">No attempted tests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Test</th>
                  <th className="px-5 py-3 font-semibold">Attempted on</th>
                  <th className="px-5 py-3 font-semibold">Score</th>
                  <th className="px-5 py-3 font-semibold">Percent</th>
                  <th className="px-5 py-3 font-semibold">Correct</th>
                  <th className="px-5 py-3 font-semibold">Wrong</th>
                  <th className="px-5 py-3 font-semibold">Unanswered</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const percent = row.maxMarks
                    ? Math.round((row.score / row.maxMarks) * 100)
                    : null;
                  return (
                    <tr key={row.testId} className="border-t border-gray-100">
                      <td className="px-5 py-3 font-medium text-gray-900">
                        <Link
                          href={`/test/${row.testId}/result`}
                          className="text-blue-600 hover:underline"
                        >
                          {row.testName}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {row.endTime ? formatDate(row.endTime) : "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-900">
                        {row.score}/{row.maxMarks || "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {percent == null ? "—" : `${percent}%`}
                      </td>
                      <td className="px-5 py-3 text-emerald-700">
                        {row.correct ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-red-700">
                        {row.wrong ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-amber-700">
                        {row.unanswered ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <input
        value={value}
        disabled
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-base text-gray-900"
      />
    </label>
  );
}

function ProgressChart({ rows }: { rows: AttemptRow[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 720;
  const height = 280;
  const pad = { left: 48, right: 16, top: 20, bottom: 36 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const values = rows.map((row) =>
    row.maxMarks ? (row.score / row.maxMarks) * 100 : 0
  );

  const points = rows.map((row, index) => {
    const value = values[index];
    const x =
      pad.left +
      (rows.length === 1 ? plotW / 2 : (index / (rows.length - 1)) * plotW);
    const y = pad.top + (1 - value / 100) * plotH;
    return { row, value, x, y };
  });

  const line = points.map((point) => `${point.x},${point.y}`).join(" ");

  const yTicks = [100, 50, 0].map((label) => ({
    label,
    y: pad.top + ((100 - label) / 100) * plotH,
  }));

  const active = hover == null ? null : points[hover];

  return (
    <div className="relative mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        {yTicks.map((tick) => (
          <g key={tick.label}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={tick.y}
              y2={tick.y}
              stroke="#e5e7eb"
            />
            <text
              x={pad.left - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="fill-gray-500 text-[11px]"
            >
              {tick.label}%
            </text>
          </g>
        ))}
        {line && (
          <polyline
            fill="none"
            stroke="#447dfc"
            strokeWidth="2.5"
            points={line}
          />
        )}
        {points.map((point, index) =>
          point.y == null ? null : (
            <g key={point.row.testId}>
              <circle
                cx={point.x}
                cy={point.y}
                r="14"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(null)}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={hover === index ? 7 : 5}
                fill="#447dfc"
                stroke="#ffffff"
                strokeWidth="2"
                pointerEvents="none"
              />
              <text
                x={point.x}
                y={height - 12}
                textAnchor="middle"
                className="fill-gray-500 text-[11px]"
              >
                {point.row.testName.length > 12
                  ? `${point.row.testName.slice(0, 12)}…`
                  : point.row.testName}
              </text>
            </g>
          )
        )}
      </svg>
      {active && active.y != null && (
        <div
          className="pointer-events-none absolute z-10 w-52 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg"
          style={{
            left: `${(active.x / width) * 100}%`,
            top: `${(active.y / height) * 100}%`,
            transform:
              active.y < 72 ? "translate(-50%, 12px)" : "translate(-50%, -120%)",
          }}
        >
          <p className="font-semibold text-gray-900">{active.row.testName}</p>
          <p className="mt-1 text-gray-700">
            Score {active.row.score}/{active.row.maxMarks || "—"}
          </p>
        </div>
      )}
    </div>
  );
}
