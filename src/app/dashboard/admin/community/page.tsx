'use client';

import { useMemo, useState, useCallback } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

import { useFirestore, useMemoFirebase, usePaginatedCollection } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { deleteCommunityForum } from '@/lib/admin-actions';
import { ArrowLeft, Trash2, Loader2, ExternalLink } from 'lucide-react';

type ForumRow = {
  id: string;
  name: string;
  description?: string;
  memberIds?: string[];
  createdAt?: unknown;
};

export default function AdminCommunityPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [busy, setBusy] = useState<Record<string, true>>({});

  const forumsQuery = useMemoFirebase(
    () => query(collection(firestore, 'communityForums'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const { data, isLoading, isLoadingMore, hasMore, loadMore, refresh } =
    usePaginatedCollection<ForumRow>(forumsQuery, { pageSize: 20 });

  const remove = useCallback(
    async (forumId: string) => {
      if (!confirm('Delete this forum? All posts will be lost. This cannot be undone.')) return;
      setBusy((b) => ({ ...b, [forumId]: true }));
      try {
        await deleteCommunityForum(firestore, forumId);
        toast({ title: 'Deleted', description: 'Forum removed.' });
        await refresh();
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'Delete failed', description: e?.message ?? 'Try again.' });
      } finally {
        setBusy((b) => {
          const next = { ...b };
          delete next[forumId];
          return next;
        });
      }
    },
    [firestore, toast, refresh]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community forums</h1>
          <p className="text-muted-foreground">List and moderate forums. Delete only when necessary.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            Refresh
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/admin" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>All forums</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : !data || data.length === 0 ? (
            <p className="text-muted-foreground">No forums yet.</p>
          ) : (
            <div className="space-y-3">
              {data.map((f) => (
                <div
                  key={f.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{f.name}</div>
                    {f.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{f.description}</p>
                    )}
                    {Array.isArray(f.memberIds) && (
                      <p className="text-xs text-muted-foreground">{f.memberIds.length} members</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/community/${f.id}`} className="gap-2" target="_blank" rel="noopener">
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      disabled={!!busy[f.id]}
                      onClick={() => void remove(f.id)}
                    >
                      {busy[f.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" size="sm" onClick={() => void loadMore()} disabled={isLoadingMore}>
                    {isLoadingMore ? 'Loading…' : 'Load more'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
