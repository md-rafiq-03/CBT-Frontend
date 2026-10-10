"use client";

import { FormEvent, ReactNode, useState } from "react";
import { createStudent } from "@/lib/authApi";
import { apiErrorMessage } from "@/lib/apiError";

export default function CreateStudentForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await createStudent({
        fullName: fullName.trim(),
        rollNumber: rollNumber.trim(),
        dob,
        email: email.trim(),
      });
      setFullName("");
      setRollNumber("");
      setDob("");
      setEmail("");
      setSuccess(
        "Student created. Their first password is the date of birth (YYYY-MM-DD). They must change it before using the app."
      );
      onCreated();
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Could not create the student."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Add student</h3>
        <p className="text-sm text-slate-600">
          The first password is the date of birth. A code is emailed when they replace it.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full name" id="fullName">
          <input
            id="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            maxLength={100}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Roll number" id="rollNumber">
          <input
            id="rollNumber"
            value={rollNumber}
            onChange={(event) => setRollNumber(event.target.value)}
            maxLength={32}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Date of birth" id="dob">
          <input
            id="dob"
            type="date"
            value={dob}
            onChange={(event) => setDob(event.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Email" id="email">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={254}
            required
            className={inputClass}
          />
        </Field>
      </div>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {success}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-50"
      >
        {saving ? "Saving..." : "Create student"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500";

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className="block text-sm text-slate-700 space-y-1">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
