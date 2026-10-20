import { AlertCircle } from "lucide-react";

interface SubmitDialogProps {
  answeredCount: number;
  totalCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SubmitDialog({
  answeredCount,
  totalCount,
  onConfirm,
  onCancel,
}: SubmitDialogProps) {
  const unansweredCount = totalCount - answeredCount;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl max-w-md w-full max-h-[90dvh] overflow-y-auto animate-scale-in">
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-linear-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 sm:p-3 rounded-full shrink-0">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Submit Test?
            </h2>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {answeredCount}
              </p>
              <p className="text-xs text-gray-600 mt-1">Answered</p>
            </div>
            <div
              className={`rounded-lg p-3 sm:p-4 text-center border ${
                unansweredCount > 0
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <p
                className={`text-xl sm:text-2xl font-bold ${
                  unansweredCount > 0 ? "text-yellow-600" : "text-gray-600"
                }`}
              >
                {unansweredCount}
              </p>
              <p className="text-xs text-gray-600 mt-1">Unanswered</p>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-yellow-800">
                <span className="font-semibold">Warning:</span> You have{" "}
                {unansweredCount} unanswered question
                {unansweredCount > 1 ? "s" : ""}. You can still go back and
                answer them.
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-800">
              Once submitted, your test cannot be edited. Your answers will be
              evaluated and results will be shown on the dashboard.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 px-4 rounded-lg transition-all text-sm"
          >
            Continue Test
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all text-sm"
          >
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
}
