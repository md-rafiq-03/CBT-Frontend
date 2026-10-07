import {
  Question,
  QuestionOption,
  QuestionAttachment,
  StudentAnswer,
} from "../lib/Interface";

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
    "px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="shrink-0 bg-white border-b border-gray-200 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              {question.section} • Question {questionPosition}
              {isMarkedForReview && (
                <span className="ml-2 text-orange-700 bg-orange-100 px-2 py-0.5 rounded text-xs font-semibold">
                  Marked for review
                </span>
              )}
            </p>
            <h2 className="text-xl font-bold text-gray-900">Question</h2>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500">Marks</p>
            <p className="text-xl font-bold text-blue-600">{question.marks}</p>
          </div>
        </div>

        {/* Review: Show Answer always visible under question header */}
        {isReviewMode && (
          <div className="mt-3">
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

      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-6">
          <p className="text-lg font-semibold text-gray-900 leading-relaxed">
            {question.stem}
          </p>

          {attachments.length > 0 && (
            <div className="space-y-4">
              {attachments.map((attachment) => (
                <div
                  key={attachment.url}
                  className="bg-gray-50 rounded-lg overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachment.url}
                    alt="Question attachment"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              ))}
            </div>
          )}

          {question.type === "MCQ" ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">
                {readOnly ? "Your selection:" : "Select the correct option:"}
              </p>
              {options.map((option) => (
                <label
                  key={option.optionId}
                  className={`block p-4 rounded-lg border-2 transition-all ${
                    readOnly ? "cursor-default" : "cursor-pointer"
                  } ${optionClass(option.optionId)}`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name={`question-${question.id || question.questionId}`}
                      value={option.optionId}
                      checked={getSelectedAnswer() === option.optionId}
                      onChange={(e) =>
                        !readOnly && onAnswerChange(e.target.value)
                      }
                      disabled={readOnly}
                      className="mt-1 w-5 h-5 text-blue-600"
                    />
                    <div className="flex-1">
                      {option.text && (
                        <p className="text-gray-900 font-medium">
                          {option.text}
                          {showCorrectAnswer &&
                            option.optionId === correctKey && (
                              <span className="ml-2 text-xs font-semibold text-green-700">
                                Correct
                              </span>
                            )}
                        </p>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-4">
                {readOnly ? "Your answer:" : "Enter your answer:"}
              </p>
              <input
                type="text"
                value={getSelectedAnswer()}
                onChange={(e) => handleIntegerChange(e.target.value)}
                placeholder="Enter your answer"
                disabled={readOnly}
                className={`w-full px-4 py-3 border-2 rounded-lg outline-none text-lg font-semibold ${
                  showCorrectAnswer && correctKey
                    ? getSelectedAnswer() === correctKey
                      ? "border-green-600 bg-green-50"
                      : "border-red-400 bg-red-50"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                }`}
              />
              {showCorrectAnswer && correctKey && (
                <p className="mt-2 text-sm text-green-700 font-medium">
                  Correct answer: {correctKey}
                </p>
              )}
            </div>
          )}

          {showCorrectAnswer && question.correctAnswer?.explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <span className="font-semibold">Explanation: </span>
              {question.correctAnswer.explanation}
            </div>
          )}
        </div>
      </div>

      {/* Always-visible action bar pinned under the question */}
      <div className="shrink-0 bg-slate-50 border-t-2 border-slate-200 p-3 sm:p-4">
        {!isReviewMode ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`${btn} bg-white text-gray-800 border-gray-300 hover:bg-gray-100`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={onClear}
              className={`${btn} bg-white text-gray-800 border-gray-300 hover:bg-gray-100`}
            >
              Clear selection
            </button>
            <button
              type="button"
              onClick={onMarkForReview}
              className={`${btn} bg-orange-100 text-orange-900 border-orange-300 hover:bg-orange-200`}
            >
              Mark for review
            </button>
            <button
              type="button"
              onClick={onMarkForReviewAndNext}
              disabled={!hasNext}
              className={`${btn} bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200`}
            >
              Mark for review & Next
            </button>
            <button
              type="button"
              onClick={onSaveAndNext}
              disabled={!hasNext}
              className={`${btn} bg-blue-600 text-white border-blue-600 hover:bg-blue-700`}
            >
              Save & Next
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 items-center">
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
            <button
              type="button"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`${btn} bg-white text-gray-800 border-gray-300`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={onSaveAndNext}
              disabled={!hasNext}
              className={`${btn} bg-blue-600 text-white border-blue-600`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
