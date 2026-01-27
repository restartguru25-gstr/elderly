'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { createCommunityForum } from '@/lib/community-actions';

const forumSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  description: z.string().min(10, 'Description is too short.'),
  interest: z.string().min(2, 'Interest is required.'),
});

type ForumFormValues = z.infer<typeof forumSchema>;

export function CreateForumDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ForumFormValues>({
    resolver: zodResolver(forumSchema),
    defaultValues: { name: '', description: '', interest: '' },
  });

  const onSubmit = (values: ForumFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    createCommunityForum(firestore, user.uid, { ...values, imageId: 'community-books' })
      .then(() => {
        toast({
          title: 'Forum Created!',
          description: `${values.name} is now live.`,
        });
        form.reset();
        onOpenChange(false);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="gradient" size="lg">
          <PlusCircle className="mr-2 h-5 w-5" aria-hidden />
          Create New Forum
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Community Forum</DialogTitle>
          <DialogDescription>
            Start a new group to connect with others who share your interests.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forum Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Morning Walkers Club" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What is this forum about?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Interest</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Fitness" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" variant="gradient" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              Create Forum
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

