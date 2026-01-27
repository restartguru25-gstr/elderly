'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useCollection, useFirestore, useMemoFirebase, useStorage, useUser } from '@/firebase';
import { collection, orderBy, query } from 'firebase/firestore';
import { WithId } from '@/firebase/firestore/use-collection';
import { createMemoryEntry } from '@/lib/memory-lane-actions';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, ImageIcon, CalendarDays, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

type MemoryDoc = {
  title: string;
  story: string;
  memoryDate: any;
  photoUrl?: string | null;
  createdAt?: any;
};

const schema = z.object({
  title: z.string().min(2),
  memoryDate: z.string().min(1), // YYYY-MM-DD
  story: z.string().min(10),
});

type FormValues = z.infer<typeof schema>;

export function MemoryTimeline() {
  const t = useTranslations('memoryLane');
  const firestore = useFirestore();
  const storage = useStorage();
  const { user } = useUser();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const memoriesQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, `users/${user.uid}/memories`),
            orderBy('memoryDate', 'desc')
          )
        : null,
    [firestore, user]
  );
  const { data: memories, isLoading } = useCollection<MemoryDoc>(memoriesQuery);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      memoryDate: '',
      story: '',
    },
  });

  const sorted = useMemo(() => memories ?? [], [memories]);

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    setSaving(true);
    try {
      const d = new Date(values.memoryDate + 'T00:00:00');
      await createMemoryEntry(firestore, storage, user.uid, {
        title: values.title,
        story: values.story,
        memoryDate: d,
        photoFile: file,
      });
      toast({ title: t('memorySaved'), description: t('memorySavedDesc') });
      form.reset();
      setFile(null);
      setOpen(false);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: t('memorySaveFailed'),
        description: e instanceof Error ? e.message : t('tryAgain'),
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="border-2 shadow-soft-lg">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-2xl">{t('yourMemories')}</CardTitle>
          <CardDescription>{t('yourMemoriesDesc')}</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('addMemory')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{t('addMemory')}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('memoryTitle')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('memoryTitlePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="memoryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('memoryDate')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="date" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="story"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('memoryStory')}</FormLabel>
                      <FormControl>
                        <Textarea rows={5} placeholder={t('memoryStoryPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>{t('memoryPhotoOptional')}</FormLabel>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="sm:max-w-sm"
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                      <span>{t('memoryPhotoHint')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
                    {t('cancel')}
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {t('saveMemory')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed p-6 text-center text-muted-foreground">
            <p className="font-medium text-foreground">{t('noMemoriesYet')}</p>
            <p className="mt-1 text-sm">{t('noMemoriesDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((m: WithId<MemoryDoc>) => (
              <div key={m.id} className="rounded-xl border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="text-lg font-semibold">{m.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {m.memoryDate ? format(m.memoryDate.toDate(), 'PP') : ''}
                    </div>
                  </div>
                </div>
                {m.photoUrl ? (
                  <div className="mt-3 overflow-hidden rounded-xl border">
                    <Image
                      src={m.photoUrl}
                      alt={m.title}
                      width={1200}
                      height={800}
                      className="h-auto w-full object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                  </div>
                ) : null}
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{m.story}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

