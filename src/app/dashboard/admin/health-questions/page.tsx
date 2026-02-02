'use client';

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { collection, query, orderBy } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  createHealthQuestion,
  updateHealthQuestion,
  deleteHealthQuestion,
  listHealthQuestions,
} from '@/lib/health-questions-actions';
import type { HealthQuestion, HealthQuestionType } from '@/lib/health-checkin-types';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

const QUESTION_TYPES: { value: HealthQuestionType; label: string }[] = [
  { value: 'yes_no_sometimes', label: 'Yes / No / Sometimes' },
  { value: 'mcq_3', label: '3-option MCQ' },
  { value: 'emoji_scale', label: 'Emoji scale (🙂 😐 🙁)' },
];

export default function AdminHealthQuestionsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [busy, setBusy] = useState<Record<string, true>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<(HealthQuestion & { id: string }) | null>(null);
  const [formDay, setFormDay] = useState(1);
  const [formText, setFormText] = useState('');
  const [formType, setFormType] = useState<HealthQuestionType>('yes_no_sometimes');
  const [formOptions, setFormOptions] = useState('');
  const [formShowIfQuestionId, setFormShowIfQuestionId] = useState('');
  const [formShowIfAnswer, setFormShowIfAnswer] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formOrder, setFormOrder] = useState(0);

  const q = useMemoFirebase(
    () => query(collection(firestore, 'healthQuestions'), orderBy('day', 'asc'), orderBy('order', 'asc')),
    [firestore]
  );
  const { data: rawData, isLoading, refresh } = useCollection(q);
  const questions = useMemo(() => {
    if (!rawData) return [];
    return rawData.map((d: any) => ({ id: d.id, ...d }));
  }, [rawData]);

  const resetForm = useCallback(() => {
    setFormDay(1);
    setFormText('');
    setFormType('yes_no_sometimes');
    setFormOptions('');
    setFormShowIfQuestionId('');
    setFormShowIfAnswer('');
    setFormEnabled(true);
    setFormOrder(0);
    setEditing(null);
  }, []);

  const openAdd = useCallback(() => {
    resetForm();
    setAddOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((hq: HealthQuestion & { id: string }) => {
    setEditing(hq);
    setFormDay(hq.day);
    setFormText(hq.questionText);
    setFormType(hq.type);
    setFormOptions(Array.isArray(hq.options) ? hq.options.join(', ') : '');
    setFormShowIfQuestionId(hq.showIfQuestionId || '');
    setFormShowIfAnswer(hq.showIfAnswer || '');
    setFormEnabled(hq.enabled !== false);
    setFormOrder(hq.order ?? 0);
    setAddOpen(false);
  }, [resetForm]);

  const getOptionsArray = (): string[] => {
    if (formType === 'yes_no_sometimes') return ['Yes', 'No', 'Sometimes'];
    if (formType === 'emoji_scale') return ['🙂', '😐', '🙁'];
    return formOptions.split(',').map((s) => s.trim()).filter(Boolean);
  };

  const handleCreate = useCallback(async () => {
    if (!formText.trim()) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Question text is required.' });
      return;
    }
    setBusy((b) => ({ ...b, create: true }));
    try {
      await createHealthQuestion(firestore, {
        day: formDay,
        questionText: formText.trim(),
        type: formType,
        options: getOptionsArray(),
        showIfQuestionId: formShowIfQuestionId || undefined,
        showIfAnswer: formShowIfAnswer || undefined,
        enabled: formEnabled,
        order: formOrder,
      });
      toast({ title: 'Created', description: 'Health question added.' });
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
  }, [firestore, formDay, formText, formType, formOptions, formShowIfQuestionId, formShowIfAnswer, formEnabled, formOrder, toast, resetForm, refresh]);

  const handleUpdate = useCallback(async () => {
    if (!editing) return;
    if (!formText.trim()) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Question text is required.' });
      return;
    }
    setBusy((b) => ({ ...b, [editing.id]: true }));
    try {
      await updateHealthQuestion(firestore, editing.id, {
        day: formDay,
        questionText: formText.trim(),
        type: formType,
        options: getOptionsArray(),
        showIfQuestionId: formShowIfQuestionId || undefined,
        showIfAnswer: formShowIfAnswer || undefined,
        enabled: formEnabled,
        order: formOrder,
      });
      toast({ title: 'Updated', description: 'Health question updated.' });
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
  }, [firestore, editing, formDay, formText, formType, formOptions, formShowIfQuestionId, formShowIfAnswer, formEnabled, formOrder, toast, resetForm, refresh]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Delete this health question? This cannot be undone.')) return;
      setBusy((b) => ({ ...b, [id]: true }));
      try {
        await deleteHealthQuestion(firestore, id);
        toast({ title: 'Deleted', description: 'Health question removed.' });
        setEditing(null);
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
    [firestore, toast, refresh]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Daily Health Questions</h1>
          <p className="text-muted-foreground">Schedule wellness questions (2–3 per day, 15–20 days).</p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Questions</CardTitle>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Health Question</DialogTitle>
                <DialogDescription>Questions are asked progressively by day (1–20).</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Day (1–20)</Label>
                  <Input type="number" min={1} max={20} value={formDay} onChange={(e) => setFormDay(Number(e.target.value) || 1)} />
                </div>
                <div>
                  <Label>Question text</Label>
                  <Input value={formText} onChange={(e) => setFormText(e.target.value)} placeholder="How are you feeling today?" />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={formType} onValueChange={(v: HealthQuestionType) => setFormType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formType === 'mcq_3' && (
                  <div>
                    <Label>Options (comma-separated)</Label>
                    <Input value={formOptions} onChange={(e) => setFormOptions(e.target.value)} placeholder="Option 1, Option 2, Option 3" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Show only if question ID</Label>
                    <Input value={formShowIfQuestionId} onChange={(e) => setFormShowIfQuestionId(e.target.value)} placeholder="Optional" />
                  </div>
                  <div>
                    <Label>... had answer</Label>
                    <Input value={formShowIfAnswer} onChange={(e) => setFormShowIfAnswer(e.target.value)} placeholder="e.g. Yes" />
                  </div>
                </div>
                <div>
                  <Label>Order</Label>
                  <Input type="number" min={0} value={formOrder} onChange={(e) => setFormOrder(Number(e.target.value) || 0)} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formEnabled} onCheckedChange={setFormEnabled} />
                  <Label>Enabled</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!!busy.create}>
                  {busy.create ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading && questions.length === 0 ? (
            <Skeleton className="h-32 w-full" />
          ) : questions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No health questions yet. Add one to get started.</p>
          ) : (
            <div className="space-y-2">
              {questions.map((hq: HealthQuestion & { id: string }) => (
                <div
                  key={hq.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Day {hq.day}</span>
                      {!hq.enabled && <span className="text-xs text-muted-foreground">(disabled)</span>}
                      {hq.showIfQuestionId && (
                        <span className="text-xs text-muted-foreground">
                          (if {hq.showIfQuestionId} = {hq.showIfAnswer})
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground truncate">{hq.questionText}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(hq)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(hq.id)} disabled={!!busy[hq.id]}>
                      {busy[hq.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editing && (
        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Health Question</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Day (1–20)</Label>
                <Input type="number" min={1} max={20} value={formDay} onChange={(e) => setFormDay(Number(e.target.value) || 1)} />
              </div>
              <div>
                <Label>Question text</Label>
                <Input value={formText} onChange={(e) => setFormText(e.target.value)} />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formType} onValueChange={(v: HealthQuestionType) => setFormType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formType === 'mcq_3' && (
                <div>
                  <Label>Options (comma-separated)</Label>
                  <Input value={formOptions} onChange={(e) => setFormOptions(e.target.value)} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Show only if question ID</Label>
                  <Input value={formShowIfQuestionId} onChange={(e) => setFormShowIfQuestionId(e.target.value)} />
                </div>
                <div>
                  <Label>... had answer</Label>
                  <Input value={formShowIfAnswer} onChange={(e) => setFormShowIfAnswer(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Order</Label>
                <Input type="number" min={0} value={formOrder} onChange={(e) => setFormOrder(Number(e.target.value) || 0)} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formEnabled} onCheckedChange={setFormEnabled} />
                <Label>Enabled</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={!!busy[editing.id]}>
                {busy[editing.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
