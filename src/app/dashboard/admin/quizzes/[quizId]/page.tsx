'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
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
  getQuiz,
  getQuizQuestions,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
} from '@/lib/quiz-actions';
import type { QuizQuestion } from '@/lib/quiz-types';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

export default function AdminQuizQuestionsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = React.use(params);
  const firestore = useFirestore();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<any>(null);
  const [busy, setBusy] = useState<Record<string, true>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<(QuizQuestion & { id: string }) | null>(null);
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formOptions, setFormOptions] = useState('');
  const [formCorrectIndex, setFormCorrectIndex] = useState(0);
  const [formOrder, setFormOrder] = useState(0);

  const questionsQuery = useMemoFirebase(
    () =>
      quizId
        ? query(
            collection(firestore, 'quizzes', quizId, 'questions'),
            orderBy('order', 'asc')
          )
        : null,
    [firestore, quizId]
  );
  const { data: rawQuestions, isLoading, refresh } = useCollection(questionsQuery);
  const questions = useMemo(
    () => (rawQuestions ? rawQuestions.map((q: any) => ({ id: q.id, ...q })) : []),
    [rawQuestions]
  );

  useEffect(() => {
    if (!firestore || !quizId) return;
    getQuiz(firestore, quizId).then(setQuiz);
  }, [firestore, quizId]);

  const resetForm = useCallback(() => {
    setFormQuestionText('');
    setFormOptions('');
    setFormCorrectIndex(0);
    setFormOrder(questions.length);
    setEditing(null);
  }, [questions.length]);

  const openAdd = useCallback(() => {
    resetForm();
    setFormOrder(questions.length);
    setAddOpen(true);
  }, [resetForm, questions.length]);

  const openEdit = useCallback((q: QuizQuestion & { id: string }) => {
    setEditing(q);
    setFormQuestionText(q.questionText);
    setFormOptions(Array.isArray(q.options) ? q.options.join('\n') : '');
    setFormCorrectIndex(q.correctIndex ?? 0);
    setFormOrder(q.order ?? 0);
    setAddOpen(false);
  }, []);

  const getOptionsArray = () =>
    formOptions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

  const handleCreate = useCallback(async () => {
    const opts = getOptionsArray();
    if (!formQuestionText.trim() || opts.length < 2) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Question text and at least 2 options are required.' });
      return;
    }
    if (formCorrectIndex < 0 || formCorrectIndex >= opts.length) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Correct answer index must be between 0 and options length - 1.' });
      return;
    }
    setBusy((b) => ({ ...b, create: true }));
    try {
      await createQuizQuestion(firestore, quizId, {
        questionText: formQuestionText.trim(),
        options: opts,
        correctIndex: formCorrectIndex,
        order: formOrder,
      });
      toast({ title: 'Created', description: 'Question added.' });
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
  }, [firestore, quizId, formQuestionText, formOptions, formCorrectIndex, formOrder, toast, resetForm, refresh]);

  const handleUpdate = useCallback(async () => {
    if (!editing) return;
    const opts = getOptionsArray();
    if (!formQuestionText.trim() || opts.length < 2) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Question text and at least 2 options are required.' });
      return;
    }
    if (formCorrectIndex < 0 || formCorrectIndex >= opts.length) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Correct answer index must be valid.' });
      return;
    }
    setBusy((b) => ({ ...b, [editing.id]: true }));
    try {
      await updateQuizQuestion(firestore, quizId, editing.id, {
        questionText: formQuestionText.trim(),
        options: opts,
        correctIndex: formCorrectIndex,
        order: formOrder,
      });
      toast({ title: 'Updated', description: 'Question updated.' });
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
  }, [firestore, quizId, editing, formQuestionText, formOptions, formCorrectIndex, formOrder, toast, resetForm, refresh]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Delete this question?')) return;
      setBusy((b) => ({ ...b, [id]: true }));
      try {
        await deleteQuizQuestion(firestore, quizId, id);
        toast({ title: 'Deleted', description: 'Question removed.' });
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
    [firestore, quizId, toast, refresh, editing, resetForm]
  );

  if (!quiz && !isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/admin/quizzes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Link>
        </Button>
        <Card className="border-2">
          <CardContent className="py-12 text-center text-muted-foreground">
            Quiz not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/admin/quizzes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{quiz?.title ?? 'Quiz'} — Questions</h1>
          <p className="text-muted-foreground">Add, edit, or remove questions. Correct answer index is 0-based.</p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Questions ({questions.length})</CardTitle>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Question</DialogTitle>
                <DialogDescription>One question per line for options. Correct index: 0 = first option.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Question text</Label>
                  <Input value={formQuestionText} onChange={(e) => setFormQuestionText(e.target.value)} placeholder="What is the capital of India?" />
                </div>
                <div>
                  <Label>Options (one per line)</Label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formOptions}
                    onChange={(e) => setFormOptions(e.target.value)}
                    placeholder="Mumbai\nDelhi\nKolkata\nChennai"
                  />
                </div>
                <div>
                  <Label>Correct answer index (0-based)</Label>
                  <Input type="number" min={0} value={formCorrectIndex} onChange={(e) => setFormCorrectIndex(Number(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Order</Label>
                  <Input type="number" min={0} value={formOrder} onChange={(e) => setFormOrder(Number(e.target.value) || 0)} />
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
            <p className="text-muted-foreground py-8 text-center">No questions yet. Add one to get started.</p>
          ) : (
            <div className="space-y-2">
              {questions.map((q: QuizQuestion & { id: string }, idx: number) => (
                <div key={q.id} className="flex items-start justify-between rounded-lg border p-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">Q{idx + 1}: {q.questionText}</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {Array.isArray(q.options) ? q.options.join(' · ') : ''} → Correct: index {q.correctIndex}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(q)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)} disabled={!!busy[q.id]}>
                      {busy[q.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
              <DialogTitle>Edit Question</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Question text</Label>
                <Input value={formQuestionText} onChange={(e) => setFormQuestionText(e.target.value)} />
              </div>
              <div>
                <Label>Options (one per line)</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formOptions}
                  onChange={(e) => setFormOptions(e.target.value)}
                />
              </div>
              <div>
                <Label>Correct answer index (0-based)</Label>
                <Input type="number" min={0} value={formCorrectIndex} onChange={(e) => setFormCorrectIndex(Number(e.target.value) || 0)} />
              </div>
              <div>
                <Label>Order</Label>
                <Input type="number" min={0} value={formOrder} onChange={(e) => setFormOrder(Number(e.target.value) || 0)} />
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
