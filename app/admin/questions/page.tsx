"use client";

import { useState, useEffect } from "react";
import { Question, Test } from "@/lib/Interface";
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/lib/questionApi";
import { getTests } from "@/lib/testApi";
import QuestionDialog from "@/components/QuestionDialog";
import { Plus, Trash2, Edit2, Search } from "lucide-react";

export default function QuestionsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterTestId, setFilterTestId] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [uniqueSections, setUniqueSections] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
    fetchTests();
  }, []);

  useEffect(() => {
    let filtered = questions;
    if (filterTestId) {
      filtered = filtered.filter((q) => q.testId === filterTestId);
    }
    if (filterSection) {
      filtered = filtered.filter((q) => q.section === filterSection);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (q) =>
          q.stem.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(q.section).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredQuestions(filtered);
  }, [questions, filterTestId, filterSection, searchQuery]);

  useEffect(() => {
    setUniqueSections(Array.from(new Set(questions.map((q) => String(q.section)))));
  }, [questions]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      setQuestions(await getQuestions());
    } catch {
      setMessage("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      const data = await getTests();
      setTests(data || []);
    } catch {
      setTests([]);
    }
  };

  const handleCreateQuestion = async (
    data: Omit<Question, "id" | "questionId">
  ) => {
    await createQuestion(data);
    setMessage("Question created successfully");
    await fetchQuestions();
  };

  const handleUpdateQuestion = async (
    data: Omit<Question, "id" | "questionId">
  ) => {
    const qId = editingQuestion?.questionId || editingQuestion?.id || "";
    if (!qId) throw new Error("Invalid question ID");
    await updateQuestion(qId, data);
    setMessage("Question updated successfully");
    setEditingQuestion(undefined);
    await fetchQuestions();
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await deleteQuestion(questionId);
    setMessage("Question deleted");
    setDeleteConfirm(null);
    await fetchQuestions();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Questions</h2>
          <p className="text-sm text-slate-600">
            Create and manage the question bank
          </p>
        </div>
        <button
          onClick={() => {
            setEditingQuestion(undefined);
            setIsDialogOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Question
        </button>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stem or section..."
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select
          value={filterTestId}
          onChange={(e) => setFilterTestId(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-lg"
        >
          <option value="">All Tests</option>
          {tests.map((test) => (
            <option key={test.testId} value={test.testId}>
              {test.testName}
            </option>
          ))}
        </select>
        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-lg"
        >
          <option value="">All Sections</option>
          {uniqueSections.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No questions found. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-3">Question</th>
                  <th className="text-left px-5 py-3">Test</th>
                  <th className="text-left px-5 py-3">Section</th>
                  <th className="text-left px-5 py-3">Type</th>
                  <th className="text-left px-5 py-3">Marks</th>
                  <th className="text-center px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question) => {
                  const test = tests.find((t) => t.testId === question.testId);
                  const qKey = question.questionId || question.id || "";
                  return (
                    <tr
                      key={qKey}
                      className="border-t border-slate-100 hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4 max-w-sm">
                        <p className="line-clamp-2 text-slate-900">
                          {question.stem}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {test?.testName || question.testId}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                          {question.section}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{question.type}</td>
                      <td className="px-5 py-4 font-semibold">{question.marks}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingQuestion(question);
                              setIsDialogOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {deleteConfirm === qKey ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteQuestion(qKey)}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 text-xs bg-slate-200 rounded"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(qKey)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && filteredQuestions.length > 0 && (
        <p className="text-center text-sm text-slate-500">
          Showing {filteredQuestions.length} of {questions.length} questions
        </p>
      )}

      <QuestionDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingQuestion(undefined);
        }}
        initialData={editingQuestion}
        onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
        tests={tests}
        title={editingQuestion ? "Edit Question" : "Create New Question"}
      />
    </div>
  );
}
