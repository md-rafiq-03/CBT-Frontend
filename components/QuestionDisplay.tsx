"use client";

import { useState } from "react";
import {
  Question,
  QuestionOption,
  QuestionAttachment,
  StudentAnswer,
} from "../lib/Interface";
import { paletteCellClass } from "@/constants/questionPalette";

interface QuestionDisplayProps {
  question: Question;
  options: QuestionOption[];
  attachments: QuestionAttachment[];
  currentAnswer?: StudentAnswer;
  onAnswerChange: (answerId: string | null, integerValue?: number) => void;
  onPrevious: () => void;
  onClear: () => void;
  onMarkForReview: () => void;
  onMarkForReviewAndNext: () => void;
  onSaveAndNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  questionPosition: string;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
  onToggleShowAnswer?: () => void;
  isReviewMode?: boolean;
  isMarkedForReview?: boolean;
}

export default function QuestionDisplay({
  question,
  options,
  attachments,
  currentAnswer,
  onAnswerChange,
  onPrevious,
  onClear,
  onMarkForReview,
  onMarkForReviewAndNext,
  onSaveAndNext,
  hasPrevious,
  hasNext,
  questionPosition,
  readOnly = false,
  showCorrectAnswer = false,
  onToggleShowAnswer,
  isReviewMode = false,
  isMarkedForReview = false,
}: QuestionDisplayProps) {
  const [zoomedSrc, setZoomedSrc] = useState<string | null>(null);
  const correctKey = question.correctAnswer?.answer || "";

  const handleIntegerChange = (value: string) => {
    if (readOnly) return;
    if (value === "") {
      onAnswerChange(null, undefined);
    } else {
      const intValue = parseInt(value);
      if (!isNaN(intValue)) {
        onAnswerChange(null, intValue);
      }
    }
  };

  const getSelectedAnswer = () => {
    if (question.type === "MCQ") {
      return currentAnswer?.selected_option_id || "";
    }
    return currentAnswer?.integer_answer?.toString() || "";
  };

  const optionClass = (optionId: string) => {
    const selected = getSelectedAnswer() === optionId;
    if (showCorrectAnswer && correctKey && optionId === correctKey) {
      return "border-green-600 bg-green-50";
    }
    if (showCorrectAnswer && selected && optionId !== correctKey) {
      return "border-red-400 bg-red-50";
    }
    if (selected) return "border-blue-600 bg-blue-50";
    return "border-gray-200 bg-white hover:border-gray-300";
  };

  const btn =
    "px-1.5 py-1.5 sm:px-2.5 rounded text-[10px] sm:text-xs font-semibold border leading-none whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation";
  const btnCompact =
    "px-2 py-1.5 rounded text-[11px] font-semibold border leading-none whitespace-nowrap transition-colors disabled:cursor-not-allowed touch-manipulation";

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="shrink-0 bg-white border-b border-gray-200 px-2.5 py-2 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
            <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
              <span className="uppercase">{question.section}</span>
              <span className="text-gray-400 font-normal"> • </span>
              Q {questionPosition}
            </p>
            {isMarkedForReview && (
              <span className="text-orange-800 bg-orange-100 px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0">
                Marked
              </span>
            )}
          </div>
          <div className="text-right shrink-0 leading-tight">
            <p className="text-[10px] uppercase tracking-wide text-gray-500">
              Marks
            </p>
            <p className="text-sm font-bold text-blue-600">{question.marks}</p>
          </div>
        </div>

        {isReviewMode && (
          <div className="mt-2">
            <button
              type="button"
              onClick={onToggleShowAnswer}
              className={`${btn} ${
                showCorrectAnswer
                  ? "bg-gray-700 text-white border-gray-700"
                  : "bg-green-600 text-white border-green-600"
              }`}
            >
              {showCorrectAnswer ? "Hide Answer" : "Show Answer"}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-2.5 py-2.5 sm:px-4 sm:py-3">
        <div className="space-y-2.5 sm:space-y-3">
          <p className="text-sm font-medium text-gray-900 leading-snug break-words">
            {question.stem}
          </p>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <button
                  key={attachment.url}
                  type="button"
                  onClick={() => setZoomedSrc(attachment.url)}
                  className="bg-gray-50 rounded overflow-hidden w-[min(100%,14rem)] sm:w-56 cursor-zoom-in text-left"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachment.url}
                    alt="Question attachment"
                    className="w-full h-auto max-h-36 object-contain"
                  />
                </button>
              ))}
            </div>
          )}

          {question.type === "MCQ" ? (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-600">
                {readOnly ? "Your selection:" : "Select the correct option:"}
              </p>
              {options.map((option) => (
                <label
                  key={option.optionId}
                  className={`block px-3 py-2 rounded border transition-all ${
                    readOnly ? "cursor-default" : "cursor-pointer"
                  } ${optionClass(option.optionId)}`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name={`question-${question.id || question.questionId}`}
                      value={option.optionId}
                      checked={getSelectedAnswer() === option.optionId}
                      onChange={(e) =>
                        !readOnly && onAnswerChange(e.target.value)
                      }
                      disabled={readOnly}
                      className="mt-0.5 w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      {option.text && (
                        <p className="text-sm text-gray-900">
                          {option.text}
                          {showCorrectAnswer &&
                            option.optionId === correctKey && (
                              <span className="ml-2 text-[11px] font-semibold text-green-700">
                                Correct
                              </span>
                            )}
                        </p>
                      )}
                      {option.image && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setZoomedSrc(option.image!);
                          }}
                          className="bg-gray-50 rounded overflow-hidden w-[min(100%,8rem)] sm:w-32 cursor-zoom-in text-left"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={option.image}
                            alt={`Option ${option.optionId}`}
                            className="w-full h-auto max-h-24 object-contain"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">
                {readOnly ? "Your answer:" : "Enter your answer:"}
              </p>
              <input
                type="text"
                value={getSelectedAnswer()}
                onChange={(e) => handleIntegerChange(e.target.value)}
                placeholder="Enter your answer"
                disabled={readOnly}
                className={`w-full max-w-xs px-3 py-2 border rounded outline-none text-sm font-semibold ${
                  showCorrectAnswer && correctKey
                    ? getSelectedAnswer() === correctKey
                      ? "border-green-600 bg-green-50"
                      : "border-red-400 bg-red-50"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                }`}
              />
              {showCorrectAnswer && correctKey && (
                <p className="mt-1.5 text-xs text-green-700 font-medium">
                  Correct answer: {correctKey}
                </p>
              )}
            </div>
          )}

          {showCorrectAnswer && question.correctAnswer?.explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs text-blue-900">
              <span className="font-semibold">Explanation: </span>
              {question.correctAnswer.explanation}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 bg-slate-50 border-t border-slate-200 px-1.5 py-1.5 sm:px-3 sm:py-2">
        {!isReviewMode ? (
          <div className="flex flex-wrap items-center gap-1 sm:flex-nowrap">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`${btnCompact} order-1 border-slate-700 bg-slate-700 text-white hover:bg-slate-800 disabled:bg-slate-500 disabled:text-white disabled:opacity-100`}
            >
              Prev
            </button>
            <button
              type="button"
              onClick={onClear}
              className={`${btnCompact} order-2 border-transparent ${paletteCellClass("visitedUnanswered")}`}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onMarkForReview}
              className={`${btn} order-4 basis-[calc(50%-0.125rem)] border-transparent sm:order-3 sm:basis-auto sm:flex-none ${paletteCellClass("marked")}`}
            >
              <span className="sm:hidden">Mark</span>
              <span className="hidden sm:inline">Mark for review</span>
            </button>
            <button
              type="button"
              onClick={onMarkForReviewAndNext}
              disabled={!hasNext}
              className={`${btn} order-5 basis-[calc(50%-0.125rem)] border-transparent sm:order-4 sm:basis-auto sm:flex-none ${paletteCellClass("answeredMarked")}`}
            >
              <span className="sm:hidden">Mark & Next</span>
              <span className="hidden sm:inline">Mark for review & Next</span>
            </button>
            <button
              type="button"
              onClick={onSaveAndNext}
              disabled={!hasNext}
              className={`${btn} order-3 ml-auto border-transparent sm:order-5 ${paletteCellClass("answered")}`}
            >
              Save & Next
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`${btnCompact} border-slate-700 bg-slate-700 text-white hover:bg-slate-800 disabled:bg-slate-500 disabled:text-white disabled:opacity-100`}
            >
              Prev
            </button>
            <button
              type="button"
              onClick={onToggleShowAnswer}
              className={`${btn} ${
                showCorrectAnswer
                  ? "bg-gray-700 text-white border-gray-700"
                  : "bg-green-600 text-white border-green-600"
              }`}
            >
              {showCorrectAnswer ? "Hide" : "Show"} Answer
            </button>
            <button
              type="button"
              onClick={onSaveAndNext}
              disabled={!hasNext}
              className={`${btn} ml-auto bg-blue-600 text-white border-blue-600`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {zoomedSrc && (
        <button
          type="button"
          aria-label="Close zoomed image"
          onClick={() => setZoomedSrc(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoomedSrc}
            alt="Zoomed"
            onClick={(e) => e.stopPropagation()}
            className="max-w-[min(90vw,36rem)] max-h-[70vh] w-auto h-auto object-contain rounded-lg shadow-xl bg-white"
          />
        </button>
      )}
    </div>
  );
}
