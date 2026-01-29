'use client';

import { useMemo, useState } from 'react';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import Link from 'next/link';

import { useDoc, useFirestore, useMemoFirebase, usePaginatedCollection, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  FIFTY_ABOVE_FIFTY_CONTEST_ID,
  updateFiftyAboveFiftySubmissionStatus,
  type FiftyAboveFiftySubmissionStatus,
} from '@/lib/fiftyabove50-actions';
import { isSuperAdmin } from '@/lib/constants';

type Submission = {
  userId: string;
  authorName: string;
  title: string;
  categoryId: string;
  description: string;
  age: number;
  mediaUrl?: string | null;
  photoUrl?: string | null;
  status: FiftyAboveFiftySubmissionStatus;
  voteCount?: number;
  createdAt: any;
};

export default function FiftyAboveFiftyAdminPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [busy, setBusy] = useState<Record<string, true>>({});

  const userRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc<any>(userRef);
  const isAdmin = isSuperAdmin(user?.uid) || !!(userProfile?.isAdmin || userProfile?.userType === 'admin');

  const pendingQuery = useMemoFirebase(() => {
    const col = collection(firestore, 'contests', FIFTY_ABOVE_FIFTY_CONTEST_ID, 'submissions');
    return query(col, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data, isLoading, isLoadingMore, hasMore, loadMore, refresh } =
    usePaginatedCollection<Submission>(pendingQuery, { pageSize: 20 });

  const setStatus = async (id: string, status: FiftyAboveFiftySubmissionStatus) => {
    setBusy((m) => ({ ...m, [id]: true }));
    try {
      await updateFiftyAboveFiftySubmissionStatus(firestore, id, status);
      toast({ title: 'Updated', description: `Submission marked as ${status}.` });
      await refresh();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: e?.message || 'Please try again.' });
    } finally {
      setBusy((m) => {
        const next = { ...m };
        delete next[id];
        return next;
      });
    }
  };

  if (!isAdmin) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>50Above50 — Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">You don&apos;t have access to this page.</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/50above50">Back to event</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">50Above50 — Admin Review</h1>
          <p className="text-muted-foreground">Approve or reject nominations.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void refresh()}>
            Refresh
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/admin">Admin hub</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/50above50">View live page</Link>
          </Button>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Pending submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : data && data.length > 0 ? (
            <div className="space-y-3">
              {data.map((s: any) => (
                <div key={s.id} className="rounded-xl border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="font-semibold">{s.title}</div>
                      <div className="text-xs text-muted-foreground">
                        by {s.authorName} • age {s.age} • category {s.categoryId}
                      </div>
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                      {s.mediaUrl ? (
                        <a className="text-sm text-primary underline" href={s.mediaUrl} target="_blank" rel="noreferrer">
                          View link
                        </a>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">pending</Badge>
                      <Button
                        size="sm"
                        variant="default"
                        disabled={!!busy[s.id]}
                        onClick={() => void setStatus(s.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={!!busy[s.id]}
                        onClick={() => void setStatus(s.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" onClick={() => void loadMore()} disabled={isLoadingMore}>
                    {isLoadingMore ? 'Loading…' : 'Load more'}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No pending submissions.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

