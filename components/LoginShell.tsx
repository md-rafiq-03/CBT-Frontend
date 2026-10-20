"use client";

import {
  FormEvent,
  ReactNode,
  TransitionEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Footer from "@/components/Footer";
import {
  LearnArt,
  PerformanceArt,
  ResultArt,
  TimetableArt,
} from "@/components/LoginSlideArt";
import { fieldClass } from "@/lib/formStyles";

const SLIDES = [
  {
    title: "Time table & Attendance",
    text: "See your class schedule and attendance in one place.",
    Art: TimetableArt,
  },
  {
    title: "Performance check with error analysis.",
    text: "Review your score and the questions you missed.",
    Art: PerformanceArt,
  },
  {
    title: "Instant result with subjectwise marks and Rank",
    text: "Subject marks and rank are available as soon as the test ends.",
    Art: ResultArt,
  },
  {
    title: "Learn, Practice & Achieve.",
    text: "Practice tests, then see what to work on next.",
    Art: LearnArt,
  },
] as const;

interface LoginShellProps {
  title: string;
  subtitle: string;
  rollNumber: string;
  password: string;
  error: string;
  notice?: string;
  loading: boolean;
  onRollNumberChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  hint?: ReactNode;
}

export default function LoginShell({
  title,
  subtitle,
  rollNumber,
  password,
  error,
  notice,
  loading,
  onRollNumberChange,
  onPasswordChange,
  onSubmit,
  hint,
}: LoginShellProps) {
  return (
    <div className="bg-white text-neutral-900" style={{ colorScheme: "light" }}>
      <section className="flex min-h-screen flex-col lg:h-screen lg:min-h-0 lg:flex-row">
        <LoginSlides />
        <div className="relative flex min-h-[58vh] flex-1 items-center justify-center px-6 py-16 lg:min-h-0 lg:px-12">
          <img
            src="/dsss-logo.jpg"
            alt="Kinematics Classes"
            className="absolute top-6 right-6 h-16 w-16 object-contain sm:h-20 sm:w-20"
          />
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
            <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <Field
                id="rollNumber"
                label="Username"
                type="text"
                value={rollNumber}
                placeholder="Roll number"
                autoComplete="username"
                onChange={onRollNumberChange}
              />
              <Field
                id="password"
                label="Password"
                type="password"
                value={password}
                placeholder="Password"
                autoComplete="current-password"
                onChange={onPasswordChange}
              />

              {notice && (
                <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                  {notice}
                </p>
              )}
              {error && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            {hint && (
              <div className="mt-5 text-center text-sm text-neutral-600">{hint}</div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  placeholder,
  autoComplete,
  onChange,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-800">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass}
      />
    </div>
  );
}

const SLIDE_MS = 4000;
const SLIDE_MOVE_MS = 700;

function LoginSlides() {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const settled = useRef(false);
  const active = index % SLIDES.length;
  // First slide is repeated at the end so the wrap moves forward, then snaps back.
  const track = [...SLIDES, SLIDES[0]];

  const finishLoop = () => {
    if (settled.current) return;
    settled.current = true;
    setAnimate(false);
    setIndex(0);
  };

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current >= SLIDES.length ? current : current + 1));
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (index !== SLIDES.length) {
      settled.current = false;
      return;
    }
    const id = window.setTimeout(finishLoop, SLIDE_MOVE_MS);
    return () => window.clearTimeout(id);
  }, [index]);

  useLayoutEffect(() => {
    if (animate) return;
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      window.cancelAnimationFrame(outer);
      window.cancelAnimationFrame(inner);
    };
  }, [animate]);

  const onTrackTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
    if (index === SLIDES.length) finishLoop();
  };

  return (
    <div className="flex h-[42vh] shrink-0 flex-col bg-blue-600 text-white lg:h-auto lg:w-1/2">
      <div className="flex-1 overflow-hidden">
        <div
          onTransitionEnd={onTrackTransitionEnd}
          className={`flex h-full will-change-transform ${
            animate ? "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" : ""
          }`}
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {track.map((slide, i) => (
            <SlidePanel key={`${slide.title}-${i}`} slide={slide} />
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2 pb-8" role="tablist" aria-label="Highlights">
        {SLIDES.map((item, i) => (
          <button
            key={item.title}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={item.title}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full ${i === active ? "w-6 bg-white" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}

function SlidePanel({ slide }: { slide: (typeof SLIDES)[number] }) {
  const Art = slide.Art;
  return (
    <div className="flex w-full shrink-0 flex-col items-center justify-center px-8 text-center">
      <div className="mb-8 h-52 w-52 rounded-[2rem] bg-white p-3 sm:h-60 sm:w-60">
        <Art />
      </div>
      <h2 className="max-w-md text-2xl font-semibold sm:text-3xl">{slide.title}</h2>
      <p className="mt-3 max-w-sm text-sm leading-6 text-blue-50">{slide.text}</p>
    </div>
  );
}
