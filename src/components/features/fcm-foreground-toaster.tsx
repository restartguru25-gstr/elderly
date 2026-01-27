'use client';

import { useCallback } from 'react';
import { useFCMForegroundHandler } from '@/hooks/use-fcm';
import { useToast } from '@/hooks/use-toast';

export function FCMForegroundToaster() {
  const { toast } = useToast();
  const onMessage = useCallback(
    (payload: unknown) => {
      const p = payload as { notification?: { title?: string; body?: string } };
      toast({
        title: p.notification?.title ?? 'Notification',
        description: p.notification?.body,
      });
    },
    [toast]
  );
  useFCMForegroundHandler(onMessage);
  return null;
}
