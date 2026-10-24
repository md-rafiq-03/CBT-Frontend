import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TestTimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  isActive: boolean;
  /** Wall-clock start. When set, a reload keeps the remaining time. */
  startedAt?: number;
}

function remainingSeconds(durationMinutes: number, startedAt?: number) {
  const total = Math.max(0, Math.floor(durationMinutes * 60));
  if (!startedAt) return total;
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  return Math.max(0, total - elapsed);
}

export default function TestTimer({
  durationMinutes,
  onTimeUp,
  isActive,
  startedAt,
}: TestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    remainingSeconds(durationMinutes, startedAt)
  );
  const [isWarning, setIsWarning] = useState(
    () => remainingSeconds(durationMinutes, startedAt) <= 300
  );
  const firedRef = useRef(false);
  const remainingRef = useRef(timeRemaining);
  const startedAtRef = useRef(startedAt);
  if (startedAtRef.current !== startedAt) {
    startedAtRef.current = startedAt;
    firedRef.current = false;
    remainingRef.current = remainingSeconds(durationMinutes, startedAt);
  }

  useEffect(() => {
    if (!isActive) return;

    const apply = (next: number) => {
      const value = Math.max(0, next);
      remainingRef.current = value;
      setTimeRemaining(value);
      if (value <= 300) setIsWarning(true);
      if (value <= 0 && !firedRef.current) {
        firedRef.current = true;
        onTimeUp();
      }
    };

    if (startedAt) apply(remainingSeconds(durationMinutes, startedAt));

    const timer = window.setInterval(() => {
      const next = startedAt
        ? remainingSeconds(durationMinutes, startedAt)
        : remainingRef.current - 1;
      apply(next);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isActive, onTimeUp, startedAt, durationMinutes]);

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const formatTime = (value: number) => String(value).padStart(2, "0");

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1.5 rounded font-mono font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
        isWarning ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
      }`}
    >
      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
      <span>
        {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
      </span>
    </div>
  );
}
