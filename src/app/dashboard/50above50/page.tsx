'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Trophy, Calendar, MapPin, ArrowRight, Heart, ShieldCheck } from 'lucide-react';

import { useDoc, useFirestore, useMemoFirebase, usePaginatedCollection, useStorage, useUser } from '@/firebase';
import { collection, doc, orderBy, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  castFiftyAboveFiftyVote,
  createFiftyAboveFiftySubmission,
  FIFTY_ABOVE_FIFTY_CONTEST_ID,
  type FiftyAboveFiftySubmissionStatus,
} from '@/lib/fiftyabove50-actions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { isSuperAdmin } from '@/lib/constants';

const categories = [
  { id: 'singing', name: 'Singing & Music', icon: '🎤' },
  { id: 'dancing', name: 'Dancing', icon: '💃' },
  { id: 'painting', name: 'Painting & Art', icon: '🎨' },
  { id: 'cooking', name: 'Cooking', icon: '👨‍🍳' },
  { id: 'writing', name: 'Writing & Poetry', icon: '✍️' },
  { id: 'photography', name: 'Photography', icon: '📷' },
  { id: 'yoga', name: 'Yoga & Fitness', icon: '🧘' },
  { id: 'crafts', name: 'Arts & Crafts', icon: '🪡' },
  { id: 'comedy', name: 'Comedy', icon: '😂' },
  { id: 'storytelling', name: 'Storytelling', icon: '📖' },
  { id: 'instrument', name: 'Instrumental Music', icon: '🎸' },
  { id: 'classical', name: 'Classical Arts', icon: '🎼' },
  { id: 'folk', name: 'Folk Performance', icon: '🪘' },
  { id: 'acting', name: 'Acting', icon: '🎭' },
  { id: 'mimicry', name: 'Mimicry', icon: '🗣️' },
  { id: 'magic', name: 'Magic', icon: '🪄' },
  { id: 'mehendi', name: 'Mehendi Art', icon: '🖐️' },
  { id: 'rangoli', name: 'Rangoli', icon: '🌸' },
  { id: 'gardening', name: 'Gardening', icon: '🌿' },
  { id: 'fitness', name: 'Fitness', icon: '🏃' },
  { id: 'meditation', name: 'Meditation', icon: '🧠' },
  { id: 'dance-classical', name: 'Classical Dance', icon: '🪩' },
  { id: 'dance-folk', name: 'Folk Dance', icon: '🥁' },
  { id: 'poetry', name: 'Poetry', icon: '📝' },
  { id: 'calligraphy', name: 'Calligraphy', icon: '🖋️' },
  { id: 'public-speaking', name: 'Public Speaking', icon: '🎙️' },
  { id: 'quiz', name: 'Quiz & Trivia', icon: '❓' },
  { id: 'chess', name: 'Chess', icon: '♟️' },
  { id: 'carrom', name: 'Carrom', icon: '🎯' },
  { id: 'tombola', name: 'Tombola', icon: '🎲' },
  { id: 'cooking-baking', name: 'Baking', icon: '🧁' },
  { id: 'cooking-regional', name: 'Regional Cuisine', icon: '🍛' },
  { id: 'handicraft', name: 'Handicraft', icon: '🧵' },
  { id: 'knitting', name: 'Knitting', icon: '🧶' },
  { id: 'recycling', name: 'Best from Waste', icon: '♻️' },
  { id: 'photography-nature', name: 'Nature Photography', icon: '🌄' },
  { id: 'photography-portrait', name: 'Portrait Photography', icon: '🧑‍🦳' },
  { id: 'short-film', name: 'Short Film', icon: '🎬' },
  { id: 'vlog', name: 'Vlog / Content', icon: '📱' },
  { id: 'dance-fusion', name: 'Fusion Dance', icon: '💥' },
  { id: 'singing-devotional', name: 'Devotional Singing', icon: '🕉️' },
  { id: 'singing-folk', name: 'Folk Singing', icon: '🎶' },
  { id: 'instrument-tabla', name: 'Tabla / Percussion', icon: '🥁' },
  { id: 'instrument-harmonium', name: 'Harmonium', icon: '🎹' },
  { id: 'painting-watercolor', name: 'Watercolor', icon: '🖼️' },
  { id: 'painting-sketch', name: 'Sketching', icon: '✏️' },
  { id: 'craft-origami', name: 'Origami', icon: '🦢' },
  { id: 'language', name: 'Language & Literature', icon: '📚' },
  { id: 'dance-bollywood', name: 'Bollywood Dance', icon: '🕺' },
  { id: 'singing-karaoke', name: 'Karaoke', icon: '🎤' },
  { id: 'other', name: 'Other Talent', icon: '✨' },
];

