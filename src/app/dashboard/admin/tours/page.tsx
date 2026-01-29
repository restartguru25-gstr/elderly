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
  createTour,
  updateTour,
  deleteTour,
  type Tour,
  type TourInput,
} from '@/lib/tours-actions';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Download } from 'lucide-react';

const TRANSPORT_OPTIONS: { value: TourInput['transport']; label: string }[] = [
  { value: 'Plane', label: 'Plane' },
  { value: 'Train', label: 'Train' },
  { value: 'Bus', label: 'Bus' },
];

const seedTours: TourInput[] = [
  { title: 'Golden Triangle Tour', location: 'Delhi, Agra, Jaipur', duration: '5 Days / 4 Nights', price: 25000, originalPrice: 30000, imageId: 'travel-golden-triangle', transport: 'Plane', rating: 4.8, reviews: 125, features: ['Comfortable A/C coach', 'Senior-friendly itinerary', 'Trained team assistance'] },
  { title: 'Kerala Backwaters', location: 'Kochi, Alleppey, Munnar', duration: '6 Days / 5 Nights', price: 32000, originalPrice: 38000, imageId: 'travel-kerala', transport: 'Train', rating: 4.9, reviews: 98, features: ['Scenic train journey', 'Houseboat stay', 'Gentle pace'] },
  { title: 'Himalayan Retreat', location: 'Shimla, Manali', duration: '7 Days / 6 Nights', price: 28000, originalPrice: 35000, imageId: 'travel-himalayas', transport: 'Bus', rating: 4.7, reviews: 87, features: ['Mountain views', 'Cool climate', 'Relaxing pace'] },
];

const IMAGE_IDS = ['travel-golden-triangle', 'travel-kerala', 'travel-himalayas', 'community-gardening', 'community-yoga'];

const emptyForm: Omit<TourInput, 'features'> & { features: string } = {
  title: '',
  location: '',
  duration: '',
  price: 0,
  originalPrice: 0,
  imageId: 'travel-golden-triangle',
  transport: 'Bus',
  rating: 4.5,
  reviews: 0,
  features: '',
};

function formToInput(f: typeof emptyForm): TourInput {
  return {
    ...f,
    features: f.features.split('\n').map((s) => s.trim()).filter(Boolean),
  };
}

