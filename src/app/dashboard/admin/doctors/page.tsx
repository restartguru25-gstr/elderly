'use client';

import { useMemo, useState, useCallback } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

import { useFirestore, useMemoFirebase, usePaginatedCollection } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  createDoctor,
  updateDoctor,
  deleteDoctor,
  type Doctor,
} from '@/lib/doctors-actions';
import { doctors as seedDoctors } from '@/lib/data';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Download } from 'lucide-react';

const DEFAULT_IMAGE_IDS = ['doctor-avatar-1', 'doctor-avatar-2', 'doctor-avatar-3', 'doctor-avatar-4'];

export default function AdminDoctorsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [busy, setBusy] = useState<Record<string, true>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [formName, setFormName] = useState('');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formImageId, setFormImageId] = useState('doctor-avatar-1');

  const q = useMemoFirebase(
    () => query(collection(firestore, 'doctors'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const { data, isLoading, isLoadingMore, hasMore, loadMore, refresh } =
    usePaginatedCollection<Doctor>(q, { pageSize: 20 });

  const resetForm = useCallback(() => {
    setFormName('');
    setFormSpecialty('');
    setFormImageId('doctor-avatar-1');
    setEditing(null);
  }, []);

  const openAdd = useCallback(() => {
    resetForm();
    setAddOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((d: Doctor) => {
    setEditing(d);
    setFormName(d.name);
    setFormSpecialty(d.specialty);
    setFormImageId(d.imageId || 'doctor-avatar-1');
    setAddOpen(false);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!formName.trim() || !formSpecialty.trim()) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Name and specialty are required.' });
      return;
    }
    setBusy((b) => ({ ...b, create: true }));
    try {
      await createDoctor(firestore, { name: formName.trim(), specialty: formSpecialty.trim(), imageId: formImageId || null });
      toast({ title: 'Created', description: 'Doctor added.' });
      setAddOpen(false);
      resetForm();
      await refresh();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Create failed', description: e?.message ?? 'Please try again.' });
    } finally {
      setBusy((b) => {
        const next = { ...b };
        delete next.create;
        return next;
      });
    }
  }, [firestore, formName, formSpecialty, formImageId, toast, resetForm, refresh]);

  const handleUpdate = useCallback(async () => {
    if (!editing || !formName.trim() || !formSpecialty.trim()) return;
    setBusy((b) => ({ ...b, [editing.id]: true }));
    try {
      await updateDoctor(firestore, editing.id, {
        name: formName.trim(),
        specialty: formSpecialty.trim(),
        imageId: formImageId || null,
      });
      toast({ title: 'Updated', description: 'Doctor updated.' });
      setEditing(null);
      resetForm();
      await refresh();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: e?.message ?? 'Please try again.' });
    } finally {
      setBusy((b) => {
        const next = { ...b };
        if (editing) delete next[editing.id];
        return next;
      });
    }
  }, [firestore, editing, formName, formSpecialty, formImageId, toast, resetForm, refresh]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Delete this doctor? This cannot be undone.')) return;
      setBusy((b) => ({ ...b, [id]: true }));
      try {
        await deleteDoctor(firestore, id);
        toast({ title: 'Deleted', description: 'Doctor removed.' });
        if (editing?.id === id) {
          setEditing(null);
          resetForm();
        }
        await refresh();
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'Delete failed', description: e?.message ?? 'Please try again.' });
      } finally {
        setBusy((b) => {
          const next = { ...b };
          delete next[id];
          return next;
        });
      }
    },
    [firestore, toast, refresh, editing, resetForm]
  );

  const handleSeed = useCallback(async () => {
    if (!(data?.length === 0)) {
      toast({ variant: 'destructive', title: 'Seed', description: 'Seed only when there are no doctors.' });
      return;
    }
    setBusy((b) => ({ ...b, seed: true }));
    try {
      for (const d of seedDoctors) {
        await createDoctor(firestore, { name: d.name, specialty: d.specialty, imageId: d.imageId });
      }
      toast({ title: 'Seeded', description: `Added ${seedDoctors.length} default doctors.` });
      await refresh();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Seed failed', description: e?.message ?? 'Try again.' });
    } finally {
      setBusy((b) => { const n = { ...b }; delete n.seed; return n; });
    }
  }, [firestore, data?.length, toast, refresh]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Doctors</h1>
          <p className="text-muted-foreground">Manage telemedicine doctors.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            Refresh
          </Button>
          {data?.length === 0 && (
            <Button variant="secondary" size="sm" className="gap-2" onClick={() => void handleSeed()} disabled={!!busy.seed}>
              {busy.seed ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Seed defaults
            </Button>
          )}
          <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Add doctor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add doctor</DialogTitle>
                <DialogDescription>Name, specialty, and optional image.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Dr. Full Name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Specialty</Label>
                  <Input
                    placeholder="e.g. Cardiologist"
                    value={formSpecialty}
                    onChange={(e) => setFormSpecialty(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Image ID</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formImageId}
                    onChange={(e) => setFormImageId(e.target.value)}
                  >
                    {DEFAULT_IMAGE_IDS.map((id) => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={() => void handleCreate()} disabled={!!busy.create}>
                  {busy.create && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/admin" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Link>
          </Button>
        </div>
      </div>

      {editing && (
        <Card className="border-2 border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle>Edit doctor</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Specialty</Label>
              <Input value={formSpecialty} onChange={(e) => setFormSpecialty(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Image ID</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formImageId}
                onChange={(e) => setFormImageId(e.target.value)}
              >
                {DEFAULT_IMAGE_IDS.map((id) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => void handleUpdate()} disabled={!!busy[editing.id]}>
                {busy[editing.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEditing(null); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2">
        <CardHeader>
          <CardTitle>All doctors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : !data || data.length === 0 ? (
            <p className="text-muted-foreground">No doctors yet. Add one above.</p>
          ) : (
            <div className="space-y-3">
              {data.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
                >
                  <div>
                    <div className="font-medium">{d.name}</div>
                    <div className="text-sm text-muted-foreground">{d.specialty}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(d)}
                      disabled={!!busy[d.id]}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      disabled={!!busy[d.id]}
                      onClick={() => void handleDelete(d.id)}
                    >
                      {busy[d.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Delete
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
