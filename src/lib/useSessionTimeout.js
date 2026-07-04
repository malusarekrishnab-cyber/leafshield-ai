import { useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARN_MS = 2 * 60 * 1000; // warn 2 min before

export function useSessionTimeout({ onWarn, onLogout }) {
  const timeoutRef = useRef(null);
  const warnRef = useRef(null);

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    clearTimeout(warnRef.current);

    warnRef.current = setTimeout(() => {
      onWarn?.();
    }, TIMEOUT_MS - WARN_MS);

    timeoutRef.current = setTimeout(() => {
      base44.auth.logout("/login");
      onLogout?.();
    }, TIMEOUT_MS);
  }, [onWarn, onLogout]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timeoutRef.current);
      clearTimeout(warnRef.current);
    };
  }, [resetTimer]);
}