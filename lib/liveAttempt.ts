import { StudentAnswer } from "./Interface";

const PREFIX = "cbt_live_attempt";

export interface LiveAttemptSnapshot {
  startedAt: number;
  currentIndex: number;
  answers: Record<string, StudentAnswer>;
  markedForReview: string[];
  visited: string[];
  tabSwitchCount: number;
  cheatFlag: boolean;
}

export function liveAttemptKey(userId: string, testKey: string) {
  return `${PREFIX}:${userId}:${testKey}`;
}

export function readLiveAttempt(
  userId: string,
  testKey: string
): LiveAttemptSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(liveAttemptKey(userId, testKey));
    if (!raw) return null;
    const data = JSON.parse(raw) as LiveAttemptSnapshot;
    if (!data || typeof data.startedAt !== "number" || data.startedAt <= 0) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function writeLiveAttempt(
  userId: string,
  testKey: string,
  snapshot: LiveAttemptSnapshot
) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      liveAttemptKey(userId, testKey),
      JSON.stringify(snapshot)
    );
  } catch {
    // The attempt still runs if the browser refuses storage.
  }
}

export function clearLiveAttempt(userId: string, testKey: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(liveAttemptKey(userId, testKey));
  } catch {
    // ignore
  }
}
