'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { Wifi, WifiOff } from 'lucide-react';

export function ConnectionIndicator() {
  const online = useOnlineStatus();

  return (
    <span
      className="flex items-center gap-1.5 text-xs text-muted-foreground"
      title={online ? 'You are online' : 'You are offline'}
      aria-label={online ? 'Online' : 'Offline'}
    >
      {online ? (
        <Wifi className="h-3.5 w-3.5 text-green-600" aria-hidden />
      ) : (
        <WifiOff className="h-3.5 w-3.5 text-amber-600" aria-hidden />
      )}
      <span className="hidden sm:inline">{online ? 'Online' : 'Offline'}</span>
    </span>
  );
}
