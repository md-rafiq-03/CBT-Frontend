/** Original flat scenes for the login slides. */

const BLUE = "#447dfc";
const BLUE_SOFT = "#d7e8ff";
const PAPER = "#f3f6fb";
const LINE = "#d5deea";
const INK = "#5d6b80";

export function TimetableArt() {
  const days = ["M", "T", "W", "T", "F", "S"];
  const marks = [1, 0, 1, 1, 0, 1, 1, 2, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1];

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <circle cx="48" cy="52" r="26" fill={BLUE_SOFT} />
      <circle cx="48" cy="52" r="18" fill="#fff" stroke={BLUE} strokeWidth="3" />
      <path d="M48 44 v9 l6 3" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" />

      <rect x="46" y="64" width="124" height="108" rx="12" fill={PAPER} />
      <rect x="46" y="64" width="124" height="26" rx="12" fill={BLUE} />
      <rect x="46" y="78" width="124" height="12" fill={BLUE} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={62 + i * 20} y="54" width="7" height="16" rx="3" fill={BLUE} />
      ))}
      {days.map((day, i) => (
        <text
          key={`${day}-${i}`}
          x={62 + i * 18}
          y="82"
          textAnchor="middle"
          fontSize="8"
          fontFamily="Arial, sans-serif"
          fill="#fff"
        >
          {day}
        </text>
      ))}
      {marks.map((mark, i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        return (
          <rect
            key={i}
            x={54 + col * 18}
            y={100 + row * 20}
            width="13"
            height="13"
            rx="3"
            fill={mark === 1 ? BLUE : mark === 2 ? "#243140" : "#fff"}
            stroke={mark === 0 ? LINE : "none"}
          />
        );
      })}
    </svg>
  );
}

export function PerformanceArt() {
  const bars = [
    { h: 42, fill: BLUE_SOFT },
    { h: 68, fill: BLUE },
    { h: 34, fill: "#f0b4b8" },
    { h: 84, fill: BLUE },
    { h: 56, fill: BLUE_SOFT },
  ];

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <rect x="32" y="40" width="136" height="120" rx="16" fill={PAPER} />
      <path d="M50 132 h100" stroke={LINE} strokeWidth="2" />
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={54 + i * 20}
          y={132 - bar.h}
          width="12"
          height={bar.h}
          rx="4"
          fill={bar.fill}
        />
      ))}
      <circle cx="96" cy="78" r="11" fill="#fff" stroke="#e07a84" strokeWidth="2" />
      <path d="M92 74 l8 8 M100 74 l-8 8" stroke="#e07a84" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ResultArt() {
  const rows = [
    { label: "Phy", score: "18" },
    { label: "Chem", score: "16" },
    { label: "Math", score: "20" },
  ];

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <rect x="30" y="36" width="104" height="128" rx="12" fill="#fff" stroke={LINE} />
      <rect x="30" y="36" width="104" height="26" rx="12" fill={BLUE} />
      <rect x="30" y="50" width="104" height="12" fill={BLUE} />
      <text x="82" y="54" textAnchor="middle" fontSize="11" fontFamily="Arial, sans-serif" fill="#fff">
        Result
      </text>
      {rows.map((row, i) => (
        <g key={row.label}>
          <text x="44" y={86 + i * 26} fontSize="11" fontFamily="Arial, sans-serif" fill={INK}>
            {row.label}
          </text>
          <rect x="86" y={74 + i * 26} width="34" height="16" rx="8" fill={BLUE_SOFT} />
          <text
            x="103"
            y={86 + i * 26}
            textAnchor="middle"
            fontSize="10"
            fontFamily="Arial, sans-serif"
            fill={BLUE}
          >
            {row.score}
          </text>
        </g>
      ))}
      <circle cx="152" cy="128" r="26" fill="#f6c453" />
      <circle cx="152" cy="128" r="18" fill="#ffe7a3" />
      <text x="152" y="133" textAnchor="middle" fontSize="13" fontFamily="Arial, sans-serif" fill="#8a5a12">
        #1
      </text>
    </svg>
  );
}

export function LearnArt() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <path d="M36 72 h58 l8 12 v64 H36 z" fill={BLUE} />
      <path d="M164 72 h-58 l-8 12 v64 h66 z" fill={BLUE_SOFT} />
      <path d="M102 84 v64" stroke="#fff" strokeWidth="4" />
      <path d="M50 100 h32 M50 114 h24" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M114 100 h32 M114 114 h26" stroke={BLUE} strokeWidth="3" strokeLinecap="round" />
      <g transform="translate(138 28) rotate(32)">
        <rect width="12" height="42" rx="2" fill="#f3b0b6" />
        <rect width="12" height="8" rx="2" fill="#e06a73" />
        <polygon points="0,42 12,42 6,54" fill="#f2c14e" />
        <polygon points="3,48 9,48 6,54" fill={INK} />
      </g>
      <circle cx="52" cy="152" r="16" fill="#3cba8b" />
      <path d="M44 152 l5 5 11-12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
