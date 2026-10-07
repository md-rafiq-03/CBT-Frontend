"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import TestConfirmDialog from "@/components/TestConfirmDialog";
import TestTimer from "@/components/TestTimer";
import QuestionDisplay from "@/components/QuestionDisplay";
import QuestionGrid from "@/components/QuestionGrid";
import SubmitDialog from "@/components/SubmitDialog";

type AttemptPhase = "confirm" | "in_progress" | "review";

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
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);

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

  const finishTest = useCallback(async () => {
    if (!user || !test) return;
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
        cheatFlag: false,
        score: 0, // backend recalculates
      });
      router.push(`/test/${testKey}/result`);
    } catch (err) {
      console.error("Submit failed:", err);
      setError("Failed to save submission. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [user, test, routeId, answers, startedAt, questions, router]);

  const handleTimeUp = useCallback(() => {
    finishTest();
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
      <TestConfirmDialog
        testName={test.testName || "Untitled Test"}
        duration={test.durationInMins || 0}
        totalQuestions={Number(test.totalQuestions) || questions.length || 0}
        onConfirm={() => {
          setStartedAt(Date.now());
          setPhase("in_progress");
        }}
        onCancel={() => router.push("/")}
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-900 truncate">
            {test.testName}
            {isReview && (
              <span className="ml-2 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                Review
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isReview ? (
            <>
              <button
                onClick={() => router.push(`/test/${testKey}/result`)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
              >
                View Result
              </button>
              <button
                onClick={() => router.push("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
              >
                Dashboard
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
                onClick={() => setShowSubmitDialog(true)}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
              >
                Submit
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 p-4 min-h-0">
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-[calc(100vh-7.5rem)] min-h-[28rem] flex flex-col">
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
            questionPosition={`${currentIndex + 1}/${questions.length}`}
            readOnly={isReview}
            showCorrectAnswer={isReview && showAnswers}
            onToggleShowAnswer={() => setShowAnswers((v) => !v)}
            isReviewMode={isReview}
            isMarkedForReview={markedForReview.has(currentQuestionKey)}
          />
        </div>

        <div className="min-h-[320px] lg:min-h-0">
          <QuestionGrid
            sections={sections}
            answeredQuestions={answeredQuestions}
            markedForReview={markedForReview}
            visitedQuestions={visited}
            currentQuestionId={currentQuestionKey}
            onQuestionSelect={goToQuestionId}
            questionIds={questionIdsBySection}
          />
        </div>
      </div>

      {showSubmitDialog && (
        <SubmitDialog
          answeredCount={answeredCount}
          totalCount={questions.length}
          onConfirm={finishTest}
          onCancel={() => setShowSubmitDialog(false)}
        />
      )}
    </div>
  );
}
