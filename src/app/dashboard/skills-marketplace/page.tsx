
'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
import { Loader2, PlusCircle } from 'lucide-react';
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
import { createSkillListing } from '@/lib/skills-actions';
import { WithId } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';

const listingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  category: z.string().min(2, 'Category is required.'),
  description: z.string().min(10, 'Please provide a longer description.'),
});

type ListingFormValues = z.infer<typeof listingSchema>;

type SkillListing = {
  title: string;
  category: string;
  authorId: string;
  authorName: string;
  imageId: string;
  createdAt: any;
};

function CreateListingDialog({
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

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: { title: '', category: '', description: '' },
  });

  const onSubmit = (values: ListingFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    const authorName = user.displayName || `${user.email}`;
    createSkillListing(firestore, user.uid, authorName, { ...values, imageId: 'skill-consulting' }) // Default image
      .then(() => {
        toast({
          title: 'Skill Listed!',
          description: `Your skill "${values.title}" is now on the marketplace.`,
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
          Offer a Skill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Offer Your Skill to the Community</DialogTitle>
          <DialogDescription>
            Share your expertise by creating a new listing in the marketplace.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Beginner's Guide to Gardening" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Arts & Crafts" {...field} />
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
                    <Textarea placeholder="Describe the skill you're offering..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
              Create Listing
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function SkillsMarketplacePage() {
  const firestore = useFirestore();
  const [isCreateOpen, setCreateOpen] = useState(false);

  const listingsQuery = useMemoFirebase(
    () => query(collection(firestore, 'skillListings'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const { data: listings, isLoading } = useCollection<SkillListing>(listingsQuery);
  
  return (
    <div className="space-y-8">
       <div className="flex justify-between items-start">
        <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">
            Skills Marketplace
            </h1>
            <p className="max-w-2xl text-muted-foreground">
            Empower yourself by sharing your lifelong skills. Offer tutoring,
            consulting, or craft lessons to the community.
            </p>
        </div>
        <CreateListingDialog open={isCreateOpen} onOpenChange={setCreateOpen} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
        </div>
      ) : listings && listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((skill: WithId<SkillListing>) => {
            const image = PlaceHolderImages.find((p) => p.id === skill.imageId) || PlaceHolderImages.find(p => p.id === 'skill-knitting');
            return (
                <Card key={skill.id} className="overflow-hidden flex flex-col">
                {image && (
                    <div className="relative h-40 w-full">
                    <Image
                        src={image.imageUrl}
                        alt={skill.title}
                        fill
                        style={{objectFit: 'cover'}}
                        data-ai-hint={image.imageHint}
                    />
                    </div>
                )}
                <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">
                    {skill.category}
                    </Badge>
                    <CardTitle className="text-lg">{skill.title}</CardTitle>
                    <CardDescription>by {skill.authorName}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow" />
                <CardFooter>
                    <Button variant="outline" className="w-full">
                    Connect
                    </Button>
                </CardFooter>
                </Card>
            );
            })}
        </div>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
            <h3 className="text-xl font-semibold">Marketplace is Empty</h3>
            <p className="text-muted-foreground mt-2">Be the first one to offer a skill!</p>
        </div>
      )}
    </div>
  );
}
