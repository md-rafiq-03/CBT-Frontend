"use client";

import { useEffect, useState } from "react";
import { getQuestionsByTestId } from "@/lib/questionApi";
import { Question } from "@/lib/Interface";
import { useSearchParams } from "next/navigation";

export default function TestDetailClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const testId = searchParams.get("testId");

  useEffect(() => {
    if (!testId) return;
    setLoading(true);

    Promise.all([
      getQuestionsByTestId(testId),
      import("@/lib/testApi").then((mod) => mod.getTestById(testId)),
    ])
      .then(([questionsData, testData]) => {
        setQuestions(questionsData);
        setTest(testData);
      })
      .catch(() => setError("Failed to fetch test details"))
      .finally(() => setLoading(false));
  }, [testId]);

  return <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Details</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {test && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="text-lg font-semibold mb-2">{test.testName}</div>
          <div className="text-gray-700 mb-1">Max Marks: {test.maxMarks}</div>
          <div className="text-gray-700 mb-1">Duration: {test.durationInMins} mins</div>
          <div className="text-gray-700 mb-1">Passing Marks: {test.passingMarks}</div>
          <div className="text-gray-700 mb-1">Active: {test.active ? "Yes" : "No"}</div>
          <div className="text-gray-700 mb-1">Total Questions: {test.totalQuestions}</div>
          {test.sections && (
            <div className="text-gray-700 mb-1">
              Sections:{" "}
              {test.sections
                .map(
                  (s: { name: string; count?: number; mcqType?: number; integerType?: number }) =>
                    `${s.name} (${s.count ?? 0}: ${s.mcqType ?? 0} MCQ + ${s.integerType ?? 0} INT)`
                )
                .join(", ")}
            </div>
          )}
        </div>
      )}
      <h2 className="text-xl font-bold mb-2">Questions</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Question</th>
            <th className="p-2">Section</th>
            <th className="p-2">Type</th>
            <th className="p-2">Marks</th>
          </tr>
        </thead>
        <tbody>
          {questions.map(q => (
            <tr key={q.questionId} className="border-t">
              <td className="p-2">{q.stem}</td>
              <td className="p-2">{q.section}</td>
              <td className="p-2">{q.type}</td>
              <td className="p-2">{q.marks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>;
}