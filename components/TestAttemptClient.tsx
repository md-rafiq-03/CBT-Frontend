"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getTestById, getTests } from "@/lib/testApi";
import {
  getQuestionsByTestId,
  getQuestionsByTestIdWithAnswers,
} from "@/lib/questionApi";
import {
  getSubmissionByUserAndTest,
  saveSubmission,
} from "@/lib/submissionApi";
import {
  Question,
  QuestionAttachment,
  QuestionOption,
  StudentAnswer,
  SubmissionPerQuestion,
  Test,
} from "@/lib/Interface";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import TestInstructions from "@/components/TestInstructions";
import TestTimer from "@/components/TestTimer";
import QuestionDisplay from "@/components/QuestionDisplay";
import QuestionGrid from "@/components/QuestionGrid";
import SubmitDialog from "@/components/SubmitDialog";
import { useAttemptRestrictions } from "@/hooks/useAttemptRestrictions";

type AttemptPhase = "confirm" | "in_progress" | "review";

const LOCK_IN_MS = 30 * 60 * 1000;

function formatLockRemaining(ms: number) {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getQuestionKey(question: Question): string {
  return question.questionId || question.id || "";
}

export default function TestAttemptClient() {
  return (
    <ProtectedRoute role="STUDENT" loginPath="/login">
      <TestAttemptInner />
    </ProtectedRoute>
  );
}

function TestAttemptInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const routeId = String(params?.id ?? "");
  const initialReview = searchParams.get("mode") === "review";

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [phase, setPhase] = useState<AttemptPhase>(
    initialReview ? "review" : "confirm"
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(
    () => new Set()
  );
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  const [showAnswers, setShowAnswers] = useState(false); // default OFF
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showLockInDialog, setShowLockInDialog] = useState(false);
  const [cheatWarning, setCheatWarning] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const cheatFlagRef = useRef(false);

  useEffect(() => {
    if (!routeId || !user) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let testData: Test | null = null;
        try {
          testData = await getTestById(routeId);
        } catch {
          const allTests = await getTests();
          testData =
            allTests.find((t) => t.id === routeId || t.testId === routeId) ??
            null;
        }
        if (!testData) throw new Error("Test not found");

        const testKey = testData.testId || testData.id || routeId;
        const existing = await getSubmissionByUserAndTest(user.userId, testKey);

        if (existing || initialReview) {
          const withAnswers = await getQuestionsByTestIdWithAnswers(testKey);
          if (cancelled) return;

          const restored: Record<string, StudentAnswer> = {};
          for (const item of existing?.submissionPerQuestionList || []) {
            const isMcq = item.type === "MCQ";
            restored[item.questionId] = {
              question_id: item.questionId,
              selected_option_id: isMcq ? item.submittedValue : null,
              integer_answer: !isMcq ? Number(item.submittedValue) : undefined,
              is_answered: Boolean(item.submittedValue),
              answered_at: new Date().toISOString(),
            };
          }

          setTest(testData);
          setQuestions(withAnswers || []);
          setAnswers(restored);
          setAlreadyAttempted(true);
          setPhase("review");
          setShowAnswers(false);
        } else {
          const questionsData = await getQuestionsByTestId(testKey);
          if (cancelled) return;
          setTest(testData);
          setQuestions(questionsData || []);
          setAlreadyAttempted(false);
          setPhase("confirm");
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load this test."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [routeId, user, initialReview]);

  const questionKeys = useMemo(
    () => questions.map(getQuestionKey).filter(Boolean),
    [questions]
  );

  const sections = useMemo(() => {
    const unique = Array.from(new Set(questions.map((q) => String(q.section))));
    return unique.length > 0 ? unique : ["GENERAL"];
  }, [questions]);

  const questionIdsBySection = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const section of sections) {
      map[section] = questions
        .filter((q) => String(q.section) === section)
        .map(getQuestionKey)
        .filter(Boolean);
    }
    return map;
  }, [questions, sections]);

  const currentQuestion = questions[currentIndex];
  const currentQuestionKey = currentQuestion
    ? getQuestionKey(currentQuestion)
    : "";
  const currentSectionName = currentQuestion
    ? String(currentQuestion.section)
    : sections[0] || "GENERAL";

  const goToSection = (section: string) => {
    const firstInSection = questions.findIndex(
      (q) => String(q.section) === section
    );
    if (firstInSection >= 0) setCurrentIndex(firstInSection);
  };

  const sectionQuestionIds =
    questionIdsBySection[currentSectionName] || [];
  const indexInSection = currentQuestionKey
    ? sectionQuestionIds.indexOf(currentQuestionKey)
    : -1;
  const sectionQuestionPosition =
    indexInSection >= 0
      ? `${indexInSection + 1}/${sectionQuestionIds.length}`
      : `1/${sectionQuestionIds.length || 0}`;

  useEffect(() => {
    if (!currentQuestionKey || phase === "confirm") return;
    setVisited((prev) => {
      if (prev.has(currentQuestionKey)) return prev;
      const next = new Set(prev);
      next.add(currentQuestionKey);
      return next;
    });
  }, [currentQuestionKey, phase]);

  const answeredQuestions = useMemo(() => {
    const set = new Set<string>();
    for (const [qid, answer] of Object.entries(answers)) {
      if (answer.is_answered) set.add(qid);
    }
    return set;
  }, [answers]);

  const answeredCount = answeredQuestions.size;

  const handleAnswerChange = (
    answerId: string | null,
    integerValue?: number
  ) => {
    if (phase === "review") return;
    if (!currentQuestionKey) return;
    const isAnswered =
      (answerId != null && answerId !== "") ||
      (integerValue !== undefined && !Number.isNaN(integerValue));
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionKey]: {
        question_id: currentQuestionKey,
        selected_option_id: answerId,
        integer_answer: integerValue,
        is_answered: isAnswered,
        answered_at: new Date().toISOString(),
      },
    }));
  };

  const goToQuestionId = (questionId: string) => {
    const index = questionKeys.indexOf(questionId);
    if (index >= 0) setCurrentIndex(index);
  };

  const selectFromPalette = (questionId: string) => {
    goToQuestionId(questionId);
    setPaletteOpen(false);
  };

  const goNext = () =>
    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));

  const markCurrent = (mark: boolean) => {
    if (!currentQuestionKey) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (mark) next.add(currentQuestionKey);
      else next.delete(currentQuestionKey);
      return next;
    });
  };

  const clearSelection = () => {
    if (!currentQuestionKey) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestionKey];
      return next;
    });
    markCurrent(false);
  };

  const lockRemainingMs = Math.max(0, startedAt + LOCK_IN_MS - now);
  const lockInActive = phase === "in_progress" && lockRemainingMs > 0;

  useEffect(() => {
    if (phase !== "in_progress") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const { allowLeave } = useAttemptRestrictions({
    active: phase === "in_progress",
    onBack: () => {
      if (Date.now() < startedAt + LOCK_IN_MS) setShowLockInDialog(true);
      else setShowSubmitDialog(true);
    },
    onViolation: (message) => {
      cheatFlagRef.current = true;
      setCheatWarning(message);
    },
  });

  const finishTest = useCallback(async (force = false) => {
    if (!user || !test) return;
    if (!force && Date.now() < startedAt + LOCK_IN_MS) {
      setShowLockInDialog(true);
      setShowSubmitDialog(false);
      return;
    }
    setSubmitting(true);
    setShowSubmitDialog(false);
    try {
      const testKey = test.testId || test.id || routeId;
      const submissionPerQuestionList: SubmissionPerQuestion[] = questions.map(
        (q) => {
          const key = getQuestionKey(q);
          const ans = answers[key];
          const isMcq = q.type === "MCQ";
          return {
            questionId: key,
            type: isMcq ? "MCQ" : "INTEGER",
            submittedValue: isMcq
              ? ans?.selected_option_id || ""
              : ans?.integer_answer != null
              ? String(ans.integer_answer)
              : "",
          };
        }
      );
      await saveSubmission({
        userId: user.userId,
        testId: testKey,
        submissionPerQuestionList,
        startedAt,
        endTime: Date.now(),
        cheatFlag: cheatFlagRef.current,
        score: 0, // backend recalculates
      });
      allowLeave();
      router.push(`/test/${testKey}/result`);
    } catch (err) {
      console.error("Submit failed:", err);
      setError("Failed to save submission. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [user, test, routeId, answers, startedAt, questions, router, allowLeave]);

  const handleTimeUp = useCallback(() => {
    finishTest(true);
  }, [finishTest]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 font-medium">Loading test...</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 p-6">
        <p className="text-red-600 font-medium">{error || "Test not found"}</p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (phase === "confirm") {
    return (
      <TestInstructions
        testName={test.testName || "Untitled Test"}
        durationMinutes={test.durationInMins || 0}
        totalQuestions={Number(test.totalQuestions) || questions.length || 0}
        sections={sections}
        onProceed={() => {
          setStartedAt(Date.now());
          setPhase("in_progress");
        }}
        onBack={() => router.push("/")}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 p-6">
        <p className="text-gray-700 font-medium">No questions available.</p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const options: QuestionOption[] = (currentQuestion.options || []).map(
    (opt) => ({
      optionId: opt.optionId,
      text: opt.text,
      image: opt.image ?? null,
    })
  );

  const attachments: QuestionAttachment[] = (
    currentQuestion.attachments || []
  ).map((url) => ({ url, type: "image" }));

  const isReview = phase === "review";
  const testKey = test.testId || test.id || routeId;

  return (
    <div className="min-h-[100dvh] bg-gray-100 flex flex-col">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-2.5 py-2 sm:px-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-gray-900 truncate">
              {test.testName}
              {isReview && (
                <span className="ml-1.5 align-middle text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  Review
                </span>
              )}
            </h1>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Q {currentIndex + 1}/{questions.length}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isReview ? (
              <>
                <button
                  onClick={() => router.push(`/test/${testKey}/result`)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded font-semibold text-[11px] sm:text-xs"
                >
                  Result
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded font-semibold text-[11px] sm:text-xs"
                >
                  Home
                </button>
              </>
            ) : (
              <>
                <TestTimer
                  durationMinutes={test.durationInMins || 60}
                  onTimeUp={handleTimeUp}
                  isActive={phase === "in_progress" && !submitting}
                />
                <button
                  onClick={() => {
                    if (lockInActive) setShowLockInDialog(true);
                    else setShowSubmitDialog(true);
                  }}
                  disabled={submitting}
                  className={`text-white px-2.5 py-1.5 rounded font-semibold text-[11px] sm:text-xs disabled:opacity-50 ${
                    lockInActive
                      ? "bg-slate-500 hover:bg-slate-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {lockInActive
                    ? `Locked ${formatLockRemaining(lockRemainingMs)}`
                    : "Submit"}
                </button>
              </>
            )}
          </div>
        </div>
        {sections.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <label className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                Section
              </span>
              <select
                value={currentSectionName}
                onChange={(e) => goToSection(e.target.value)}
                className="w-auto max-w-[8.5rem] rounded border border-gray-300 bg-white px-2 py-1.5 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Select section"
              >
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="lg:hidden ml-auto shrink-0 rounded bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-white"
              aria-expanded={paletteOpen}
              aria-controls="question-palette"
            >
              Questions
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_260px] gap-2 p-2 min-h-0">
        <div className="bg-white rounded border border-gray-200 overflow-hidden flex flex-col flex-1 min-h-0 lg:h-[calc(100dvh-5.75rem)]">
          <QuestionDisplay
            question={currentQuestion}
            options={options}
            attachments={attachments}
            currentAnswer={answers[currentQuestionKey]}
            onAnswerChange={handleAnswerChange}
            onPrevious={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            onClear={clearSelection}
            onMarkForReview={() => markCurrent(true)}
            onMarkForReviewAndNext={() => {
              markCurrent(true);
              goNext();
            }}
            onSaveAndNext={goNext}
            hasPrevious={currentIndex > 0}
            hasNext={currentIndex < questions.length - 1}
            questionPosition={sectionQuestionPosition}
            readOnly={isReview}
            showCorrectAnswer={isReview && showAnswers}
            onToggleShowAnswer={() => setShowAnswers((v) => !v)}
            isReviewMode={isReview}
            isMarkedForReview={markedForReview.has(currentQuestionKey)}
          />
        </div>

        <div className="hidden lg:block lg:min-h-0 lg:h-[calc(100dvh-5.75rem)]">
          <QuestionGrid
            sections={sections}
            activeSection={currentSectionName}
            answeredQuestions={answeredQuestions}
            markedForReview={markedForReview}
            visitedQuestions={visited}
            currentQuestionId={currentQuestionKey}
            onQuestionSelect={goToQuestionId}
            questionIds={questionIdsBySection}
          />
        </div>
      </div>

      <div
        className={`lg:hidden fixed inset-0 z-40 ${
          paletteOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!paletteOpen}
      >
        <button
          type="button"
          aria-label="Close questions"
          tabIndex={paletteOpen ? 0 : -1}
          onClick={() => setPaletteOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            paletteOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          id="question-palette"
          role="dialog"
          aria-label="Question palette"
          className={`absolute inset-y-0 right-0 flex w-[min(88vw,22rem)] flex-col bg-white shadow-2xl transition-transform duration-200 ${
            paletteOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
            <p className="text-sm font-semibold text-gray-900">Questions</p>
            <button
              type="button"
              onClick={() => setPaletteOpen(false)}
              className="rounded bg-slate-800 px-2.5 py-1 text-xs font-bold text-white hover:bg-slate-900"
            >
              Close
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <QuestionGrid
              sections={sections}
              activeSection={currentSectionName}
              answeredQuestions={answeredQuestions}
              markedForReview={markedForReview}
              visitedQuestions={visited}
              currentQuestionId={currentQuestionKey}
              onQuestionSelect={selectFromPalette}
              questionIds={questionIdsBySection}
            />
          </div>
        </div>
      </div>

      {cheatWarning && (
        <div className="fixed top-3 inset-x-3 z-[60] mx-auto max-w-lg rounded-lg border border-red-200 bg-red-50 px-3 py-2 shadow-lg sm:inset-x-auto sm:right-3 sm:left-auto">
          <p className="text-xs font-semibold text-red-800">{cheatWarning}</p>
          <button
            type="button"
            onClick={() => setCheatWarning(null)}
            className="mt-1 text-[11px] font-bold text-red-900 underline"
          >
            Continue test
          </button>
        </div>
      )}

      {showLockInDialog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-xl bg-white p-5 shadow-2xl sm:rounded-xl">
            <h2 className="text-lg font-bold text-gray-900">Lock-in period</h2>
            <p className="mt-2 text-sm text-gray-700">
              You cannot leave or submit during the first 30 minutes. Stay on
              this test. Lock-in ends in{" "}
              <span className="font-semibold text-gray-900">
                {formatLockRemaining(lockRemainingMs)}
              </span>
              .
            </p>
            <button
              type="button"
              onClick={() => setShowLockInDialog(false)}
              className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Continue test
            </button>
          </div>
        </div>
      )}

      {showSubmitDialog && (
        <SubmitDialog
          answeredCount={answeredCount}
          totalCount={questions.length}
          onConfirm={() => finishTest()}
          onCancel={() => setShowSubmitDialog(false)}
        />
      )}
    </div>
  );
}
