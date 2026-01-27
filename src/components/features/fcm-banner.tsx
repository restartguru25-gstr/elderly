'use client';

import { useEffect, useState } from 'react';
import { useFCM } from '@/hooks/use-fcm';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';

const FCM_BANNER_DISMISSED = 'elderlink-fcm-banner-dismissed';

export function FCMBanner() {
  const { permission, supported, requestPermissionAndToken } = useFCM();
  const [dismissed, setDismissed] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(FCM_BANNER_DISMISSED) === '1');
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    await requestPermissionAndToken();
    setLoading(false);
    setDismissed(true);
    localStorage.setItem(FCM_BANNER_DISMISSED, '1');
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(FCM_BANNER_DISMISSED, '1');
  };

  if (dismissed || supported === false || permission === 'granted') return null;

  return (
    <div
      role="region"
      aria-label="Enable push notifications"
      className="flex items-center justify-between gap-4 border-b bg-primary/10 px-4 py-2 text-sm"
    >
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" aria-hidden />
        <span>Get reminders & alerts even when the app is closed.</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" variant="default" onClick={handleEnable} disabled={loading}>
          {loading ? 'Enabling…' : 'Enable'}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDismiss} aria-label="Dismiss">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
