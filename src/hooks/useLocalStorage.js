import { useState, useCallback } from "react";

/**
 * useLocalStorage — like useState, but the value is persisted to
 * localStorage under `key` and restored on reload.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback(
    (newValue) => {
      setValue((prev) => {
        const resolved = typeof newValue === "function" ? newValue(prev) : newValue;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage unavailable (private browsing, quota, etc.) — fail silently
        }
        return resolved;
      });
    },
    [key]
  );

  const clearStoredValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setStoredValue, clearStoredValue];
}
