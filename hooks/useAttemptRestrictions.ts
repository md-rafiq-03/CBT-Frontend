"use client";

import { useCallback, useEffect, useRef } from "react";

const BLOCKED_SHORTCUTS = new Set(["c", "x", "v", "a", "p", "s", "u"]);

type Options = {
  active: boolean;
  onBack: () => void;
  onViolation: (message: string) => void;
  onTabLeave: () => void;
  onTabReturn: () => void;
};

/**
 * Client-side exam guard. A website cannot stop every OS screenshot,
 * but copy, context menu, print, and leaving the attempt are blocked,
 * and screenshot / tab-switch attempts are reported.
 */
export function useAttemptRestrictions({
  active,
  onBack,
  onViolation,
  onTabLeave,
  onTabReturn,
}: Options) {
  const onBackRef = useRef(onBack);
  const onViolationRef = useRef(onViolation);
  const onTabLeaveRef = useRef(onTabLeave);
  const onTabReturnRef = useRef(onTabReturn);
  const allowLeaveRef = useRef(false);

  onBackRef.current = onBack;
  onViolationRef.current = onViolation;
  onTabLeaveRef.current = onTabLeave;
  onTabReturnRef.current = onTabReturn;

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

    let leaveTimer = 0;
    let unloading = false;

    const clearLeaveTimer = () => {
      if (leaveTimer) {
        window.clearTimeout(leaveTimer);
        leaveTimer = 0;
      }
    };

    const onBeforeUnload = () => {
      // Do not call preventDefault or set returnValue. That is what makes
      // Chrome show "Changes you made may not be saved". The attempt is
      // already stored, so reload should proceed without that prompt.
      clearLeaveTimer();
    };

    const onPageHide = () => {
      unloading = true;
      clearLeaveTimer();
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (unloading) return;
        // Wait one turn so a reload can cancel this. A real tab switch does not unload.
        leaveTimer = window.setTimeout(() => {
          leaveTimer = 0;
          if (unloading) return;
          onTabLeaveRef.current();
        }, 0);
      } else if (document.visibilityState === "visible") {
        if (leaveTimer) {
          window.clearTimeout(leaveTimer);
          leaveTimer = 0;
        }
        onTabReturnRef.current();
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
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (leaveTimer) window.clearTimeout(leaveTimer);
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
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active]);

  const allowLeave = useCallback(() => {
    allowLeaveRef.current = true;
  }, []);

  return { allowLeave };
}
