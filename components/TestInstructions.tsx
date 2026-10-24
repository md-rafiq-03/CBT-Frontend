"use client";

import { useState, type ReactNode } from "react";
import {
  PALETTE_STATUS_LEGEND,
  paletteCellClass,
} from "@/constants/questionPalette";

interface TestInstructionsProps {
  testName: string;
  durationMinutes: number;
  totalQuestions: number;
  sections: string[];
  onProceed: () => void;
  onBack: () => void;
}

export default function TestInstructions({
  testName,
  durationMinutes,
  totalQuestions,
  sections,
  onProceed,
  onBack,
}: TestInstructionsProps) {
  const [accepted, setAccepted] = useState(false);
  const sectionCount = Math.max(sections.length, 1);
  const sectionLabel =
    sections.length > 0 ? sections.join(", ") : "General";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Before you begin
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              General Instructions
            </h1>
          </div>
          <div className="text-sm sm:text-right">
            <p className="font-semibold text-gray-900">{testName}</p>
            <p className="text-gray-500">
              {durationMinutes} min · {totalQuestions} questions
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-28">
        <article className="bg-white rounded-xl border border-gray-100 shadow-md">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              Please read the instructions carefully
            </h2>
          </div>

          <div className="px-6 py-6 space-y-8 text-sm text-gray-700 leading-relaxed">
            <InstructionSection title="General instructions">
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  Total duration of <strong>{testName}</strong> is{" "}
                  <strong>{durationMinutes} minutes</strong>.
                </li>
                <li>
                  The countdown in the top right of the test screen shows the
                  time you have left. When it reaches zero, the test ends and
                  your answers are submitted. You do not need to submit it
                  yourself.
                </li>
                <li>
                  The question palette on the right shows the status of each
                  question:
                  <ul className="mt-3 space-y-2">
                    {PALETTE_STATUS_LEGEND.map((status, index) => (
                      <li key={status.key} className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${paletteCellClass(
                            status.key,
                            false
                          )}`}
                        >
                          {index + 1}
                        </span>
                        <span>{status.label}</span>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  The question you are currently viewing is highlighted in blue
                  in the palette.
                </li>
              </ol>
            </InstructionSection>

            <InstructionSection title="Navigating to a question">
              <p className="mb-2">To move through the paper:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Click a number in the question palette to open that question.
                  Your current answer is already saved when you select it.
                </li>
                <li>
                  Click <Action>Save &amp; Next</Action> to move to the next
                  question.
                </li>
                <li>
                  Click <Action>Mark for review &amp; Next</Action> to flag the
                  current question and move on.
                </li>
                <li>
                  Click <Action>Mark for review</Action> to flag the current
                  question and stay on it.
                </li>
                <li>
                  Click <Action>Previous</Action> to go back one question.
                </li>
              </ol>
            </InstructionSection>

            <InstructionSection title="Answering a question">
              <p className="font-medium text-gray-900 mb-2">Multiple choice</p>
              <ol className="list-decimal pl-5 space-y-2 mb-4">
                <li>Click an option to select it.</li>
                <li>
                  Click another option to change your answer, or click{" "}
                  <Action>Clear selection</Action> to remove it.
                </li>
              </ol>
              <p className="font-medium text-gray-900 mb-2">Numeric answer</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Type your answer in the answer box.</li>
                <li>
                  Clear the box, or click <Action>Clear selection</Action>, to
                  remove it.
                </li>
                <li>
                  Submit stays locked for the first 30 minutes. After that,
                  click <Action>Submit</Action> in the header. You can still
                  change answers until you confirm submission, or until time
                  runs out.
                </li>
              </ol>
            </InstructionSection>

            <InstructionSection title="During the test">
              <ol className="list-decimal pl-5 space-y-2">
                <li>Copy, cut, paste, and right-click are disabled.</li>
                <li>
                  Screenshots are not allowed. Switching to another tab is
                  counted. When you come back, a message shows how many
                  switches you have used. On the third switch the test is
                  submitted automatically and the attempt is flagged.
                </li>
                <li>
                  You cannot leave this page without submitting. The browser
                  back button opens the submit confirmation after the 30-minute
                  lock-in. Before that, you must stay on the test.
                </li>
                <li>
                  Do not reload this page. A reload does not start the test
                  again. Your answers and remaining time stay as they were, and
                  the attempt is flagged.
                </li>
              </ol>
            </InstructionSection>

            <InstructionSection title="Sections">
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  This paper has {sectionCount} section
                  {sectionCount === 1 ? "" : "s"}:{" "}
                  <strong>{sectionLabel}</strong>.
                </li>
                <li>
                  The question palette shows questions for the{" "}
                  <strong>current section only</strong>. Use the section
                  dropdown above the question list to switch sections. You can
                  still jump to any question in the current section until the
                  timer ends.
                </li>
              </ol>
            </InstructionSection>
          </div>

          <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <label className="flex items-start gap-3 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                I have read and understood the instructions. I will attempt
                this test myself. I agree that the timer starts when I proceed,
                and that the test ends when I submit or when time runs out.
              </span>
            </label>
          </div>
        </article>
      </main>

      <footer className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          {!accepted && (
            <p className="text-sm text-gray-500">
              Accept the declaration to proceed.
            </p>
          )}
          <div className="ml-auto flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onProceed}
              disabled={!accepted}
              className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
            >
              Proceed
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function InstructionSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="font-semibold text-gray-900 underline underline-offset-4 mb-3">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Action({ children }: { children: ReactNode }) {
  return <strong className="text-gray-900">{children}</strong>;
}