type Submission = {
  userId: string;
  authorName: string;
  title: string;
  categoryId: string;
  description: string;
  age: number;
  mediaUrl?: string | null;
  photoUrl?: string | null;
  status: FiftyAboveFiftySubmissionStatus;
  voteCount?: number;
  createdAt: any;
};

const submissionSchema = z.object({
  categoryId: z.string().min(1, 'Please choose a category.'),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(20, 'Please share at least 20 characters about your entry.'),
  age: z.coerce.number().min(50, 'Age must be 50 or above.'),
  mediaUrl: z
    .string()
    .optional()
    .transform((v) => (v ?? '').trim())
    .refine((v) => v === '' || /^https?:\/\//.test(v), 'Please enter a valid link (starting with http).'),
});

type SubmissionFormValues = z.infer<typeof submissionSchema>;

export default function FiftyAboveFiftyPage() {
  const firestore = useFirestore();
  const storage = useStorage();
  const { user } = useUser();
  const { toast } = useToast();
  const categoriesRef = useRef<HTMLDivElement | null>(null);

  const [isNominateOpen, setNominateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [sort, setSort] = useState<'trending' | 'recent'>('trending');
  const [votedIds, setVotedIds] = useState<Record<string, true>>({});
  const [isVoting, setIsVoting] = useState<Record<string, true>>({});

  const userRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc<{ isAdmin?: boolean; userType?: string }>(userRef);
  const isAdmin = isSuperAdmin(user?.uid) || !!(userProfile?.isAdmin || userProfile?.userType === 'admin');

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { categoryId: '', title: '', description: '', age: 50, mediaUrl: '' },
  });

  const approvedQuery = useMemoFirebase(() => {
    const base = collection(firestore, 'contests', FIFTY_ABOVE_FIFTY_CONTEST_ID, 'submissions');
    if (sort === 'trending') {
      return query(base, where('status', '==', 'approved'), orderBy('voteCount', 'desc'), orderBy('createdAt', 'desc'));
    }
    return query(base, where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
  }, [firestore, sort]);

  const {
    data: approved,
    isLoading: approvedLoading,
    isLoadingMore: approvedLoadingMore,
    hasMore: approvedHasMore,
    loadMore: loadMoreApproved,
    refresh: refreshApproved,
    error: approvedError,
  } = usePaginatedCollection<Submission>(approvedQuery, { pageSize: 12 });

  const myQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'contests', FIFTY_ABOVE_FIFTY_CONTEST_ID, 'submissions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const {
    data: mine,
    isLoading: mineLoading,
    refresh: refreshMine,
    error: mineError,
  } = usePaginatedCollection<Submission>(myQuery, { pageSize: 10 });

  const openNomination = (categoryId?: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Please sign in', description: 'Sign in to submit your nomination.' });
      return;
    }
    const cat = categoryId ?? selectedCategory;
    if (cat) form.setValue('categoryId', cat, { shouldValidate: true });
    setNominateOpen(true);
  };

  const onSubmit = async (values: SubmissionFormValues) => {
    if (!user) return;
    try {
      await createFiftyAboveFiftySubmission(
        firestore,
        storage,
        { uid: user.uid, displayName: user.displayName, email: (user as any).email },
        {
          title: values.title,
          categoryId: values.categoryId,
          description: values.description,
          age: values.age,
          mediaUrl: values.mediaUrl || null,
          photoFile,
        }
      );
      toast({ title: 'Nomination submitted', description: 'Your entry is under review. We will publish it after approval.' });
      setNominateOpen(false);
      setPhotoFile(null);
      form.reset({ categoryId: values.categoryId, title: '', description: '', age: 50, mediaUrl: '' });
      await refreshMine();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Submission failed', description: e?.message || 'Please try again.' });
    }
  };

  const handleVote = async (submissionId: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Please sign in', description: 'Sign in to vote.' });
      return;
    }
    if (votedIds[submissionId]) return;
    setIsVoting((m) => ({ ...m, [submissionId]: true }));
    try {
      await castFiftyAboveFiftyVote(firestore, submissionId, user.uid);
      setVotedIds((m) => ({ ...m, [submissionId]: true }));
      toast({ title: 'Vote recorded', description: 'Thanks for supporting this entry!' });
      await refreshApproved();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Could not vote', description: e?.message || 'Please try again.' });
      if (String(e?.message || '').toLowerCase().includes('already voted')) {
        setVotedIds((m) => ({ ...m, [submissionId]: true }));
      }
    } finally {
      setIsVoting((m) => {
        const next = { ...m };
        delete next[submissionId];
        return next;
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="border-2 overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5">
        <CardContent className="p-8 sm:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <div className="rounded-2xl bg-gradient-primary p-3">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <Badge className="bg-primary text-white text-base px-4 py-2">
                  Rs 100000/- Prize Pool
                </Badge>
                {isAdmin && (
                  <Badge variant="secondary" className="ml-2">
                    <ShieldCheck className="mr-1 h-4 w-4" /> Admin
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                Showcase your talent & win
                <br />
                <span className="text-gradient-primary">Rs 1,00,000/- Prize Pool</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                India&apos;s biggest talent hunt for seniors above 50. Nominate yourself in 50 unique categories.
                Submit your entries online or offline. Nationwide live auditions.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Dialog open={isNominateOpen} onOpenChange={setNominateOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-gradient-primary text-white text-lg px-8" onClick={() => openNomination()}>
                      Nominate Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Nominate Yourself</DialogTitle>
                      <DialogDescription>
                        Submit your entry. Our team will review it and publish it to the gallery.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Select value={field.value} onValueChange={(v) => { field.onChange(v); setSelectedCategory(v); }}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((c) => (
                                      <SelectItem key={c.id} value={c.id}>
                                        {c.icon} {c.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Classical singing performance" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                  <Input type="number" min={50} placeholder="50" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your story / description</FormLabel>
                              <FormControl>
                                <Textarea rows={5} placeholder="Tell us about your talent and what you will perform…" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="mediaUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Video / Link (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="https://youtube.com/… or https://instagram.com/…" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormItem>
                          <FormLabel>Photo (optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                            />
                          </FormControl>
                        </FormItem>

                        <div className="flex items-center justify-between gap-3">
                          {isAdmin ? (
                            <Button asChild variant="outline">
                              <Link href="/dashboard/50above50/admin">Review submissions</Link>
                            </Button>
                          ) : (
                            <div />
                          )}
                          <Button type="submit" className="bg-gradient-primary text-white">
                            Submit nomination
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-2"
                  onClick={() => categoriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                >
                  View Categories
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="rounded-2xl bg-gradient-primary p-8 text-white text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">2 Day</div>
                  <div className="text-xl mb-4">Mega Event</div>
                  <div className="text-lg font-semibold mb-2">Grand Award Show</div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>Hyderabad</span>
                  </div>
                  <div className="mt-4 text-sm">To be announced</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Gallery */}
      <Card className="border-2">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              Live Gallery
            </CardTitle>
            <p className="text-muted-foreground">Browse approved nominations and vote for your favorites.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={sort === 'trending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSort('trending')}
            >
              Trending
            </Button>
            <Button
              variant={sort === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSort('recent')}
            >
              Recent
            </Button>
            <Button variant="outline" size="sm" onClick={() => void refreshApproved()}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {approvedError ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">Could not load nominations.</p>
              <Button variant="outline" onClick={() => void refreshApproved()}>Try again</Button>
            </div>
          ) : approvedLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 grid-mobile-fix w-full">
              <Skeleton className="h-72 w-full rounded-xl" />
              <Skeleton className="h-72 w-full rounded-xl" />
              <Skeleton className="h-72 w-full rounded-xl" />
            </div>
          ) : approved && approved.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 grid-mobile-fix w-full">
                {approved.map((s: any) => {
                  const image =
                    (s.photoUrl ? null : PlaceHolderImages.find((p) => p.id === 'community-singing')) ??
                    PlaceHolderImages[0];
                  const label = categories.find((c) => c.id === s.categoryId)?.name ?? s.categoryId;
                  const voteCount = Number.isFinite(s.voteCount) ? s.voteCount : 0;
                  return (
                    <Card key={s.id} className="border-2 overflow-hidden">
                      <div className="relative h-44 w-full overflow-hidden bg-secondary/30">
                        {s.photoUrl ? (
                          <Image
                            src={s.photoUrl}
                            alt={s.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <Image
                            src={image.imageUrl}
                            alt="Entry cover"
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            data-ai-hint={image.imageHint}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <Badge className="absolute left-3 top-3 bg-background/90 text-foreground">{label}</Badge>
                      </div>
                      <CardContent className="p-5 space-y-3">
                        <div>
                          <div className="font-bold text-lg line-clamp-2">{s.title}</div>
                          <div className="text-sm text-muted-foreground">by {s.authorName}</div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{s.description}</p>
                        {s.mediaUrl ? (
                          <a
                            href={s.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary underline"
                          >
                            View link
                          </a>
                        ) : null}
                        <div className="flex items-center justify-between pt-2">
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Heart className="h-4 w-4 text-primary" />
                            <span>{voteCount} votes</span>
                          </div>
                          <Button
                            size="sm"
                            variant={votedIds[s.id] ? 'outline' : 'default'}
                            className={!votedIds[s.id] ? 'bg-gradient-primary text-white' : ''}
                            disabled={!user || votedIds[s.id] || isVoting[s.id]}
                            onClick={() => void handleVote(s.id)}
                          >
                            {votedIds[s.id] ? 'Voted' : isVoting[s.id] ? 'Voting…' : 'Vote'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {approvedHasMore && (
                <div className="flex justify-center pt-6">
                  <Button variant="outline" onClick={() => void loadMoreApproved()} disabled={approvedLoadingMore}>
                    {approvedLoadingMore ? 'Loading…' : 'Load more'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No approved entries yet. Be the first to submit!
            </div>
          )}
        </CardContent>
      </Card>

      {/* My nominations */}
      {user && (
        <Card className="border-2">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl">My Nominations</CardTitle>
              <p className="text-muted-foreground">Track your submissions and approval status.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void refreshMine()}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {mineError ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Could not load your nominations.</p>
                <Button variant="outline" onClick={() => void refreshMine()}>Try again</Button>
              </div>
            ) : mineLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : mine && mine.length > 0 ? (
              <div className="space-y-3">
                {mine.map((s: any) => {
                  const label = categories.find((c) => c.id === s.categoryId)?.name ?? s.categoryId;
                  const status: FiftyAboveFiftySubmissionStatus = s.status || 'pending';
                  const badgeVariant =
                    status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary';
                  return (
                    <div key={s.id} className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-semibold">{s.title}</div>
                        <div className="text-xs text-muted-foreground">{label}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={badgeVariant as any}>{status}</Badge>
                        <div className="text-sm text-muted-foreground">{Number(s.voteCount || 0)} votes</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                You haven&apos;t submitted anything yet.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <div ref={categoriesRef}>
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">50 Unique Categories</h2>
          <p className="text-muted-foreground">
            Choose your talent category and submit your entry
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 grid-mobile-fix w-full">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="border-2 hover:border-primary hover:shadow-warm transition-all duration-300 cursor-pointer group"
              onClick={() => {
                setSelectedCategory(category.id);
                if (user) {
                  form.setValue('categoryId', category.id, { shouldValidate: true });
                  setNominateOpen(true);
                } else {
                  toast({ variant: 'destructive', title: 'Please sign in', description: 'Sign in to submit your nomination.' });
                }
              }}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="font-semibold">{category.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="border-2 bg-gradient-primary text-white">
        <CardContent className="p-8 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to Showcase Your Talent?</h2>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            Join thousands of seniors who are already participating. Nominate yourself today!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100" onClick={() => openNomination()}>
              Nominate Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
