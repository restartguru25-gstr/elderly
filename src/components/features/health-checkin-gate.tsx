'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { DailyHealthCheckinFlow } from './daily-health-checkin-flow';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { hasCompletedTodayCheckin } from '@/lib/health-checkin-actions';
import { useFirestore, useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

type Props = {
  children: React.ReactNode;
  /** When true, gate is active - show health check-in before children */
  active?: boolean;
};

/**
 * Gates quiz (or other) content behind Daily Health Check-in.
 * When active and today's check-in is not done, shows the flow in a dialog.
 * After completion/skip, renders children.
 */
export function HealthCheckinGate({ children, active = true }: Props) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [showFlow, setShowFlow] = useState(false);
  const [flowComplete, setFlowComplete] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!active || !user || !firestore) {
      setChecking(false);
      if (!active) setFlowComplete(true);
      return;
    }
    let cancelled = false;
    hasCompletedTodayCheckin(firestore, user.uid).then((done) => {
      if (cancelled) return;
      setChecking(false);
      if (done) setFlowComplete(true);
      else setShowFlow(true);
    });
    return () => { cancelled = true; };
  }, [active, user?.uid, firestore]);

  const handleComplete = useCallback(() => {
    setFlowComplete(true);
    setShowFlow(false);
  }, []);

  if (!active) return <>{children}</>;
  if (checking) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  if (flowComplete) return <>{children}</>;

  return (
    <>
      <Dialog open={showFlow} onOpenChange={() => {}}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto border-2 sm:max-w-lg"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Daily Health Check-in</DialogTitle>
          </DialogHeader>
          <DailyHealthCheckinFlow onComplete={handleComplete} />
        </DialogContent>
      </Dialog>
      {children}
    </>
  );
}
