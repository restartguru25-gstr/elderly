'use client';

import { useEffect, useRef, useState } from 'react';
import type { Firestore } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useToast } from '@/hooks/use-toast';

import {
  isPermissionError,
  isProbablyOfflineError,
  listOfflineActions,
  removeOfflineAction,
} from '@/lib/offline-queue';

import { createVital } from '@/lib/vitals-actions';
import { logMedication } from '@/lib/medication-actions';
import { createReminder } from '@/lib/reminder-actions';
import { submitFeedback } from '@/lib/feedback-actions';

async function processOne(firestore: Firestore, action: ReturnType<typeof listOfflineActions>[number]) {
  switch (action.type) {
    case 'createVital':
      await createVital(firestore, action.userId, action.payload.vital as any);
      return;
    case 'logMedication':
      await logMedication(firestore, action.userId, action.payload.medicationId, action.payload.log);
      return;
    case 'createReminder':
      await createReminder(firestore, action.payload.seniorId, action.payload.reminder);
      return;
    case 'submitFeedback':
      await submitFeedback(firestore, action.payload.feedback);
      return;
  }
}

export function OfflineQueueProcessor() {
  const firestore = useFirestore();
  const { user } = useUser();
  const isOnline = useOnlineStatus();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const lastToastAt = useRef<number>(0);

  useEffect(() => {
    if (!user) return;
    if (!isOnline) return;
    if (isSyncing) return;

    const queue = listOfflineActions().filter((a) => a.userId === user.uid);
    if (queue.length === 0) return;

    let cancelled = false;
    setIsSyncing(true);

    (async () => {
      try {
        for (const item of queue) {
          if (cancelled) return;
          try {
            await processOne(firestore, item);
            removeOfflineAction(item.id);
          } catch (e) {
            // Permission problems should not be retried forever.
            if (isPermissionError(e)) {
              removeOfflineAction(item.id);
              toast({
                variant: 'destructive',
                title: 'Could not sync an offline action',
                description: 'Permission denied. Please check your account permissions.',
              });
              continue;
            }
            // If we went offline again, stop processing and keep remaining items.
            if (isProbablyOfflineError(e)) return;
            // Unknown errors: keep the item for later.
            return;
          }
        }

        const now = Date.now();
        if (now - lastToastAt.current > 10_000) {
          toast({
            title: 'Synced',
            description: 'Your offline updates have been synced.',
          });
          lastToastAt.current = now;
        }
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [firestore, isOnline, isSyncing, toast, user]);

  return null;
}

