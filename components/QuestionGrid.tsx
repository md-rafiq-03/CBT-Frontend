import { CheckCircle2, Circle, Flag } from "lucide-react";

interface QuestionGridProps {
  sections: string[];
  answeredQuestions: Set<string>;
  markedForReview: Set<string>;
  visitedQuestions?: Set<string>;
  currentQuestionId: string;
  onQuestionSelect: (questionId: string) => void;
  questionIds: { [key: string]: string[] };
}

export default function QuestionGrid({
  sections,
  answeredQuestions,
  markedForReview,
  visitedQuestions,
  currentQuestionId,
  onQuestionSelect,
  questionIds,
}: QuestionGridProps) {
  const totalQuestions = sections.reduce(
    (sum, section) => sum + (questionIds[section]?.length || 0),
    0
  );

  const cellClass = (qId: string, isCurrent: boolean) => {
    const answered = answeredQuestions.has(qId);
    const marked = markedForReview.has(qId);
    if (isCurrent) {
      return "ring-2 ring-offset-2 ring-blue-600 bg-blue-600 text-white shadow-lg";
    }
    if (answered && marked) {
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    }
    if (marked) {
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    }
    if (answered) {
      return "bg-green-100 text-green-700 hover:bg-green-200";
    }
    if (visitedQuestions?.has(qId)) {
      return "bg-red-50 text-red-700 hover:bg-red-100";
    }
    return "bg-gray-100 text-gray-600 hover:bg-gray-200";
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col overflow-hidden">
      <div className="bg-linear-to-r from-blue-600 to-blue-500 text-white p-4">
        <h3 className="font-bold text-lg">Questions Overview</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sections.map((section) => {
          const sectionQuestionIds = questionIds[section] || [];
          return (
            <div key={section}>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">
                {section}
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {sectionQuestionIds.map((qId, index) => {
                  const qNum = index + 1;
                  const isCurrent = currentQuestionId === qId;
                  return (
                    <button
                      key={`${section}-${qId || qNum}`}
                      onClick={() => onQuestionSelect(qId)}
                      className={`aspect-square rounded-lg font-semibold text-sm transition-all transform hover:scale-105 flex items-center justify-center relative ${cellClass(
                        qId,
                        isCurrent
                      )}`}
                      title={`Q${qNum}`}
                    >
                      <span className="z-10">{qNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-200 p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Circle className="w-3.5 h-3.5 fill-gray-300 text-gray-300" />
          <span>Not visited</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <Flag className="w-3.5 h-3.5 text-orange-600" />
          <span>Marked for review</span>
        </div>
        <div className="flex items-center gap-2">
          <Flag className="w-3.5 h-3.5 text-purple-600" />
          <span>Answered + marked</span>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-2">
          <p className="text-xs font-semibold text-blue-900">
            Answered: {answeredQuestions.size} / {totalQuestions}
          </p>
        </div>
      </div>
    </div>
  );
}
