import { useCallback, useEffect, useState } from 'react';

export type ViewMode = 'card' | 'list';

function isViewMode(value: unknown): value is ViewMode {
  return value === 'card' || value === 'list';
}

// Persists the card/list choice to localStorage under `key`.
//
// Starts from `fallback` so the server render and the first client render match
// (no hydration mismatch), then reads the stored value on mount. Also syncs when
// another tab changes it — the storage listener is removed on unmount, so there
// is no leak. Reads/writes are guarded because localStorage can throw (private
// mode, quota).
export function useViewPreference(key: string, fallback: ViewMode = 'card') {
  const [view, setViewState] = useState<ViewMode>(fallback);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (isViewMode(stored)) setViewState(stored);
    } catch {
      // localStorage unavailable — keep the fallback.
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === key && isViewMode(e.newValue)) setViewState(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  const setView = useCallback(
    (next: ViewMode) => {
      setViewState(next);
      try {
        window.localStorage.setItem(key, next);
      } catch {
        // Ignore write failures (private mode, quota exceeded).
      }
    },
    [key]
  );

  return [view, setView] as const;
}
