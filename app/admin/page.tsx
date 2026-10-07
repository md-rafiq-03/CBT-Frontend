"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Users,
  CheckCircle2,
  Clock3,
  HelpCircle,
  Activity,
} from "lucide-react";
import { getTests, updateTestActive } from "@/lib/testApi";
import { getQuestions } from "@/lib/questionApi";
import { getStudents } from "@/lib/authApi";
import { getAllSubmissions } from "@/lib/submissionApi";
import {
  Submission,
  Test,
  UserDirectoryItem,
} from "@/lib/Interface";

export default function AdminDashboardPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [students, setStudents] = useState<UserDirectoryItem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "students" | "tests">("overview");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [testsData, studentsData, submissionsData, questionsData] =
        await Promise.all([
          getTests(),
          getStudents(),
          getAllSubmissions(),
          getQuestions(),
        ]);
      setTests(testsData || []);
      setStudents(studentsData || []);
      setSubmissions(submissionsData || []);
      setQuestionCount((questionsData || []).length);
    } catch (err) {
      console.error(err);
      setError("Failed to load admin dashboard data. Restart backend if APIs are new.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeTests = tests.filter((t) => t.active).length;
  const inactiveTests = tests.length - activeTests;

  const attemptedPairs = useMemo(() => {
    const set = new Set<string>();
    for (const s of submissions) {
      set.add(`${s.userId}::${s.testId}`);
    }
    return set;
  }, [submissions]);

  const studentRows = useMemo(() => {
    return students.map((student) => {
      const given = tests.filter((t) =>
        attemptedPairs.has(`${student.userId}::${t.testId}`)
      ).length;
      const pending = Math.max(tests.length - given, 0);
      const studentSubs = submissions.filter((s) => s.userId === student.userId);
      return { student, given, pending, studentSubs };
    });
  }, [students, tests, attemptedPairs, submissions]);

  const toggleActive = async (test: Test) => {
    if (!test.testId) return;
    try {
      const updated = await updateTestActive(test.testId, !test.active);
      setTests((prev) =>
        prev.map((t) => (t.testId === test.testId ? { ...t, ...updated } : t))
      );
    } catch {
      setError("Failed to update test status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-600 text-sm">
            Overview of tests, students, and attempt progress
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/test/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            Create Test
          </Link>
          <Link
            href="/admin/questions"
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50"
          >
            Manage Questions
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<ClipboardList className="w-5 h-5" />}
          label="Total Tests"
          value={tests.length}
          tone="blue"
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Active / Inactive"
          value={`${activeTests} / ${inactiveTests}`}
          tone="green"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Students"
          value={students.length}
          tone="violet"
        />
        <StatCard
          icon={<HelpCircle className="w-5 h-5" />}
          label="Questions"
          value={questionCount}
          tone="amber"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-2 inline-flex gap-1">
        {(
          [
            ["overview", "Overview"],
            ["students", "Students & Attempts"],
            ["tests", "Tests Status"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              tab === id
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4">Recent Submissions</h3>
            {submissions.length === 0 ? (
              <p className="text-sm text-slate-500">No submissions yet.</p>
            ) : (
              <ul className="space-y-3">
                {submissions
                  .slice()
                  .sort((a, b) => (b.endTime || 0) - (a.endTime || 0))
                  .slice(0, 6)
                  .map((s) => {
                    const student = students.find((st) => st.userId === s.userId);
                    const test = tests.find((t) => t.testId === s.testId);
                    return (
                      <li
                        key={s.submissionId || `${s.userId}-${s.testId}-${s.endTime}`}
                        className="flex items-center justify-between gap-3 text-sm border-b border-slate-100 pb-2"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {student?.fullName || s.userId}
                          </p>
                          <p className="text-slate-500">
                            {test?.testName || s.testId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-700">
                            Score {s.score ?? 0}
                          </p>
                          <p className="text-xs text-slate-400">
                            {s.endTime
                              ? new Date(s.endTime).toLocaleString()
                              : "—"}
                          </p>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuickLink href="/admin/test" title="All Tests" desc="List & status" />
              <QuickLink href="/admin/test/create" title="New Test" desc="Create mock" />
              <QuickLink href="/admin/questions" title="Questions" desc="CRUD bank" />
              <QuickLink href="/admin/students" title="Students" desc="Progress matrix" />
            </div>
          </div>
        </div>
      )}

      {tab === "students" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Students — given vs pending</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-3">Student</th>
                  <th className="text-left px-5 py-3">Roll</th>
                  <th className="text-left px-5 py-3">Given</th>
                  <th className="text-left px-5 py-3">Pending</th>
                  <th className="text-left px-5 py-3">Per-test status</th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map(({ student, given, pending }) => (
                  <tr key={student.userId} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {student.fullName}
                    </td>
                    <td className="px-5 py-3">{student.rollNumber}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {given}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-full text-xs font-semibold">
                        <Clock3 className="w-3.5 h-3.5" />
                        {pending}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5 max-w-xl">
                        {tests.map((test) => {
                          const done = attemptedPairs.has(
                            `${student.userId}::${test.testId}`
                          );
                          return (
                            <span
                              key={test.testId}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                done
                                  ? "bg-green-100 text-green-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                              title={test.testName}
                            >
                              {(test.testName || test.testId || "").slice(0, 18)}
                              {done ? " ✓" : " ·"}
                            </span>
                          );
                        })}
                        {tests.length === 0 && (
                          <span className="text-slate-400">No tests</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {studentRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "tests" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Tests & active status</h3>
            <Link href="/admin/test" className="text-sm text-blue-600 font-semibold">
              Open full list →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-3">Test</th>
                  <th className="text-left px-5 py-3">Questions</th>
                  <th className="text-left px-5 py-3">Attempts</th>
                  <th className="text-left px-5 py-3">Window</th>
                  <th className="text-left px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => {
                  const attemptCount = submissions.filter(
                    (s) => s.testId === test.testId
                  ).length;
                  return (
                    <tr key={test.testId} className="border-t border-slate-100">
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {test.testName}
                      </td>
                      <td className="px-5 py-3">{test.totalQuestions}</td>
                      <td className="px-5 py-3">{attemptCount}</td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {test.startAt
                          ? new Date(Number(test.startAt)).toLocaleDateString()
                          : "—"}{" "}
                        →{" "}
                        {test.expireAt
                          ? new Date(Number(test.expireAt)).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => toggleActive(test)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            test.active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          }`}
                        >
                          {test.active ? "Active" : "Inactive"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone: "blue" | "green" | "violet" | "amber";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${tones[tone]}`}>{icon}</div>
      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
    >
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </Link>
  );
}
