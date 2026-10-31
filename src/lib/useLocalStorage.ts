"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

// Saves a value in this browser only (nothing is sent to a server).
// Storage can be blocked (private windows), so every access is wrapped in try/catch.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function read(key: string): string {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

export function useLocalStorage<T>(key: string, initial: T): [T, (value: T) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => "",
  );

  const value = useMemo(() => {
    if (!raw) return initial;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
    // `initial` is a constant default, so only the stored text matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const set = useCallback(
    (next: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // storage unavailable: the value just won't persist
      }
      listeners.forEach((l) => l());
    },
    [key],
  );

  return [value, set];
}
