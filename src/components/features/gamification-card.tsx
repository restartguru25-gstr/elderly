'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { Trophy, Flame } from 'lucide-react';
import { format } from 'date-fns';

type Vital = { timestamp?: { toDate: () => Date } };

function getStreak(vitals: Vital[]): number {
  if (!vitals?.length) return 0;
  const dates = new Set(
    vitals
      .filter((v) => v.timestamp?.toDate)
      .map((v) => format(v.timestamp!.toDate(), 'yyyy-MM-dd'))
  );
  const sorted = Array.from(dates).sort().reverse();
  let streak = 0;
  const today = format(new Date(), 'yyyy-MM-dd');
  let d = today;
  for (;;) {
    if (!sorted.includes(d)) break;
    streak++;
    const next = new Date(d);
    next.setDate(next.getDate() - 1);
    d = format(next, 'yyyy-MM-dd');
  }
  return streak;
}

const BADGES = [
  { id: 'first_vital', label: 'First vital', check: (v: number, _l: number, _s: number) => v >= 1 },
  { id: 'streak_7', label: '7-day streak', check: (_v: number, _l: number, s: number) => s >= 7 },
  { id: 'family_linked', label: 'Family linked', check: (_v: number, l: number) => l >= 1 },
  { id: 'vitals_10', label: '10 vitals logged', check: (v: number) => v >= 10 },
] as const;

export function GamificationCard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const vitalsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'vitals'),
            orderBy('timestamp', 'desc'),
            limit(100)
          )
        : null,
    [firestore, user]
  );
  const { data: vitals } = useCollection<Vital>(vitalsQuery);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: profile } = useDoc(userDocRef);
  const linkedCount = Array.isArray((profile as { linkedProfiles?: string[] })?.linkedProfiles)
    ? (profile as { linkedProfiles: string[] }).linkedProfiles.length
    : 0;

  const { streak, earned } = useMemo(() => {
    const s = getStreak(vitals || []);
    const v = vitals?.length ?? 0;
    const l = linkedCount;
    const earned = BADGES.filter((b) => b.check(v, l, s));
    return { streak: s, earned };
  }, [vitals, linkedCount]);

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Achievements
        </CardTitle>
        <CardDescription>Streak & badges</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-primary/10 px-4 py-3">
          <Flame className="h-8 w-8 text-orange-500" />
          <div>
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-sm text-muted-foreground">day streak</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {BADGES.map((b) => {
            const has = earned.some((e) => e.id === b.id);
            return (
              <span
                key={b.id}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  has ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                {has ? '✓ ' : ''}{b.label}
              </span>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
