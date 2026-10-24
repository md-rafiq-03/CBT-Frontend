"use client";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Award } from "lucide-react";
import { Test, TestAttempt } from "../lib/Interface";

interface TestCardProps {
  test: Test;
  attempt?: TestAttempt;
}

export default function TestCard({ test, attempt }: TestCardProps) {
  const router = useRouter();
  const testKey = test.testId || test.id;

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isActive = () => {
    const now = new Date();
    const start = new Date(Number(test.startAt));
    const end = new Date(Number(test.expireAt));
    return now >= start && now <= end && test.active;
  };

  const isPrevious = () => {
    const now = new Date();
    const end = new Date(Number(test.expireAt));
    return now > end;
  };

  const canAttempt = !attempt && isActive();
  const status = isActive() ? "Active" : isPrevious() ? "Expired" : "Upcoming";
  const statusClass = isActive()
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : isPrevious()
      ? "bg-gray-100 text-gray-600 ring-gray-200"
      : "bg-amber-50 text-amber-700 ring-amber-200";

  return (
    <article className="rounded-xl border border-gray-200 bg-white px-4 py-5 font-sans antialiased shadow-sm transition hover:border-blue-200 hover:shadow-md sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
              {test.testName}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${statusClass}`}
            >
              {status}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-base text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-5 w-5 shrink-0 text-gray-400" />
              <span className="text-gray-500">Posted</span>
              <span className="font-medium text-gray-800">
                {formatDate(new Date(Number(test.startAt)))}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-5 w-5 shrink-0 text-gray-400" />
              <span className="text-gray-500">Duration</span>
              <span className="font-medium text-gray-800">
                {test.durationInMins} mins
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Award className="h-5 w-5 shrink-0 text-gray-400" />
              <span className="text-gray-500">Max</span>
              <span className="font-medium text-gray-800">
                {test.maxMarks} marks
              </span>
            </span>
          </div>

          {attempt && (
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-base">
              <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5">
                <span className="text-gray-500">Your Score</span>
                <span className="text-lg font-bold text-blue-700">
                  {attempt.score}/{test.maxMarks}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-gray-600">
                <span className="text-gray-500">Attempted On</span>
                <span className="font-medium text-gray-800">
                  {formatDate(new Date(attempt.attempted_date))}
                </span>
              </span>
            </div>
          )}
        </div>

        {(canAttempt || attempt) && (
          <div className="flex shrink-0 gap-2">
            {canAttempt && (
              <button
                onClick={() => router.push(`/test/${testKey}`)}
                className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-base font-semibold text-white hover:bg-blue-700 lg:w-auto"
              >
                Attempt Test
              </button>
            )}
            {attempt && (
              <>
                <button
                  onClick={() => router.push(`/test/${testKey}/result`)}
                  className="flex-1 rounded-lg border border-blue-500 bg-white px-4 py-2.5 text-base font-semibold text-blue-600 hover:bg-blue-50 lg:flex-none lg:min-w-32"
                >
                  Result
                </button>
                <button
                  onClick={() => router.push(`/test/${testKey}?mode=review`)}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base font-semibold text-gray-700 hover:bg-gray-50 lg:flex-none lg:min-w-32"
                >
                  Review
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
