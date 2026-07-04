import { useRef, useCallback } from "react";

// Simple client-side rate limiter: max `limit` calls per `windowMs`
export function useRateLimit(limit = 5, windowMs = 60_000) {
  const timestamps = useRef([]);

  const check = useCallback(() => {
    const now = Date.now();
    timestamps.current = timestamps.current.filter(t => now - t < windowMs);
    if (timestamps.current.length >= limit) {
      const waitSec = Math.ceil((windowMs - (now - timestamps.current[0])) / 1000);
      return { allowed: false, waitSec };
    }
    timestamps.current.push(now);
    return { allowed: true, waitSec: 0 };
  }, [limit, windowMs]);

  return check;
}