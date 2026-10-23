import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface TestTimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export default function TestTimer({
  durationMinutes,
  onTimeUp,
  isActive,
}: TestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        if (newTime <= 300) {
          setIsWarning(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onTimeUp]);

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
