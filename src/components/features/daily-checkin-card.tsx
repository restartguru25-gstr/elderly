'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, PartyPopper } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, limit, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { createDailyCheckin } from '@/lib/daily-checkin-actions';
import { Skeleton } from '../ui/skeleton';

export function DailyCheckinCard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isCheckingIn, setIsCheckingIn] = React.useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfToday = Timestamp.fromDate(today);

  const checkinsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/daily_checkins`),
      where('timestamp', '>=', startOfToday),
      limit(1)
    );
  }, [firestore, user, startOfToday]);

  const { data: checkins, isLoading: isCheckinLoading } = useCollection(checkinsQuery);

  const hasCheckedInToday = useMemo(() => (checkins ? checkins.length > 0 : false), [checkins]);

  const handleCheckin = async () => {
    if (!user) return;
    setIsCheckingIn(true);
    try {
      await createDailyCheckin(firestore, user.uid);
      toast({
        title: 'Checked In!',
        description: "Great to know you're doing well today.",
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not complete check-in.',
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (isUserLoading || isCheckinLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Check-in</CardTitle>
        <CardDescription>Let your loved ones know you&apos;re doing okay today.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasCheckedInToday ? (
          <div className="flex items-center justify-center rounded-md border border-dashed bg-secondary/50 p-6 text-center">
            <div className='flex flex-col items-center gap-2 text-green-600'>
                <PartyPopper className="h-10 w-10" />
                <p className="font-semibold">You&apos;ve already checked in today. See you tomorrow!</p>
            </div>
          </div>
        ) : (
          <Button onClick={handleCheckin} disabled={isCheckingIn} className="w-full" size="lg">
            {isCheckingIn ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-5 w-5" />
            )}
            I&apos;m Doing OK Today
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
