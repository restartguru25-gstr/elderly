'use client';

import { useMemo, useState, useCallback } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

import {
  useFirestore,
  useMemoFirebase,
  usePaginatedCollection,
} from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { deleteSkillListing } from '@/lib/admin-actions';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';

type SkillRow = {
  id: string;
  title: string;
  category: string;
  authorId: string;
  authorName?: string | null;
  createdAt?: unknown;
};

export default function AdminSkillsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [busy, setBusy] = useState<Record<string, true>>({});

  const skillsQuery = useMemoFirebase(() => {
    const col = collection(firestore, 'skillListings');
    return query(col, orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data, isLoading, isLoadingMore, hasMore, loadMore, refresh } =
    usePaginatedCollection<SkillRow>(skillsQuery, { pageSize: 20 });

  const remove = useCallback(
    async (skillId: string) => {
      if (!confirm('Remove this skill listing? This cannot be undone.')) return;
      setBusy((b) => ({ ...b, [skillId]: true }));
      try {
        await deleteSkillListing(firestore, skillId);
        toast({ title: 'Removed', description: 'Skill listing deleted.' });
        await refresh();
      } catch (e: any) {
        toast({
          variant: 'destructive',
          title: 'Delete failed',
          description: e?.message ?? 'Please try again.',
        });
      } finally {
        setBusy((b) => {
          const next = { ...b };
          delete next[skillId];
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
          <h1 className="text-3xl font-bold">Skill listings</h1>
          <p className="text-muted-foreground">Moderate and remove marketplace listings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            Refresh
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/admin" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>All listings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : !data || data.length === 0 ? (
            <p className="text-muted-foreground">No skill listings.</p>
          ) : (
            <div className="space-y-3">
              {data.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.category} · {s.authorName ?? s.authorId}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={!!busy[s.id]}
                    onClick={() => void remove(s.id)}
                  >
                    {busy[s.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" aria-hidden />
                        Remove
                      </>
                    )}
                  </Button>
                </div>
              ))}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void loadMore()}
                    disabled={isLoadingMore}
                  >
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
