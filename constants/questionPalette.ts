/** Shared question-palette status colors (instructions + attempt grid). */

export type PaletteStatusKey =
  | "notVisited"
  | "visitedUnanswered"
  | "answered"
  | "marked"
  | "answeredMarked";

export const PALETTE_STATUS_CLASSES: Record<
  PaletteStatusKey,
  { cell: string; hover?: string }
> = {
  notVisited: {
    cell: "bg-gray-200 text-gray-600",
    hover: "hover:bg-gray-300",
  },
  visitedUnanswered: {
    cell: "bg-red-600 text-white",
    hover: "hover:bg-red-700",
  },
  answered: {
    cell: "bg-green-600 text-white",
    hover: "hover:bg-green-700",
  },
  marked: {
    cell: "bg-orange-500 text-white",
    hover: "hover:bg-orange-600",
  },
  answeredMarked: {
    cell: "bg-purple-700 text-white",
    hover: "hover:bg-purple-800",
  },
};

export const PALETTE_STATUS_LEGEND = [
  {
    key: "notVisited" as const,
    label: "You have not visited the question yet.",
    shortLabel: "Not visited",
  },
  {
    key: "visitedUnanswered" as const,
    label: "You have visited the question, but have not answered it.",
    shortLabel: "Visited, not answered",
  },
  {
    key: "answered" as const,
    label: "You have answered the question.",
    shortLabel: "Answered",
  },
  {
    key: "marked" as const,
    label: "You have not answered the question, but have marked it for review.",
    shortLabel: "Marked for review",
  },
  {
    key: "answeredMarked" as const,
    label:
      "You have answered the question and marked it for review. These answers are still submitted.",
    shortLabel: "Answered + marked",
  },
] as const;

export function paletteCellClass(
  key: PaletteStatusKey,
  withHover = true
): string {
  const entry = PALETTE_STATUS_CLASSES[key];
  return withHover && entry.hover
    ? `${entry.cell} ${entry.hover}`
    : entry.cell;
}
