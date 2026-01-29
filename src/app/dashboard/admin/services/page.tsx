'use client';

import { useMemo, useState, useCallback } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

import { useFirestore, useMemoFirebase, usePaginatedCollection } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  createServiceProvider,
  updateServiceProvider,
  deleteServiceProvider,
  type ServiceProvider,
  type ServiceProviderInput,
} from '@/lib/service-providers-actions';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

const IMAGE_IDS = ['doctor-avatar-1', 'community-yoga', 'skill-tutoring', 'skill-cooking', 'community-gardening'];

const emptyForm: ServiceProviderInput = {
  name: '',
  type: '',
  description: '',
  contact: '',
  imageId: null,
};

export default function AdminServicesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [busy, setBusy] = useState<Record<string, true>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceProvider | null>(null);
  const [form, setForm] = useState<ServiceProviderInput>(emptyForm);

  const q = useMemoFirebase(
    () => query(collection(firestore, 'serviceProviders'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const { data, isLoading, isLoadingMore, hasMore, loadMore, refresh } =
    usePaginatedCollection<ServiceProvider>(q, { pageSize: 20 });

  const resetForm = useCallback(() => {
    setForm(emptyForm);
    setEditing(null);
  }, []);

  const openAdd = useCallback(() => {
    resetForm();
    setAddOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((p: ServiceProvider) => {
    setEditing(p);
    setForm({
      name: p.name,
      type: p.type,
      description: p.description,
      contact: p.contact ?? '',
      imageId: p.imageId ?? null,
    });
    setAddOpen(false);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!form.name.trim() || !form.type.trim() || !form.description.trim()) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Name, type, and description are required.' });
      return;
    }
    setBusy((b) => ({ ...b, create: true }));
    try {
      await createServiceProvider(firestore, { ...form, contact: form.contact || null, imageId: form.imageId || null });
      toast({ title: 'Created', description: 'Service provider added.' });
      setAddOpen(false);
      resetForm();
      await refresh();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Create failed', description: e?.message ?? 'Try again.' });
    } finally {
      setBusy((b) => { const n = { ...b }; delete n.create; return n; });
    }
  }, [firestore, form, toast, resetForm, refresh]);

  const handleUpdate = useCallback(async () => {
    if (!editing) return;
    setBusy((b) => ({ ...b, [editing.id]: true }));
    try {
      await updateServiceProvider(firestore, editing.id, { ...form, contact: form.contact || null, imageId: form.imageId || null });
      toast({ title: 'Updated', description: 'Service provider updated.' });
      setEditing(null);
      resetForm();
      await refresh();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: e?.message ?? 'Try again.' });
    } finally {
      setBusy((b) => { const n = { ...b }; delete n[editing.id]; return n; });
    }
  }, [firestore, editing, form, toast, resetForm, refresh]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Delete this service provider? This cannot be undone.')) return;
      setBusy((b) => ({ ...b, [id]: true }));
      try {
        await deleteServiceProvider(firestore, id);
        toast({ title: 'Deleted', description: 'Service provider removed.' });
        if (editing?.id === id) { setEditing(null); resetForm(); }
        await refresh();
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'Delete failed', description: e?.message ?? 'Try again.' });
      } finally {
        setBusy((b) => { const n = { ...b }; delete n[id]; return n; });
      }
    },
    [firestore, toast, refresh, editing, resetForm]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service providers</h1>
          <p className="text-muted-foreground">Manage home nursing, physiotherapy, and other services.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void refresh()}>Refresh</Button>
          <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openAdd} className="gap-2">
                <Plus className="h-4 w-4" /> Add provider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
              <DialogHeader>
                <DialogTitle>Add service provider</DialogTitle>
                <DialogDescription>Name, type, description, and optional contact.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="e.g. CareAtHome Nursing"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Input
                    placeholder="e.g. Home Nursing, Physiotherapy"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Short description of the service"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Contact (phone / email)</Label>
                  <Input
                    placeholder="Optional"
                    value={form.contact ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Image ID</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.imageId ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, imageId: e.target.value || null }))}
                  >
                    <option value="">— None —</option>
                    {IMAGE_IDS.map((id) => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={() => void handleCreate()} disabled={!!busy.create}>
                  {busy.create && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/admin" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Admin
            </Link>
          </Button>
        </div>
      </div>

      {editing && (
        <Card className="border-2 border-primary/30">
          <CardHeader><CardTitle>Edit service provider</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Input value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid gap-2">
              <Label>Contact</Label>
              <Input value={form.contact ?? ''} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Image ID</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.imageId ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, imageId: e.target.value || null }))}
              >
                <option value="">— None —</option>
                {IMAGE_IDS.map((id) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => void handleUpdate()} disabled={!!busy[editing.id]}>
                {busy[editing.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEditing(null); resetForm(); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2">
        <CardHeader><CardTitle>All service providers</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : !data || data.length === 0 ? (
            <p className="text-muted-foreground">No service providers yet. Add one above.</p>
          ) : (
            <div className="space-y-3">
              {data.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-muted-foreground">{p.type}</div>
                    {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(p)} disabled={!!busy[p.id]}>
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-2" disabled={!!busy[p.id]} onClick={() => void handleDelete(p.id)}>
                      {busy[p.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
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
