"use client";

import { useMemo, useState } from "react";
import { AttemptAnalysis, QuestionAnalysis, Section } from "@/lib/Interface";

type Outcome = "all" | "correct" | "wrong" | "skipped";

function formatDuration(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatMark(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  const rounded = Math.round(value * 100) / 100;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  return `${text}%`;
}

function subjectLabel(section: Section | string | null | undefined) {
  if (!section) return "General";
  const text = String(section);
  return text.charAt(0) + text.slice(1).toLowerCase();
}

function clampPercent(part: number, whole: number) {
  if (whole <= 0) return 0;
  return Math.min(100, Math.max(0, (part / whole) * 100));
}

export default function AttemptAnalysisView({
  analysis,
  title,
}: {
  analysis: AttemptAnalysis;
  title?: string;
}) {
  const [sectionFilter, setSectionFilter] = useState("all");
  const [outcome, setOutcome] = useState<Outcome>("all");

  const sections = analysis.sections ?? [];
  const questions = analysis.questions ?? [];
  const attempted = analysis.correctCount + analysis.wrongCount;
  const scoreWidth = clampPercent(analysis.score, analysis.maxMarks);
  const averageWidth =
    analysis.averageScore == null
      ? null
      : clampPercent(analysis.averageScore, analysis.maxMarks);

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      if (sectionFilter !== "all" && question.section !== sectionFilter) return false;
      if (outcome === "correct") return question.answered && question.correct === true;
      if (outcome === "wrong") return question.answered && question.correct === false;
      if (outcome === "skipped") return !question.answered;
      return true;
    });
  }, [questions, sectionFilter, outcome]);

  const sectionNames = Array.from(
    new Set(questions.map((question) => question.section).filter(Boolean))
  );

  return (
    <div className="space-y-6 font-sans antialiased">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          {title || analysis.testName || "Result"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Time taken {formatDuration(analysis.timeTakenMs || 0)}
          <span className="px-1.5 text-gray-300">·</span>
          {analysis.totalQuestions} questions
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div className="border-b border-gray-100 p-6 lg:border-b-0 lg:border-r">
            <p className="text-sm font-medium text-gray-500">Your score</p>
            <p className="mt-2 flex items-end gap-2">
              <span className="text-5xl font-semibold tracking-tight text-gray-900 tabular-nums">
                {formatMark(analysis.score)}
              </span>
              <span className="mb-1.5 text-lg text-gray-500 tabular-nums">
                / {formatMark(analysis.maxMarks)}
              </span>
            </p>
            <div className="relative mt-5 h-2 rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${scoreWidth}%` }}
              />
              {averageWidth != null && (
                <span
                  className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-900"
                  style={{ left: `${averageWidth}%` }}
                  title="Batch average"
                />
              )}
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Batch average{" "}
              <span className="font-semibold text-gray-900 tabular-nums">
                {formatMark(analysis.averageScore)}
              </span>
              <span className="text-gray-400"> / {formatMark(analysis.maxMarks)}</span>
              <span className="mt-1 block text-xs text-gray-500">
                The mark on the bar is the batch average.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2">
            <Metric
              label="Rank"
              value={analysis.rank != null ? `#${analysis.rank}` : "—"}
            />
            <Metric label="Percentile" value={formatPercent(analysis.percentile)} />
            <Metric
              label="Accuracy"
              value={formatPercent(analysis.accuracy)}
              hint="Correct out of attempted"
            />
            <Metric
              label="Attempted"
              value={`${attempted} / ${analysis.totalQuestions}`}
              hint={`${analysis.unansweredCount} unattempted`}
            />
          </div>
        </div>

        <AttemptMix
          total={analysis.totalQuestions}
          correct={analysis.correctCount}
          wrong={analysis.wrongCount}
          unanswered={analysis.unansweredCount}
        />
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">Subject-wise</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Accuracy</th>
                <th className="px-4 py-3 font-medium">Correct</th>
                <th className="px-4 py-3 font-medium">Incorrect</th>
                <th className="px-6 py-3 font-medium">Unattempted</th>
              </tr>
            </thead>
            <tbody>
              {sections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No subject breakdown for this attempt.
                  </td>
                </tr>
              ) : (
                sections.map((section) => (
                  <tr key={section.section} className="border-t border-gray-100">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {subjectLabel(section.section)}
                    </td>
                    <td className="px-4 py-4 tabular-nums text-gray-800">
                      {formatMark(section.marksObtained)}
                      <span className="text-gray-400"> / {formatMark(section.maxMarks)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-16 rounded-full bg-gray-100">
                          <div
                            className="h-1.5 rounded-full bg-blue-600"
                            style={{ width: `${clampPercent(section.accuracy ?? 0, 100)}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-gray-800">
                          {formatPercent(section.accuracy)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 tabular-nums text-emerald-700">
                      {section.correctCount}
                    </td>
                    <td className="px-4 py-4 tabular-nums text-red-700">
                      {section.wrongCount}
                    </td>
                    <td className="px-6 py-4 tabular-nums text-amber-700">
                      {section.unansweredCount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold text-gray-900">Question-wise</h3>
          <p className="text-sm text-gray-500">
            {filteredQuestions.length} of {questions.length}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 px-6 py-4">
          <FilterChip
            active={sectionFilter === "all"}
            onClick={() => setSectionFilter("all")}
            label="All subjects"
          />
          {sectionNames.map((name) => (
            <FilterChip
              key={name}
              active={sectionFilter === name}
              onClick={() => setSectionFilter(name)}
              label={subjectLabel(name)}
            />
          ))}
          <span className="mx-1 hidden h-8 w-px bg-gray-200 sm:block" />
          <FilterChip active={outcome === "all"} onClick={() => setOutcome("all")} label="Any result" />
          <FilterChip
            active={outcome === "correct"}
            onClick={() => setOutcome("correct")}
            label="Correct"
          />
          <FilterChip
            active={outcome === "wrong"}
            onClick={() => setOutcome("wrong")}
            label="Incorrect"
          />
          <FilterChip
            active={outcome === "skipped"}
            onClick={() => setOutcome("skipped")}
            label="Unattempted"
          />
        </div>
        <div className="overflow-x-auto border-t border-gray-100">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Question</th>
                <th className="px-4 py-3 font-medium">Your answer</th>
                <th className="px-4 py-3 font-medium">Correct</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-6 py-3 font-medium">Marks</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No questions match this filter.
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((question) => (
                  <QuestionRow
                    key={question.questionId}
                    index={questions.findIndex((item) => item.questionId === question.questionId) + 1}
                    question={question}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border-b border-r border-gray-100 p-5 last:border-r-0 [&:nth-child(2)]:border-r-0 [&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function AttemptMix({
  total,
  correct,
  wrong,
  unanswered,
}: {
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
}) {
  const safeTotal = Math.max(total, 1);
  return (
    <div className="border-t border-gray-100 px-6 py-4">
      <div className="flex h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="bg-emerald-500" style={{ width: `${(correct / safeTotal) * 100}%` }} />
        <div className="bg-red-500" style={{ width: `${(wrong / safeTotal) * 100}%` }} />
        <div className="bg-amber-400" style={{ width: `${(unanswered / safeTotal) * 100}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Legend swatch="bg-emerald-500" label="Correct" value={correct} />
        <Legend swatch="bg-red-500" label="Incorrect" value={wrong} />
        <Legend swatch="bg-amber-400" label="Unattempted" value={unanswered} />
      </div>
    </div>
  );
}

function Legend({
  swatch,
  label,
  value,
}: {
  swatch: string;
  label: string;
  value: number;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-gray-600">
      <span className={`h-2 w-2 rounded-full ${swatch}`} />
      {label}
      <span className="font-semibold text-gray-900 tabular-nums">{value}</span>
    </span>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

function QuestionRow({
  index,
  question,
}: {
  index: number;
  question: QuestionAnalysis;
}) {
  return (
    <tr className="border-t border-gray-100 align-top">
      <td className="px-6 py-3.5 tabular-nums text-gray-500">{index}</td>
      <td className="px-4 py-3.5 text-gray-700">{subjectLabel(question.section)}</td>
      <td className="max-w-xs px-4 py-3.5 text-gray-900">
        <p className="line-clamp-2">{question.stem}</p>
      </td>
      <td className="px-4 py-3.5 font-mono text-xs text-gray-800">
        {question.submittedValue || "—"}
      </td>
      <td className="px-4 py-3.5 font-mono text-xs text-gray-800">
        {question.correctAnswer || "—"}
      </td>
      <td className="px-4 py-3.5">
        <Status answered={question.answered} correct={question.correct} />
      </td>
      <td className="px-6 py-3.5 tabular-nums text-gray-800">
        {formatMark(question.marksAwarded)}
        <span className="text-gray-400"> / {formatMark(question.maxMarks)}</span>
      </td>
    </tr>
  );
}

function Status({
  answered,
  correct,
}: {
  answered: boolean;
  correct: boolean | null;
}) {
  if (!answered) {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
        Unattempted
      </span>
    );
  }
  if (correct) {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
        Correct
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200">
      Incorrect
    </span>
  );
}
