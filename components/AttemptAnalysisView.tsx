"use client";

import { AttemptAnalysis, Section, SectionAnalysis } from "@/lib/Interface";

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
  const sections = analysis.sections ?? [];
  const attempted = analysis.correctCount + analysis.wrongCount;
  const scoreWidth = clampPercent(analysis.score, analysis.maxMarks);
  const averageWidth =
    analysis.averageScore == null
      ? null
      : clampPercent(analysis.averageScore, analysis.maxMarks);

  return (
    <div className="space-y-4 font-sans antialiased">
      <header>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
          {title || analysis.testName || "Result"}
        </h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Time taken {formatDuration(analysis.timeTakenMs || 0)}
          <span className="px-1.5 text-gray-300">·</span>
          {analysis.totalQuestions} questions
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div className="border-b border-gray-100 p-4 lg:border-b-0 lg:border-r">
            <p className="text-xs font-medium text-gray-500">Your score</p>
            <p className="mt-1 flex items-end gap-1.5">
              <span className="text-4xl font-semibold tracking-tight text-gray-900 tabular-nums">
                {formatMark(analysis.score)}
              </span>
              <span className="mb-1 text-base text-gray-500 tabular-nums">
                / {formatMark(analysis.maxMarks)}
              </span>
            </p>
            <div className="relative mt-3 h-1.5 rounded-full bg-gray-100">
              <div
                className="h-1.5 rounded-full bg-blue-600"
                style={{ width: `${scoreWidth}%` }}
              />
              {averageWidth != null && (
                <span
                  className="absolute top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-900"
                  style={{ left: `${averageWidth}%` }}
                  title="Batch average"
                />
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600">
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
        <div className="border-b border-gray-100 px-4 py-2.5">
          <h3 className="text-sm font-semibold text-gray-900">Subject-wise</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2 font-medium">Subject</th>
                <th className="px-3 py-2 font-medium">Score</th>
                <th className="px-3 py-2 font-medium">Accuracy</th>
                <th className="px-3 py-2 font-medium">Correct</th>
                <th className="px-3 py-2 font-medium">Incorrect</th>
                <th className="px-4 py-2 font-medium">Unattempted</th>
              </tr>
            </thead>
            <tbody>
              {sections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                    No subject breakdown for this attempt.
                  </td>
                </tr>
              ) : (
                sections.map((section) => (
                  <tr key={section.section} className="border-t border-gray-100">
                    <td className="px-4 py-2.5 font-medium text-gray-900">
                      {subjectLabel(section.section)}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-gray-800">
                      {formatMark(section.marksObtained)}
                      <span className="text-gray-400"> / {formatMark(section.maxMarks)}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
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
                    <td className="px-3 py-2.5 tabular-nums text-emerald-700">
                      {section.correctCount}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-red-700">
                      {section.wrongCount}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-amber-700">
                      {section.unansweredCount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {sections.length > 0 && (
        <div className="space-y-3">
          {sections.map((section) => (
            <SubjectScore key={section.section} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectScore({ section }: { section: SectionAnalysis }) {
  const attempted = section.correctCount + section.wrongCount;
  const scoreWidth = clampPercent(section.marksObtained, section.maxMarks);

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div className="border-b border-gray-100 p-4 lg:border-b-0 lg:border-r">
          <p className="text-xs font-medium text-gray-500">{subjectLabel(section.section)}</p>
          <p className="mt-1 flex items-end gap-1.5">
            <span className="text-3xl font-semibold tracking-tight text-gray-900 tabular-nums">
              {formatMark(section.marksObtained)}
            </span>
            <span className="mb-0.5 text-sm text-gray-500 tabular-nums">
              / {formatMark(section.maxMarks)}
            </span>
          </p>
          <div className="relative mt-3 h-1.5 rounded-full bg-gray-100">
            <div
              className="h-1.5 rounded-full bg-blue-600"
              style={{ width: `${scoreWidth}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {section.totalQuestions} questions in {subjectLabel(section.section)}
          </p>
        </div>

        <div className="grid grid-cols-2">
          <Metric
            label="Rank"
            value={section.rank != null ? `#${section.rank}` : "—"}
          />
          <Metric label="Percentile" value={formatPercent(section.percentile)} />
          <Metric
            label="Accuracy"
            value={formatPercent(section.accuracy)}
            hint="Correct out of attempted"
          />
          <Metric
            label="Attempted"
            value={`${attempted} / ${section.totalQuestions}`}
            hint={`${section.unansweredCount} unattempted`}
          />
        </div>
      </div>

      <AttemptMix
        total={section.totalQuestions}
        correct={section.correctCount}
        wrong={section.wrongCount}
        unanswered={section.unansweredCount}
      />
    </section>
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
    <div className="border-b border-r border-gray-100 px-4 py-3 last:border-r-0 [&:nth-child(2)]:border-r-0 [&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-0.5 text-xl font-semibold tracking-tight text-gray-900 tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-gray-500">{hint}</p>}
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
    <div className="border-t border-gray-100 px-4 py-2.5">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div className="bg-emerald-500" style={{ width: `${(correct / safeTotal) * 100}%` }} />
        <div className="bg-red-500" style={{ width: `${(wrong / safeTotal) * 100}%` }} />
        <div className="bg-amber-400" style={{ width: `${(unanswered / safeTotal) * 100}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
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
