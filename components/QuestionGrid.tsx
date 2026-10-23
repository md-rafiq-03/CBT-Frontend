import {
  PALETTE_STATUS_LEGEND,
  paletteCellClass,
  type PaletteStatusKey,
} from "@/constants/questionPalette";

interface QuestionGridProps {
  sections: string[];
  answeredQuestions: Set<string>;
  markedForReview: Set<string>;
  visitedQuestions?: Set<string>;
  currentQuestionId: string;
  onQuestionSelect: (questionId: string) => void;
  questionIds: { [key: string]: string[] };
  /** When set, only this section's questions are shown in the palette. */
  activeSection?: string;
}

function statusForQuestion(
  qId: string,
  answeredQuestions: Set<string>,
  markedForReview: Set<string>,
  visitedQuestions?: Set<string>
): PaletteStatusKey {
  const answered = answeredQuestions.has(qId);
  const marked = markedForReview.has(qId);
  if (answered && marked) return "answeredMarked";
  if (marked) return "marked";
  if (answered) return "answered";
  if (visitedQuestions?.has(qId)) return "visitedUnanswered";
  return "notVisited";
}

export default function QuestionGrid({
  sections,
  answeredQuestions,
  markedForReview,
  visitedQuestions,
  currentQuestionId,
  onQuestionSelect,
  questionIds,
  activeSection,
}: QuestionGridProps) {
  const visibleSections = activeSection
    ? sections.filter((s) => s === activeSection)
    : sections;

  const totalInView = visibleSections.reduce(
    (sum, section) => sum + (questionIds[section]?.length || 0),
    0
  );

  const answeredInView = visibleSections.reduce((sum, section) => {
    const ids = questionIds[section] || [];
    return sum + ids.filter((id) => answeredQuestions.has(id)).length;
  }, 0);

  const cellClass = (qId: string, isCurrent: boolean) => {
    if (isCurrent) {
      return "ring-2 ring-offset-1 ring-blue-600 bg-blue-600 text-white";
    }
    return paletteCellClass(
      statusForQuestion(qId, answeredQuestions, markedForReview, visitedQuestions)
    );
  };

  return (
    <div className="bg-white border border-gray-200 flex flex-col overflow-hidden h-full lg:rounded">
      {activeSection && (
        <div className="bg-blue-600 text-white px-3 py-1.5 flex items-center justify-between gap-2">
          <h3 className="font-semibold text-xs sm:text-sm truncate">
            {activeSection}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-blue-100 shrink-0">
            {answeredInView}/{totalInView} answered
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 sm:p-2.5">
        {visibleSections.map((section) => {
          const sectionQuestionIds = questionIds[section] || [];
          return (
            <div key={section}>
              {!activeSection && (
                <h4 className="font-semibold text-gray-800 mb-1.5 text-xs uppercase tracking-wide">
                  {section}
                </h4>
              )}
              <div className="grid grid-cols-6 sm:grid-cols-6 lg:grid-cols-5 gap-1 sm:gap-1.5">
                {sectionQuestionIds.map((qId, index) => {
                  const qNum = index + 1;
                  const isCurrent = currentQuestionId === qId;
                  return (
                    <button
                      key={`${section}-${qId || qNum}`}
                      type="button"
                      onClick={() => onQuestionSelect(qId)}
                      className={`aspect-square min-h-[2rem] rounded font-semibold text-[11px] sm:text-xs flex items-center justify-center touch-manipulation ${cellClass(
                        qId,
                        isCurrent
                      )}`}
                      title={`Q${qNum}`}
                    >
                      {qNum}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-200 px-2 py-1.5 sm:px-2.5 sm:py-2">
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-2 gap-y-1 text-[10px] sm:text-[11px]">
          {PALETTE_STATUS_LEGEND.map((status) => (
            <div key={status.key} className="flex items-center gap-1.5 min-w-0">
              <span
                className={`inline-block h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-sm shrink-0 ${paletteCellClass(
                  status.key,
                  false
                )}`}
              />
              <span className="text-gray-600 leading-tight truncate">
                {status.shortLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
