'use client';

import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Bell, MessageSquare, Siren } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { markReminderRead } from '@/lib/reminder-actions';
import { Skeleton } from '@/components/ui/skeleton';

type Reminder = {
  fromGuardianId: string;
  fromGuardianName?: string;
  message: string;
  read?: boolean;
  createdAt?: { toDate: () => Date };
};

type Alert = {
  userId: string;
  timestamp?: { toDate: () => Date };
  status?: string;
};

export function NotificationCenter() {
  const firestore = useFirestore();
  const { user } = useUser();

  const remindersQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'reminders'),
            orderBy('createdAt', 'desc'),
            limit(5)
          )
        : null,
    [firestore, user]
  );
  const { data: reminders, isLoading: remindersLoading } = useCollection<Reminder>(remindersQuery);

  const alertsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'emergencyAlerts'),
            orderBy('timestamp', 'desc'),
            limit(3)
          )
        : null,
    [firestore, user]
  );
  const { data: alerts, isLoading: alertsLoading } = useCollection<Alert>(alertsQuery);

  const unreadCount = reminders?.filter((r) => !r.read).length ?? 0;
  const isLoading = remindersLoading || alertsLoading;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full" aria-label="Notifications">
          <Bell className="h-4 w-4" aria-hidden />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </DropdownMenuLabel>
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
            <>
              {alerts && alerts.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Emergency</div>
                  {alerts.map((a) => (
                    <DropdownMenuItem key={a.id} asChild>
                      <Link href="/dashboard/emergency" className="flex flex-col items-start gap-0.5">
                        <div className="flex items-center gap-2">
                          <Siren className="h-4 w-4 text-destructive" aria-hidden />
                          <span className="font-medium">SOS Alert</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {a.timestamp?.toDate ? format(a.timestamp.toDate(), 'MMM d, h:mm a') : 'Recently'}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              {reminders && reminders.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Reminders from family</div>
                  {reminders.map((r) => (
                    <DropdownMenuItem
                      key={r.id}
                      className={!r.read ? 'bg-primary/5' : undefined}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <div className="flex w-full flex-col items-start gap-0.5">
                        <div className="flex w-full items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <MessageSquare className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                            <span className="font-medium truncate">{r.fromGuardianName || 'Family'}</span>
                          </div>
                          {!r.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 shrink-0 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                markReminderRead(firestore, user!.uid, r.id);
                              }}
                            >
                              Mark read
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{r.message}</p>
                        <span className="text-xs text-muted-foreground">
                          {r.createdAt?.toDate ? format(r.createdAt.toDate(), 'MMM d, h:mm a') : ''}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              {(!reminders || reminders.length === 0) && (!alerts || alerts.length === 0) && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No notifications yet.
                </div>
              )}
            </>
          )}
        </div>
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="justify-center font-medium">
            View dashboard
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
