'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Bell, Check } from 'lucide-react';
import { format } from 'date-fns';
import { markReminderRead } from '@/lib/reminder-actions';
import type { Firestore } from 'firebase/firestore';

type Reminder = {
  fromGuardianId: string;
  fromGuardianName?: string;
  message: string;
  read?: boolean;
  createdAt?: { toDate: () => Date };
};

export function RemindersCard() {
  const firestore = useFirestore();
  const { user } = useUser();
  const remindersQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'reminders'),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore, user]
  );
  const { data: reminders } = useCollection<Reminder>(remindersQuery);

  const unread = reminders?.filter((r) => !r.read) ?? [];
  const recent = reminders?.slice(0, 5) ?? [];

  if (!reminders || reminders.length === 0) return null;

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              Reminders from family
              {unread.length > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  {unread.length} new
                </span>
              )}
            </CardTitle>
            <CardDescription>Messages from your children or family</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recent.map((r) => (
          <ReminderItem
            key={r.id}
            reminder={r}
            userId={user!.uid}
            firestore={firestore}
            onMarkRead={markReminderRead}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function ReminderItem({
  reminder,
  userId,
  firestore,
  onMarkRead,
}: {
  reminder: Reminder & { id: string };
  userId: string;
  firestore: Firestore;
  onMarkRead: (fs: Firestore, uid: string, id: string) => Promise<unknown>;
}) {
  const from = reminder.fromGuardianName || 'Family';
  const time = reminder.createdAt?.toDate
    ? format(reminder.createdAt.toDate(), 'MMM d, h:mm a')
    : '';

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-lg border-2 p-3 ${
        reminder.read ? 'bg-muted/30' : 'border-primary/20 bg-primary/5'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{from}</p>
        <p className="text-sm text-muted-foreground">{reminder.message}</p>
        {time && <p className="mt-1 text-xs text-muted-foreground">{time}</p>}
      </div>
      {!reminder.read && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={() => onMarkRead(firestore, userId, reminder.id)}
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
