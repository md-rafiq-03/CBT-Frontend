import { AlertCircle } from "lucide-react";

interface TestConfirmDialogProps {
  testName: string;
  duration: number;
  totalQuestions: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TestConfirmDialog({
  testName,
  duration,
  totalQuestions,
  onConfirm,
  onCancel,
}: TestConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Start Test?</h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Test Name</p>
            <p className="text-lg font-semibold text-gray-900">{testName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Duration</p>
              <p className="text-2xl font-bold text-blue-600">{duration}m</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Questions</p>
              <p className="text-2xl font-bold text-green-600">
                {totalQuestions}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Important:</span> Once you start
              the test, the timer will begin automatically. You can review and
              change your answers before final submission.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-lg shadow-blue-500/30"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
}
