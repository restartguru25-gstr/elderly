'use client';

import { useEffect } from 'react';

function shouldForceReloadFromError(err: unknown): boolean {
  const msg = typeof err === 'string' ? err : (err as any)?.message;
  if (typeof msg !== 'string') return false;

  // Common patterns when a Next.js chunk fails to load (stale HTML/service worker/cache).
  return (
    msg.includes('ChunkLoadError') ||
    msg.includes('Loading chunk') ||
    msg.includes("reading 'call'") ||
    msg.includes('Cannot read properties of undefined (reading') ||
    msg.includes('Unexpected token') ||
    msg.includes('Invalid or unexpected token')
  );
}

function reloadOncePerSession() {
  try {
    const key = '__elderlink_chunk_recover_attempted__';
    const attempted = sessionStorage.getItem(key) === '1';
    if (attempted) return;
    sessionStorage.setItem(key, '1');
  } catch {
    // ignore
  }
  window.location.reload();
}

export function ChunkRecovery() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onError = (event: Event) => {
      // Script/link load errors can arrive as Event with target set.
      const target = (event as any)?.target as HTMLElement | null;
      const src =
        target && (target as any).src
          ? String((target as any).src)
          : target && (target as any).href
            ? String((target as any).href)
            : '';

      if (src.includes('/_next/') || src.includes('/manifest')) {
        reloadOncePerSession();
        return;
      }

      // Otherwise, check if this looks like a chunk load/runtime error.
      const message = (event as any)?.message;
      if (shouldForceReloadFromError({ message })) {
        reloadOncePerSession();
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (shouldForceReloadFromError(event.reason)) {
        reloadOncePerSession();
      }
    };

    window.addEventListener('error', onError, true);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError, true);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}

