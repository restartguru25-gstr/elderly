'use client';

import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_KEY = 'elderlink-onboarding-done';

export function useOnboarding() {
  const [done, setDone] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setDone(localStorage.getItem(ONBOARDING_KEY) === '1');
    } catch {
      setDone(true);
    }
  }, []);

  const complete = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, '1');
      setDone(true);
    } catch {}
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(ONBOARDING_KEY);
      setDone(false);
    } catch {}
  }, []);

  return { done, complete, reset, show: mounted && !done };
}
