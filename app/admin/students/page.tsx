"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getStudents } from "@/lib/authApi";
import CreateStudentForm from "@/components/CreateStudentForm";
import { getTests } from "@/lib/testApi";
import { getAllSubmissions } from "@/lib/submissionApi";
import { Submission, Test, UserDirectoryItem } from "@/lib/Interface";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<UserDirectoryItem[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getTests(), getAllSubmissions()])
      .then(([s, t, sub]) => {
        setStudents(s || []);
        setTests(t || []);
        setSubmissions(sub || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const attempted = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => set.add(`${s.userId}::${s.testId}`));
    return set;
  }, [submissions]);

  if (loading) {
    return <p className="text-slate-500">Loading students...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Students</h2>
        <p className="text-sm text-slate-600">
          Click a given test to open detailed analysis
        </p>
      </div>

      <CreateStudentForm
        onCreated={() => {
          getStudents().then((next) => setStudents(next || []));
        }}
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-5 py-3">Name</th>
              <th className="text-left px-5 py-3">Roll</th>
              <th className="text-left px-5 py-3">User ID</th>
              <th className="text-left px-5 py-3">Progress</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const given = tests.filter((t) =>
                attempted.has(`${student.userId}::${t.testId}`)
              ).length;
              return (
                <tr
                  key={student.userId}
                  className="border-t border-slate-100 align-top"
                >
                  <td className="px-5 py-4 font-medium">{student.fullName}</td>
                  <td className="px-5 py-4">{student.rollNumber}</td>
                  <td className="px-5 py-4 text-xs text-slate-500 font-mono">
                    {student.userId}
                  </td>
                  <td className="px-5 py-4">
                    <p className="mb-2 text-xs text-slate-500">
                      {given}/{tests.length} completed
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tests.map((test) => {
                        const done = attempted.has(
                          `${student.userId}::${test.testId}`
                        );
                        if (done) {
                          return (
                            <Link
                              key={test.testId}
                              href={`/admin/students/${student.userId}/attempts/${test.testId}`}
                              className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
                              title="Open analysis / allow reattempt"
                            >
                              {test.testName || test.testId} — Analysis / Reset
                            </Link>
                          );
                        }
                        return (
                          <span
                            key={test.testId}
                            className="px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-800"
                          >
                            {test.testName || test.testId} — Pending
                          </span>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
