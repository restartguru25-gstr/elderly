'use client';

import { useMemo, useState, useCallback } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

import { useFirestore, useMemoFirebase, usePaginatedCollection } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  updatePartnerApplicationStatus,
  deletePartnerApplication,
  type PartnerApplication,
  type PartnerApplicationStatus,
} from '@/lib/partner-applications-actions';
import { ArrowLeft, Check, X, Trash2, Loader2, Briefcase } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  doctor: 'Doctor / Telemedicine',
  service_provider: 'Service provider',
  shop: 'Shop',
  other: 'Other',
};

export default function AdminApplicationsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [busy, setBusy] = useState<Record<string, true>>({});

  const q = useMemoFirebase(
    () => query(collection(firestore, 'partnerApplications'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const { data, isLoading, isLoadingMore, hasMore, loadMore, refresh } =
    usePaginatedCollection<PartnerApplication & { id: string }>(q, { pageSize: 20 });

  const setBusyId = useCallback((id: string | null, v: boolean) => {
    setBusy((b) => {
      const next = { ...b };
      if (id) next[id] = v as true;
      return next;
    });
  }, []);

  const handleStatus = useCallback(
    async (id: string, status: PartnerApplicationStatus) => {
      setBusyId(id, true);
      try {
        await updatePartnerApplicationStatus(firestore, id, status);
        toast({ title: 'Updated', description: `Application ${status}.` });
        await refresh();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Update failed.';
        toast({ variant: 'destructive', title: 'Error', description: msg });
      } finally {
        setBusyId(id, false);
      }
    },
    [firestore, toast, refresh, setBusyId]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Delete this application?')) return;
      setBusyId(id, true);
      try {
        await deletePartnerApplication(firestore, id);
        toast({ title: 'Deleted', description: 'Application removed.' });
        await refresh();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Delete failed.';
        toast({ variant: 'destructive', title: 'Error', description: msg });
      } finally {
        setBusyId(id, false);
      }
    },
    [firestore, toast, refresh, setBusyId]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Partner applications
          </h1>
          <p className="text-muted-foreground">
            Applications from doctors, service providers, and shops. Approve or add them manually from Doctors / Services / Shop.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refresh()}>
            Refresh
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/admin">Admin</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : !data || data.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No applications yet.</p>
          ) : (
            <div className="space-y-4">
              {data.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{app.businessName}</span>
                      <Badge variant="secondary">{TYPE_LABELS[app.type] ?? app.type}</Badge>
                      <Badge
                        variant={
                          app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'outline'
                        }
                      >
                        {app.status}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {app.contactName} · {app.email}
                      {app.phone ? ` · ${app.phone}` : ''}
                    </div>
                    {app.message ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{app.message}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {app.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleStatus(app.id, 'approved')}
                          disabled={!!busy[app.id]}
                        >
                          {busy[app.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          <span className="ml-1">Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatus(app.id, 'rejected')}
                          disabled={!!busy[app.id]}
                        >
                          <X className="h-4 w-4" />
                          <span className="ml-1">Reject</span>
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(app.id)}
                      disabled={!!busy[app.id]}
                    >
                      {busy[app.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      <span className="ml-1">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" onClick={() => loadMore()} disabled={isLoadingMore}>
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
