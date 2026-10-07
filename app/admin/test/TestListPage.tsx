"use client";

import { useEffect, useState } from "react";
import { getTests, deleteTest, updateTestActive } from "@/lib/testApi";
import { Test } from "@/lib/Interface";
import Link from "next/link";
import { Plus, Trash2, Eye, ToggleLeft, ToggleRight } from "lucide-react";

export default function TestListPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getTests()
      .then((data) => setTests(data || []))
      .catch(() => setError("Failed to fetch tests"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (testId: string) => {
    if (!confirm("Delete this test?")) return;
    try {
      await deleteTest(testId);
      setTests((prev) => prev.filter((t) => t.testId !== testId));
    } catch {
      setError("Failed to delete test");
    }
  };

  const toggleActive = async (test: Test) => {
    if (!test.testId) return;
    try {
      const updated = await updateTestActive(test.testId, !test.active);
      setTests((prev) =>
        prev.map((t) => (t.testId === test.testId ? { ...t, ...updated } : t))
      );
    } catch {
      setError("Failed to update active status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tests</h2>
          <p className="text-sm text-slate-600">
            Create, activate, and manage exam papers
          </p>
        </div>
        <Link
          href="/admin/test/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Test
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading tests...</div>
        ) : tests.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No tests yet. Create your first test.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-3">Test Name</th>
                  <th className="text-left px-5 py-3">Questions</th>
                  <th className="text-left px-5 py-3">Sections</th>
                  <th className="text-left px-5 py-3">Duration</th>
                  <th className="text-left px-5 py-3">Marks</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr
                    key={test.testId || test.id}
                    className="border-t border-slate-100 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {test.testName}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {test.testId}
                      </p>
                    </td>
                    <td className="px-5 py-4">{test.totalQuestions}</td>
                    <td className="px-5 py-4 text-xs text-slate-600 max-w-xs">
                      {(test.sections || [])
                        .map((s) => `${s.name} (${s.count})`)
                        .join(", ") || "—"}
                    </td>
                    <td className="px-5 py-4">{test.durationInMins} min</td>
                    <td className="px-5 py-4">{test.maxMarks}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleActive(test)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          test.active
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {test.active ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                        {test.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/test/detail?testId=${test.testId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Link>
                        <button
                          onClick={() =>
                            test.testId && handleDelete(test.testId)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
