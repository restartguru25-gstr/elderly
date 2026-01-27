'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950"
    >
      <WifiOff className="h-4 w-4" aria-hidden />
      You&apos;re offline. Some features may be limited. Check your connection.
    </div>
  );
}