export default function AdminToursPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [busy, setBusy] = useState<Record<string, true>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Tour | null>(null);
  const [form, setForm] = useState(emptyForm);

  const q = useMemoFirebase(
    () => query(collection(firestore, 'tours'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const { data, isLoading, isLoadingMore, hasMore, loadMore, refresh } =
    usePaginatedCollection<Tour>(q, { pageSize: 20 });

  const resetForm = useCallback(() => {
    setForm(emptyForm);
    setEditing(null);
  }, []);

  const openAdd = useCallback(() => {
    resetForm();
    setAddOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((t: Tour) => {
    setEditing(t);
    setForm({
      title: t.title,
      location: t.location,
      duration: t.duration,
      price: t.price,
      originalPrice: t.originalPrice,
      imageId: t.imageId,
      transport: t.transport,
      rating: t.rating,
      reviews: t.reviews,
      features: (t.features || []).join('\n'),
    });
    setAddOpen(false);
  }, []);

  const handleCreate = useCallback(async () => {
    const input = formToInput(form);
    if (!input.title.trim()) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Title is required.' });
      return;
    }
    setBusy((b) => ({ ...b, create: true }));
    try {
      await createTour(firestore, input);
      toast({ title: 'Created', description: 'Tour added.' });
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
    const input = formToInput(form);
    setBusy((b) => ({ ...b, [editing.id]: true }));
    try {
      await updateTour(firestore, editing.id, input);
      toast({ title: 'Updated', description: 'Tour updated.' });
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
      if (!confirm('Delete this tour? This cannot be undone.')) return;
      setBusy((b) => ({ ...b, [id]: true }));
      try {
        await deleteTour(firestore, id);
        toast({ title: 'Deleted', description: 'Tour removed.' });
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

  const handleSeed = useCallback(async () => {
    if (!(data?.length === 0)) {
      toast({ variant: 'destructive', title: 'Seed', description: 'Seed only when there are no tours.' });
      return;
    }
    setBusy((b) => ({ ...b, seed: true }));
    try {
      for (const t of seedTours) await createTour(firestore, t);
      toast({ title: 'Seeded', description: `Added ${seedTours.length} default tours.` });
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
          <h1 className="text-3xl font-bold">Tours</h1>
          <p className="text-muted-foreground">Manage tour packages.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void refresh()}>Refresh</Button>
          {data?.length === 0 && (
            <Button variant="secondary" size="sm" className="gap-2" onClick={() => void handleSeed()} disabled={!!busy.seed}>
              {busy.seed ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Seed defaults
            </Button>
          )}
          <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openAdd} className="gap-2">
                <Plus className="h-4 w-4" /> Add tour
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
              <DialogHeader>
                <DialogTitle>Add tour</DialogTitle>
                <DialogDescription>Tour package details.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g. Golden Triangle Tour"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g. Delhi, Agra, Jaipur"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Duration</Label>
                  <Input
                    placeholder="e.g. 5 Days / 4 Nights"
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.price || ''}
                      onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Original price (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.originalPrice || ''}
                      onChange={(e) => setForm((f) => ({ ...f, originalPrice: Number(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Image ID</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.imageId}
                    onChange={(e) => setForm((f) => ({ ...f, imageId: e.target.value }))}
                  >
                    {IMAGE_IDS.map((id) => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Transport</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.transport}
                    onChange={(e) => setForm((f) => ({ ...f, transport: e.target.value as TourInput['transport'] }))}
                  >
                    {TRANSPORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Rating</Label>
                    <Input
                      type="number"
                      min={0}
                      max={5}
                      step={0.1}
                      value={form.rating || ''}
                      onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Reviews count</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.reviews || ''}
                      onChange={(e) => setForm((f) => ({ ...f, reviews: Number(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Features (one per line)</Label>
                  <Textarea
                    placeholder="Comfortable A/C coach&#10;Senior-friendly itinerary"
                    value={form.features}
                    onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                    rows={3}
                  />
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
          <CardHeader><CardTitle>Edit tour</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Duration</Label>
              <Input value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Price (₹)</Label>
                <Input type="number" min={0} value={form.price || ''} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))} />
              </div>
              <div className="grid gap-2">
                <Label>Original (₹)</Label>
                <Input type="number" min={0} value={form.originalPrice || ''} onChange={(e) => setForm((f) => ({ ...f, originalPrice: Number(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Image ID</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.imageId}
                onChange={(e) => setForm((f) => ({ ...f, imageId: e.target.value }))}
              >
                {IMAGE_IDS.map((id) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Transport</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.transport}
                onChange={(e) => setForm((f) => ({ ...f, transport: e.target.value as TourInput['transport'] }))}
              >
                {TRANSPORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Rating</Label>
                <Input type="number" min={0} max={5} step={0.1} value={form.rating || ''} onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) || 0 }))} />
              </div>
              <div className="grid gap-2">
                <Label>Reviews</Label>
                <Input type="number" min={0} value={form.reviews || ''} onChange={(e) => setForm((f) => ({ ...f, reviews: Number(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Features (one per line)</Label>
              <Textarea value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} rows={3} />
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
        <CardHeader><CardTitle>All tours</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : !data || data.length === 0 ? (
            <p className="text-muted-foreground">No tours yet. Add one above.</p>
          ) : (
            <div className="space-y-3">
              {data.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-sm text-muted-foreground">{t.location} · {t.duration} · ₹{t.price}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(t)} disabled={!!busy[t.id]}>
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-2" disabled={!!busy[t.id]} onClick={() => void handleDelete(t.id)}>
                      {busy[t.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
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
