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
  createShopProduct,
  updateShopProduct,
  deleteShopProduct,
  type ShopProduct,
  type ShopProductInput,
} from '@/lib/shop-actions';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Download } from 'lucide-react';

const CATEGORIES = ['Health', 'Comfort', 'Essentials', 'Gifts'];
const IMAGE_IDS = ['product-health-monitor', 'product-shoes', 'product-glasses', 'product-organizer', 'skill-tutoring', 'skill-cooking'];

const seedProducts: ShopProductInput[] = [
  { name: 'Health Monitor Device', price: 2999, originalPrice: 3999, coins: 150, rating: 4.8, reviews: 234, imageId: 'product-health-monitor', category: 'Health' },
  { name: 'Comfortable Walking Shoes', price: 2499, originalPrice: 3499, coins: 125, rating: 4.9, reviews: 189, imageId: 'product-shoes', category: 'Comfort' },
  { name: 'Reading Glasses Set', price: 899, originalPrice: 1299, coins: 50, rating: 4.7, reviews: 156, imageId: 'product-glasses', category: 'Essentials' },
  { name: 'Medication Organizer', price: 599, originalPrice: 899, coins: 30, rating: 4.9, reviews: 312, imageId: 'product-organizer', category: 'Health' },
];

const emptyForm: ShopProductInput = {
  name: '',
  price: 0,
  originalPrice: 0,
  coins: 0,
  rating: 4.5,
  reviews: 0,
  imageId: 'product-health-monitor',
  category: 'Health',
};

export default function AdminShopPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [busy, setBusy] = useState<Record<string, true>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<ShopProduct | null>(null);
  const [form, setForm] = useState<ShopProductInput>(emptyForm);

  const q = useMemoFirebase(
    () => query(collection(firestore, 'shopProducts'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const { data, isLoading, isLoadingMore, hasMore, loadMore, refresh } =
    usePaginatedCollection<ShopProduct>(q, { pageSize: 20 });

  const resetForm = useCallback(() => {
    setForm(emptyForm);
    setEditing(null);
  }, []);

  const openAdd = useCallback(() => {
    resetForm();
    setAddOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((p: ShopProduct) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      coins: p.coins,
      rating: p.rating,
      reviews: p.reviews,
      imageId: p.imageId,
      category: p.category,
    });
    setAddOpen(false);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!form.name.trim()) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Name is required.' });
      return;
    }
    setBusy((b) => ({ ...b, create: true }));
    try {
      await createShopProduct(firestore, form);
      toast({ title: 'Created', description: 'Product added.' });
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
      await updateShopProduct(firestore, editing.id, form);
      toast({ title: 'Updated', description: 'Product updated.' });
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
      if (!confirm('Delete this product? This cannot be undone.')) return;
      setBusy((b) => ({ ...b, [id]: true }));
      try {
        await deleteShopProduct(firestore, id);
        toast({ title: 'Deleted', description: 'Product removed.' });
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
      toast({ variant: 'destructive', title: 'Seed', description: 'Seed only when there are no products.' });
      return;
    }
    setBusy((b) => ({ ...b, seed: true }));
    try {
      for (const p of seedProducts) await createShopProduct(firestore, p);
      toast({ title: 'Seeded', description: `Added ${seedProducts.length} default products.` });
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
          <h1 className="text-3xl font-bold">Shop products</h1>
          <p className="text-muted-foreground">Manage ElderLink Shop products.</p>
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
                <Plus className="h-4 w-4" /> Add product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
              <DialogHeader>
                <DialogTitle>Add product</DialogTitle>
                <DialogDescription>Product details for the shop.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="e.g. Health Monitor Device"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
                  <Label>Coins</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.coins || ''}
                    onChange={(e) => setForm((f) => ({ ...f, coins: Number(e.target.value) || 0 }))}
                  />
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
                  <Label>Category</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
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
          <CardHeader><CardTitle>Edit product</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Price (₹)</Label>
              <Input type="number" min={0} value={form.price || ''} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))} />
            </div>
            <div className="grid gap-2">
              <Label>Original (₹)</Label>
              <Input type="number" min={0} value={form.originalPrice || ''} onChange={(e) => setForm((f) => ({ ...f, originalPrice: Number(e.target.value) || 0 }))} />
            </div>
            <div className="grid gap-2">
              <Label>Coins</Label>
              <Input type="number" min={0} value={form.coins || ''} onChange={(e) => setForm((f) => ({ ...f, coins: Number(e.target.value) || 0 }))} />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2 sm:col-span-2">
              <Button size="sm" onClick={() => void handleUpdate()} disabled={!!busy[editing.id]}>
                {busy[editing.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEditing(null); resetForm(); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2">
        <CardHeader><CardTitle>All products</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : !data || data.length === 0 ? (
            <p className="text-muted-foreground">No products yet. Add one above.</p>
          ) : (
            <div className="space-y-3">
              {data.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-muted-foreground">{p.category} · ₹{p.price} · {p.coins} coins</div>
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
