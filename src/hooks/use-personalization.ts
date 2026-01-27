'use client';

import { useState, useEffect, useCallback } from 'react';

const PREF_COMPACT = 'elderlink-dashboard-compact';
const PREF_FAVORITES = 'elderlink-favorite-links';

export type DashboardLayout = 'default' | 'compact';

export function usePersonalization() {
  const [compact, setCompact] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setCompact(localStorage.getItem(PREF_COMPACT) === '1');
      const raw = localStorage.getItem(PREF_FAVORITES);
      if (raw) {
        const arr = JSON.parse(raw) as unknown;
        setFavorites(Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []);
      }
    } catch {
      setCompact(false);
      setFavorites([]);
    }
  }, []);

  const setCompactLayout = useCallback((value: boolean) => {
    setCompact(value);
    try {
      localStorage.setItem(PREF_COMPACT, value ? '1' : '0');
    } catch {}
  }, []);

  const toggleFavorite = useCallback((path: string) => {
    setFavorites((prev) => {
      const next = prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path];
      try {
        localStorage.setItem(PREF_FAVORITES, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return {
    compact,
    setCompactLayout,
    favorites,
    toggleFavorite,
    isFavorite: (path: string) => favorites.includes(path),
    mounted,
  };
}
