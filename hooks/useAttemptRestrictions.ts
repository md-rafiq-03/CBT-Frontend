"use client";

import { useCallback, useEffect, useRef } from "react";

const BLOCKED_SHORTCUTS = new Set(["c", "x", "v", "a", "p", "s", "u"]);

type Options = {
  active: boolean;
  onBack: () => void;
  onViolation: (message: string) => void;
};

/**
 * Client-side exam guard. A website cannot stop every OS screenshot,
 * but copy, context menu, print, and leaving the attempt are blocked,
 * and screenshot / tab-switch attempts are reported.
 */
export function useAttemptRestrictions({ active, onBack, onViolation }: Options) {
  const onBackRef = useRef(onBack);
  const onViolationRef = useRef(onViolation);
  const allowLeaveRef = useRef(false);

  onBackRef.current = onBack;
  onViolationRef.current = onViolation;

  useEffect(() => {
    if (!active) return;
    allowLeaveRef.current = false;

    const blockEvent = (event: Event) => {
      event.preventDefault();
    };

    const onSelectStart = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea")) return;
      event.preventDefault();
    };

    const flagScreenshot = () => {
      onViolationRef.current(
        "Screenshots are not allowed during this test. This attempt has been flagged."
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const meta = event.ctrlKey || event.metaKey;
      if (meta && BLOCKED_SHORTCUTS.has(key)) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (key === "printscreen" || (meta && event.shiftKey && key === "s")) {
        event.preventDefault();
        flagScreenshot();
      }
    };

    const onPopState = () => {
      if (allowLeaveRef.current) return;
      window.history.pushState({ attemptGuard: true }, "");
      onBackRef.current();
    };

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (allowLeaveRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        onViolationRef.current(
          "Leaving this screen is not allowed. This attempt has been flagged."
        );
      }
    };

    document.documentElement.classList.add("attempt-lock");
    window.history.pushState({ attemptGuard: true }, "");
    document.addEventListener("copy", blockEvent);
    document.addEventListener("cut", blockEvent);
    document.addEventListener("paste", blockEvent);
    document.addEventListener("contextmenu", blockEvent);
    document.addEventListener("dragstart", blockEvent);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.documentElement.classList.remove("attempt-lock");
      document.removeEventListener("copy", blockEvent);
      document.removeEventListener("cut", blockEvent);
      document.removeEventListener("paste", blockEvent);
      document.removeEventListener("contextmenu", blockEvent);
      document.removeEventListener("dragstart", blockEvent);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active]);

  const allowLeave = useCallback(() => {
    allowLeaveRef.current = true;
  }, []);

  return { allowLeave };
}
