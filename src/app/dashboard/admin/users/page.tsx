'use client';

import { useMemo, useState, useCallback } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

import { useFirestore, useMemoFirebase, usePaginatedCollection } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfileAsAdmin } from '@/lib/admin-actions';
import type { AdminUserProfileUpdate } from '@/lib/admin-actions';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';

type UserRow = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userType?: string;
  isAdmin?: boolean;
  createdAt?: unknown;
};

const USER_TYPES: { value: AdminUserProfileUpdate['userType']; label: string }[] = [
  { value: 'senior', label: 'Senior' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'provider', label: 'Provider' },
  { value: 'admin', label: 'Admin' },
];

function matchSearch(u: UserRow, q: string): boolean {
  const s = (q || '').toLowerCase().trim();
  if (!s) return true;
  const email = (u.email ?? '').toLowerCase();
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ').toLowerCase();
  return email.includes(s) || name.includes(s);
}

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<Record<string, true>>({});

  const usersQuery = useMemoFirebase(() => {
    const col = collection(firestore, 'users');
    return query(col, orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data, isLoading, isLoadingMore, hasMore, loadMore, refresh } =
    usePaginatedCollection<UserRow>(usersQuery, { pageSize: 20 });

  const filtered = useMemo(() => {
    const list = data ?? [];
    return search.trim() ? list.filter((u) => matchSearch(u, search)) : list;
  }, [data, search]);

  const save = useCallback(
    async (userId: string, patch: AdminUserProfileUpdate) => {
      setBusy((b) => ({ ...b, [userId]: true }));
      try {
        await updateUserProfileAsAdmin(firestore, userId, patch);
        toast({ title: 'Saved', description: 'User profile updated.' });
        await refresh();
      } catch (e: any) {
        toast({
          variant: 'destructive',
          title: 'Update failed',
          description: e?.message ?? 'Please try again.',
        });
      } finally {
        setBusy((b) => {
          const next = { ...b };
          delete next[userId];
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
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage roles and admin flags.</p>
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground">No users found.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border p-3 sm:gap-4"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="font-medium">
                      {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                    </div>
                    <div className="text-xs text-muted-foreground">{u.email ?? u.id}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={u.userType ?? 'guardian'}
                      onValueChange={(v) =>
                        save(u.id, { userType: v as AdminUserProfileUpdate['userType'] })
                      }
                      disabled={!!busy[u.id]}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_TYPES.map((t) => (
                          <SelectItem key={t.value!} value={t.value!}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Admin</span>
                      <Switch
                        checked={!!u.isAdmin}
                        onCheckedChange={(v) => save(u.id, { isAdmin: !!v })}
                        disabled={!!busy[u.id]}
                      />
                    </div>
                    {busy[u.id] && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
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
