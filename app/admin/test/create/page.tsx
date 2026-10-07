"use client";

import { FormEvent, useMemo, useState } from "react";
import { createTest } from "@/lib/testApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreateTestPayload,
  NegativeMarking,
  TestSection,
} from "@/lib/Interface";
import { ArrowLeft } from "lucide-react";

const SECTION_OPTIONS = ["PHYSICS", "CHEMISTRY", "MATHS", "BIOLOGY"] as const;
const inputClass =
  "w-full px-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const emptySection = (): TestSection => ({
  name: "PHYSICS",
  count: 0,
  mcqType: 0,
  integerType: 0,
});

export default function CreateTestPage() {
  const router = useRouter();
  const [testName, setTestName] = useState("");
  const [durationInMins, setDurationInMins] = useState("180");
  const [maxMarks, setMaxMarks] = useState("300");
  const [passingMarks, setPassingMarks] = useState("100");
  const [active, setActive] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [startAt, setStartAt] = useState("");
  const [expireAt, setExpireAt] = useState("");
  const [sections, setSections] = useState<TestSection[]>([
    { name: "PHYSICS", count: 25, mcqType: 20, integerType: 5 },
    { name: "CHEMISTRY", count: 25, mcqType: 20, integerType: 5 },
    { name: "MATHS", count: 25, mcqType: 20, integerType: 5 },
  ]);
  const [negativeMarking, setNegativeMarking] = useState<NegativeMarking>({
    enabled: true,
    perWrong: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = useMemo(
    () => sections.reduce((sum, s) => sum + (Number(s.count) || 0), 0),
    [sections]
  );

  const updateSection = (
    index: number,
    field: keyof TestSection,
    value: string
  ) => {
    setSections((prev) =>
      prev.map((section, i) => {
        if (i !== index) return section;
        if (field === "name") return { ...section, name: value };
        const num = Number(value) || 0;
        const next = { ...section, [field]: num };
        if (field === "mcqType" || field === "integerType") {
          next.count =
            (Number(next.mcqType) || 0) + (Number(next.integerType) || 0);
        }
        return next;
      })
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!startAt || !expireAt) {
        throw new Error("Start and expire date/time are required");
      }
      if (sections.length === 0) throw new Error("Add at least one section");
      for (const section of sections) {
        if (section.count !== section.mcqType + section.integerType) {
          throw new Error(`${section.name}: count must equal MCQ + Integer`);
        }
      }

      const startMs = new Date(startAt).getTime();
      const expireMs = new Date(expireAt).getTime();
      if (expireMs <= startMs) {
        throw new Error("Expire time must be after start time");
      }

      const payload: CreateTestPayload = {
        testId: "client-placeholder",
        testName: testName.trim(),
        totalQuestions: String(totalQuestions),
        sections: sections.map((s) => ({
          name: s.name,
          count: Number(s.count) || 0,
          mcqType: Number(s.mcqType) || 0,
          integerType: Number(s.integerType) || 0,
        })),
        negativeMarking: {
          enabled: negativeMarking.enabled,
          perWrong: Number(negativeMarking.perWrong) || 0,
        },
        durationInMins: Number(durationInMins),
        maxMarks: Number(maxMarks),
        passingMarks: Number(passingMarks),
        active,
        shuffleQuestions,
        startAt: startMs,
        expireAt: expireMs,
      };

      await createTest(payload);
      router.push("/admin/test");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/test"
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Create Test</h2>
          <p className="text-sm text-slate-600">
            Configure schedule, sections, and scoring
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Test Name *">
            <input
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className={inputClass}
              placeholder="JEE Full Mock 75"
              required
            />
          </Field>
          <Field label="Total Questions">
            <input
              value={totalQuestions}
              readOnly
              className={`${inputClass} bg-slate-50`}
            />
          </Field>
          <Field label="Start Date & Time *">
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Expire Date & Time *">
            <input
              type="datetime-local"
              value={expireAt}
              onChange={(e) => setExpireAt(e.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Duration (mins) *">
            <input
              type="number"
              min={1}
              value={durationInMins}
              onChange={(e) => setDurationInMins(e.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Max Marks *">
            <input
              type="number"
              min={1}
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Passing Marks *">
            <input
              type="number"
              min={0}
              value={passingMarks}
              onChange={(e) => setPassingMarks(e.target.value)}
              className={inputClass}
              required
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
            />
            Shuffle Questions
          </label>
        </div>

        <div className="rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Sections *</h3>
            <button
              type="button"
              onClick={() => setSections((p) => [...p, emptySection()])}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 rounded-lg"
            >
              Add Section
            </button>
          </div>
          {sections.map((section, index) => (
            <div
              key={index}
              className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end border-t border-slate-100 pt-3"
            >
              <Field label="Name">
                <select
                  value={section.name}
                  onChange={(e) => updateSection(index, "name", e.target.value)}
                  className={inputClass}
                >
                  {SECTION_OPTIONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="MCQ">
                <input
                  type="number"
                  min={0}
                  value={section.mcqType}
                  onChange={(e) =>
                    updateSection(index, "mcqType", e.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Integer">
                <input
                  type="number"
                  min={0}
                  value={section.integerType}
                  onChange={(e) =>
                    updateSection(index, "integerType", e.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Count">
                <input
                  type="number"
                  value={section.count}
                  readOnly
                  className={`${inputClass} bg-slate-50`}
                />
              </Field>
              <button
                type="button"
                onClick={() =>
                  setSections((p) => p.filter((_, i) => i !== index))
                }
                disabled={sections.length === 1}
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 p-4 space-y-3">
          <h3 className="font-semibold text-slate-900">Negative Marking</h3>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={negativeMarking.enabled}
              onChange={(e) =>
                setNegativeMarking((prev) => ({
                  ...prev,
                  enabled: e.target.checked,
                }))
              }
            />
            Enabled
          </label>
          <Field label="Per wrong">
            <input
              type="number"
              min={0}
              step="0.5"
              value={negativeMarking.perWrong}
              disabled={!negativeMarking.enabled}
              onChange={(e) =>
                setNegativeMarking((prev) => ({
                  ...prev,
                  perWrong: Number(e.target.value) || 0,
                }))
              }
              className={inputClass}
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Test"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </span>
      {children}
    </label>
  );
}
