'use client';

import { useMemo, useState, useCallback } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

import { useFirestore, useStorage, useMemoFirebase, useCollection } from '@/firebase';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  uploadSponsorBrandImage,
  SPONSOR_BRAND_IMAGE_SPECS,
} from '@/lib/quiz-actions';
import type { Quiz } from '@/lib/quiz-types';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, ListChecks } from 'lucide-react';

const IMAGE_SPECS = SPONSOR_BRAND_IMAGE_SPECS;
const MAX_SIZE_KB = IMAGE_SPECS.maxFileSizeBytes / 1024;

export default function AdminQuizzesPage() {
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [busy, setBusy] = useState<Record<string, true>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<(Quiz & { id: string }) | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSponsorName, setFormSponsorName] = useState('');
  const [formSponsorBrandName, setFormSponsorBrandName] = useState('');
  const [formSponsorBrandImageUrl, setFormSponsorBrandImageUrl] = useState('');
  const [formSponsorBrandImageFile, setFormSponsorBrandImageFile] = useState<File | null>(null);
  const [formQuizDate, setFormQuizDate] = useState('');
  const [formStatus, setFormStatus] = useState<'live' | 'upcoming'>('live');
  const [formQuestionCount, setFormQuestionCount] = useState(5);

  const q = useMemoFirebase(
    () => query(collection(firestore, 'quizzes'), orderBy('quizDate', 'desc')),
    [firestore]
  );
  const { data: rawData, isLoading } = useCollection(q);
  const quizzes = useMemo(() => (rawData ? rawData.map((d: any) => ({ id: d.id, ...d })) : []), [rawData]);

  const resetForm = useCallback(() => {
    setFormTitle('');
    setFormSponsorName('');
    setFormSponsorBrandName('');
    setFormSponsorBrandImageUrl('');
    setFormSponsorBrandImageFile(null);
    setFormQuizDate(new Date().toISOString().split('T')[0] || '');
    setFormStatus('live');
    setFormQuestionCount(5);
    setEditing(null);
  }, []);

  const openAdd = useCallback(() => {
    resetForm();
    setFormQuizDate(new Date().toISOString().split('T')[0] || '');
    setAddOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((quiz: Quiz & { id: string }) => {
    setEditing(quiz);
    setFormTitle(quiz.title);
    setFormSponsorName(quiz.sponsorName || '');
    setFormSponsorBrandName(quiz.sponsorBrandName || '');
    setFormSponsorBrandImageUrl(quiz.sponsorBrandImageUrl || '');
    setFormSponsorBrandImageFile(null);
    setFormQuizDate(quiz.quizDate || '');
    setFormStatus(quiz.status || 'live');
    setFormQuestionCount(quiz.questionCount ?? 5);
    setAddOpen(false);
  }, []);

  const validateImageFile = useCallback((file: File): string | null => {
    if (!IMAGE_SPECS.allowedTypes.includes(file.type)) {
      return `Use ${IMAGE_SPECS.allowedExtensions.join(', ')}`;
    }
    if (file.size > IMAGE_SPECS.maxFileSizeBytes) {
      return `Max ${MAX_SIZE_KB} KB`;
    }
    return null;
  }, []);

  const handleCreate = useCallback(async () => {
    if (!formTitle.trim()) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Title is required.' });
      return;
    }
    if (formSponsorBrandImageFile) {
      const err = validateImageFile(formSponsorBrandImageFile);
      if (err) {
        toast({ variant: 'destructive', title: 'Invalid image', description: err });
        return;
      }
    }
    setBusy((b) => ({ ...b, create: true }));
    try {
      let imageUrl = formSponsorBrandImageUrl.trim() || undefined;
      if (formSponsorBrandImageFile) {
        imageUrl = await uploadSponsorBrandImage(storage, formSponsorBrandImageFile);
      }
      await createQuiz(firestore, {
        title: formTitle.trim(),
        sponsorName: formSponsorName.trim() || undefined,
        sponsorBrandName: formSponsorBrandName.trim() || undefined,
        sponsorBrandImageUrl: imageUrl,
        quizDate: formQuizDate || new Date().toISOString().split('T')[0]!,
        status: formStatus,
        questionCount: formQuestionCount,
      });
      toast({ title: 'Created', description: 'Quiz added.' });
      setAddOpen(false);
      resetForm();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Create failed', description: e?.message ?? 'Please try again.' });
    } finally {
      setBusy((b) => {
        const next = { ...b };
        delete next.create;
        return next;
      });
    }
  }, [firestore, storage, formTitle, formSponsorName, formSponsorBrandName, formSponsorBrandImageUrl, formSponsorBrandImageFile, formQuizDate, formStatus, formQuestionCount, toast, resetForm, validateImageFile]);

  const handleUpdate = useCallback(async () => {
    if (!editing || !formTitle.trim()) return;
    if (formSponsorBrandImageFile) {
      const err = validateImageFile(formSponsorBrandImageFile);
      if (err) {
        toast({ variant: 'destructive', title: 'Invalid image', description: err });
        return;
      }
    }
    setBusy((b) => ({ ...b, [editing.id]: true }));
    try {
      let imageUrl = formSponsorBrandImageUrl.trim() || undefined;
      if (formSponsorBrandImageFile) {
        imageUrl = await uploadSponsorBrandImage(storage, formSponsorBrandImageFile, editing.id);
      }
      await updateQuiz(firestore, editing.id, {
        title: formTitle.trim(),
        sponsorName: formSponsorName.trim() || undefined,
        sponsorBrandName: formSponsorBrandName.trim() || undefined,
        sponsorBrandImageUrl: imageUrl,
        quizDate: formQuizDate || undefined,
        status: formStatus,
        questionCount: formQuestionCount,
      });
      toast({ title: 'Updated', description: 'Quiz updated.' });
      setEditing(null);
      resetForm();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: e?.message ?? 'Please try again.' });
    } finally {
      setBusy((b) => {
        const next = { ...b };
        if (editing) delete next[editing.id];
        return next;
      });
    }
  }, [firestore, storage, editing, formTitle, formSponsorName, formSponsorBrandName, formSponsorBrandImageUrl, formSponsorBrandImageFile, formQuizDate, formStatus, formQuestionCount, toast, resetForm, validateImageFile]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Delete this quiz and all its questions? This cannot be undone.')) return;
      setBusy((b) => ({ ...b, [id]: true }));
      try {
        await deleteQuiz(firestore, id);
        toast({ title: 'Deleted', description: 'Quiz removed.' });
        if (editing?.id === id) {
          setEditing(null);
          resetForm();
        }
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
    [firestore, toast, editing, resetForm]
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
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">Create and manage topic-based quizzes (5–15 questions each).</p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Quizzes</CardTitle>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Quiz</DialogTitle>
                <DialogDescription>Create a new quiz. Add questions after creating.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Title</Label>
                  <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. General Knowledge" />
                </div>
                <div>
                  <Label>Sponsor (optional)</Label>
                  <Input value={formSponsorName} onChange={(e) => setFormSponsorName(e.target.value)} placeholder="Sponsor name" />
                </div>
                <div>
                  <Label>Sponsor brand name</Label>
                  <Input value={formSponsorBrandName} onChange={(e) => setFormSponsorBrandName(e.target.value)} placeholder="e.g. Acme Corp" />
                </div>
                <div>
                  <Label>Sponsor brand image</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    {IMAGE_SPECS.recommendedWidth}×{IMAGE_SPECS.recommendedHeight} px (square), max {MAX_SIZE_KB} KB. PNG, JPG, WebP.
                  </p>
                  <Input
                    type="file"
                    accept={IMAGE_SPECS.allowedExtensions.join(',')}
                    onChange={(e) => setFormSponsorBrandImageFile(e.target.files?.[0] ?? null)}
                    className="cursor-pointer"
                  />
                  {formSponsorBrandImageFile && (
                    <p className="mt-1 text-xs text-muted-foreground">{formSponsorBrandImageFile.name}</p>
                  )}
                  {!formSponsorBrandImageFile && formSponsorBrandImageUrl && (
                    <p className="mt-1 text-xs text-muted-foreground">Current image set</p>
                  )}
                </div>
                <div>
                  <Label>Quiz date</Label>
                  <Input type="date" value={formQuizDate} onChange={(e) => setFormQuizDate(e.target.value)} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formStatus} onValueChange={(v: 'live' | 'upcoming') => setFormStatus(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Number of questions</Label>
                  <Input type="number" min={5} max={15} value={formQuestionCount} onChange={(e) => setFormQuestionCount(Number(e.target.value) || 5)} />
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
          {isLoading && quizzes.length === 0 ? (
            <Skeleton className="h-32 w-full" />
          ) : quizzes.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No quizzes yet. Add one to get started.</p>
          ) : (
            <div className="space-y-2">
              {quizzes.map((quiz: Quiz & { id: string }) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{quiz.title}</span>
                      <span className="text-xs rounded bg-muted px-2 py-0.5">{quiz.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{quiz.questionCount} questions · {quiz.quizDate}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/admin/quizzes/${quiz.id}`}>
                        <ListChecks className="mr-1 h-4 w-4" />
                        Questions
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(quiz)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(quiz.id)} disabled={!!busy[quiz.id]}>
                      {busy[quiz.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
              <DialogTitle>Edit Quiz</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Title</Label>
                <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
              </div>
              <div>
                <Label>Sponsor (optional)</Label>
                <Input value={formSponsorName} onChange={(e) => setFormSponsorName(e.target.value)} />
              </div>
              <div>
                <Label>Sponsor brand name</Label>
                <Input value={formSponsorBrandName} onChange={(e) => setFormSponsorBrandName(e.target.value)} placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <Label>Sponsor brand image</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {IMAGE_SPECS.recommendedWidth}×{IMAGE_SPECS.recommendedHeight} px (square), max {MAX_SIZE_KB} KB. PNG, JPG, WebP.
                </p>
                <Input
                  type="file"
                  accept={IMAGE_SPECS.allowedExtensions.join(',')}
                  onChange={(e) => setFormSponsorBrandImageFile(e.target.files?.[0] ?? null)}
                  className="cursor-pointer"
                />
                {formSponsorBrandImageFile && (
                  <p className="mt-1 text-xs text-muted-foreground">{formSponsorBrandImageFile.name}</p>
                )}
                {!formSponsorBrandImageFile && formSponsorBrandImageUrl && (
                  <p className="mt-1 text-xs text-muted-foreground">Current image set (upload new to replace)</p>
                )}
              </div>
              <div>
                <Label>Quiz date</Label>
                <Input type="date" value={formQuizDate} onChange={(e) => setFormQuizDate(e.target.value)} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={(v: 'live' | 'upcoming') => setFormStatus(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Number of questions</Label>
                <Input type="number" min={5} max={15} value={formQuestionCount} onChange={(e) => setFormQuestionCount(Number(e.target.value) || 5)} />
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
