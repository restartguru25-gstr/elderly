'use client';

import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/toaster';

/**
 * Renders Toaster only on the client after mount.
 * Avoids hydration mismatches when browser extensions (e.g. Cursor)
 * inject attributes like data-cursor-ref into the toast viewport.
 */
export function ClientOnlyToaster() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <Toaster />;
}
