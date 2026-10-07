"use client";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Award, CheckCircle2 } from "lucide-react";
import { Test, TestAttempt } from "../lib/Interface";

interface TestCardProps {
  test: Test;
  attempt?: TestAttempt;
}

export default function TestCard({ test, attempt }: TestCardProps) {
  const router = useRouter();

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

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {test.testName}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {test.description}
            </p>
          </div>
          {attempt && (
            <div className="ml-4 bg-green-100 p-2 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-gray-600 text-sm">
            <Calendar className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Posted</p>
              <p className="font-medium">{formatDate(new Date(Number(test.startAt)))}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 text-sm">
            <Clock className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="font-medium">{test.durationInMins} mins</p>
            </div>
          </div>
        </div>

        {attempt && (
          <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Your Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {attempt.score}/{test.maxMarks}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Attempted On</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(new Date(Number(test.expireAt)))}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isActive()
                  ? "bg-green-100 text-green-700"
                  : isPrevious()
                  ? "bg-gray-100 text-gray-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {isActive() ? "Active" : isPrevious() ? "Expired" : "Upcoming"}
            </span>
            <span className="text-sm text-gray-500">
              Max: {test.maxMarks} marks
            </span>
          </div>
          {!attempt && isActive() && (
            <button
              onClick={() => router.push(`/test/${test.testId || test.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-blue-500/30"
            >
              Attempt Test
            </button>
          )}
          {attempt && (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  router.push(`/test/${test.testId || test.id}/result`)
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                Result
              </button>
              <button
                onClick={() =>
                  router.push(`/test/${test.testId || test.id}?mode=review`)
                }
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
