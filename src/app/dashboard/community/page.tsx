
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2, PlusCircle, Users } from 'lucide-react';
import Image from 'next/image';
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { createCommunityForum } from '@/lib/community-actions';
import { WithId } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const forumSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  description: z.string().min(10, 'Description is too short.'),
  interest: z.string().min(2, 'Interest is required.'),
});

type ForumFormValues = z.infer<typeof forumSchema>;

type CommunityForum = {
  name: string;
  description: string;
  memberIds: string[];
  imageId: string;
  createdAt: any;
};

function CreateForumDialog({
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
    createCommunityForum(firestore, user.uid, { ...values, imageId: 'community-books' }) // Using a default image for now
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
        <Button>
          <PlusCircle className="mr-2" />
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
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
              Create Forum
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ForumCard({ group }: { group: WithId<CommunityForum> }) {
  const image = PlaceHolderImages.find((p) => p.id === group.imageId) || PlaceHolderImages.find(p => p.id === 'community-yoga');

  return (
    <Link href={`/dashboard/community/${group.id}`} className="block hover:shadow-lg transition-shadow rounded-lg">
        <Card key={group.id} className="overflow-hidden flex flex-col h-full">
        {image && (
            <div className="relative h-48 w-full">
            <Image
                src={image.imageUrl}
                alt={group.name}
                fill={true}
                style={{objectFit: 'cover'}}
                data-ai-hint={image.imageHint}
            />
            </div>
        )}
        <CardHeader>
            <CardTitle>{group.name}</CardTitle>
            <CardDescription>{group.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow" />
        <CardFooter className="flex justify-between items-center bg-secondary/40 py-3 px-6">
            <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            {group.memberIds?.length || 0} members
            </div>
            <Button variant="secondary" size="sm">View</Button>
        </CardFooter>
        </Card>
    </Link>
  );
}

export default function CommunityPage() {
  const firestore = useFirestore();
  const [isCreateOpen, setCreateOpen] = useState(false);

  const forumsQuery = useMemoFirebase(
    () => query(collection(firestore, 'communityForums'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const { data: forums, isLoading } = useCollection<CommunityForum>(forumsQuery);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Community Forums
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Connect with like-minded individuals, share your hobbies, and make
            new friends in our interest-based community groups.
          </p>
        </div>
        <CreateForumDialog open={isCreateOpen} onOpenChange={setCreateOpen} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
        </div>
      ) : forums && forums.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forums.map((group) => (
            <ForumCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
            <h3 className="text-xl font-semibold">No Forums Yet</h3>
            <p className="text-muted-foreground mt-2">Be the first one to create a community forum!</p>
        </div>
      )}
    </div>
  );
}

    