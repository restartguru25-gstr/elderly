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
import { Loader2, PlusCircle, Sparkles, Briefcase, ArrowRight, Star, Palette, BookOpen, Music2 } from 'lucide-react';
import Image from 'next/image';
import {
  usePaginatedCollection,
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

const skillCategories = [
  { id: 'all', label: 'All', icon: Briefcase },
  { id: 'arts', label: 'Arts & Crafts', icon: Palette },
  { id: 'teaching', label: 'Teaching & Tutoring', icon: BookOpen },
  { id: 'music', label: 'Music & Performance', icon: Music2 },
  { id: 'consulting', label: 'Consulting', icon: Briefcase },
];

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
    createSkillListing(firestore, user.uid, authorName, {
      ...values,
      imageId: 'skill-consulting',
    })
      .then(() => {
        toast({
          title: 'Skill Listed! 🎉',
          description: `"${values.title}" is now on the marketplace.`,
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
          <PlusCircle className="mr-2 h-5 w-5" />
          Offer a Skill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Showcase Your Talent</DialogTitle>
          <DialogDescription>
            Share your expertise with the community. Offer tutoring, consulting, or craft lessons.
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
            <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
  const [activeCategory, setActiveCategory] = useState('all');

  const listingsQuery = useMemoFirebase(
    () => query(collection(firestore, 'skillListings'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const {
    data: listings,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = usePaginatedCollection<SkillListing>(listingsQuery, { pageSize: 24 });

  return (
    <div className="space-y-8">
      {/* Hero - Showcase your talent */}
      <Card className="border-2 overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-primary p-4">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                  Skills Marketplace
                </h1>
                <p className="text-muted-foreground max-w-xl">
                  Showcase your talent & win. Share tutoring, consulting, or craft lessons with the community.
                </p>
              </div>
            </div>
            <CreateListingDialog open={isCreateOpen} onOpenChange={setCreateOpen} />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {skillCategories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            className="rounded-xl"
            onClick={() => setActiveCategory(cat.id)}
          >
            <cat.icon className="h-4 w-4 mr-2" />
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Listings grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 grid-mobile-fix w-full">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : listings && listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 grid-mobile-fix w-full">
            {listings.map((skill: WithId<SkillListing>) => {
              const image =
                PlaceHolderImages.find((p) => p.id === skill.imageId) ||
                PlaceHolderImages.find((p) => p.id === 'skill-knitting');
              return (
                <Card
                  key={skill.id}
                  className="overflow-hidden flex flex-col border-2 transition-all duration-300 hover:border-primary hover:shadow-warm group"
                >
                  {image && (
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={image.imageUrl}
                        alt={skill.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={image.imageHint}
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
                        {skill.category}
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{skill.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" />
                      by {skill.authorName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow" />
                  <CardFooter className="pt-0">
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      Connect
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button variant="outline" onClick={() => void loadMore()} disabled={isLoadingMore}>
                {isLoadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card variant="bordered" className="border-dashed">
          <CardContent className="py-16 text-center">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Marketplace is Empty</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Be the first to showcase your talent! Offer a skill and connect with the community.
            </p>
            <CreateListingDialog open={isCreateOpen} onOpenChange={setCreateOpen} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
