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
import { Badge } from '@/components/ui/badge';
import { Users, Music2, Gamepad2, Flower2, Brain, Sparkles, Calendar, ArrowRight, Radio } from 'lucide-react';
import Image from 'next/image';
import {
  usePaginatedCollection,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { WithId } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const CreateForumDialog = dynamic(
  () => import('@/components/features/create-forum-dialog').then((m) => ({ default: m.CreateForumDialog })),
  { ssr: false }
);

type CommunityForum = {
  name: string;
  description: string;
  memberIds: string[];
  imageId: string;
  createdAt: any;
};

const eventCategories = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'singing', label: 'Singing & Music', icon: Music2 },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'yoga', label: 'Yoga & Fitness', icon: Flower2 },
  { id: 'meditation', label: 'Meditation', icon: Brain },
  { id: 'literacy', label: 'Digital Literacy', icon: Radio },
];

const upcomingEvents = [
  { id: '1', title: 'Morning Yoga Session', category: 'yoga', time: '9:00 AM', live: true, participants: 24 },
  { id: '2', title: 'Classic Songs Karaoke', category: 'singing', time: '11:00 AM', live: false, participants: 18 },
  { id: '3', title: 'Tombola & Fun Games', category: 'games', time: '3:00 PM', live: false, participants: 32 },
  { id: '4', title: 'Guided Meditation', category: 'meditation', time: '6:00 PM', live: false, participants: 15 },
];

function ForumCard({ group }: { group: WithId<CommunityForum> }) {
  const image = PlaceHolderImages.find((p) => p.id === group.imageId) || PlaceHolderImages.find((p) => p.id === 'community-yoga');

  return (
    <Link href={`/dashboard/community/${group.id}`} className="block group">
      <Card className="overflow-hidden flex flex-col h-full min-w-0 border-2 transition-all duration-300 hover:border-primary hover:shadow-warm">
        {image && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={image.imageUrl}
              alt={group.name}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={image.imageHint}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-xl">{group.name}</CardTitle>
          <CardDescription className="line-clamp-2">{group.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow" />
        <CardFooter className="flex justify-between items-center bg-secondary/30 py-4 px-6">
          <div className="flex items-center text-sm text-muted-foreground gap-2">
            <Users className="h-4 w-4" />
            <span>{group.memberIds?.length || 0} members</span>
          </div>
          <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            Join
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

export default function CommunityPage() {
  const firestore = useFirestore();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const forumsQuery = useMemoFirebase(
    () => query(collection(firestore, 'communityForums'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const {
    data: forums,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = usePaginatedCollection<CommunityForum>(forumsQuery, { pageSize: 20 });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-foreground">
            Community & Events
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Connect with like-minded individuals, join live events, and make new friends.
          </p>
        </div>
        <CreateForumDialog open={isCreateOpen} onOpenChange={setCreateOpen} />
      </div>

      {/* Event Categories */}
      <div className="flex flex-wrap gap-2">
        {eventCategories.map((cat) => (
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

      {/* Upcoming Events */}
      <Card className="border-2 shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Live Events & Activities
              </CardTitle>
              <CardDescription>Participate in 1100+ live events — singing, yoga, games & more</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 grid-mobile-fix w-full">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                variant="bordered"
                className="overflow-hidden group hover:border-primary hover:shadow-warm transition-all duration-300"
              >
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={event.live ? 'destructive' : 'secondary'} className="text-xs">
                        {event.live ? (
                          <>
                            <span className="relative flex h-2 w-2 mr-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                            </span>
                            Live
                          </>
                        ) : (
                          event.time
                        )}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.participants}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base mb-1">{event.title}</h3>
                    <Button size="sm" variant="gradient" className="w-full mt-3">
                      Join Event
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forums */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Community Forums</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 grid-mobile-fix w-full">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        ) : forums && forums.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 grid-mobile-fix w-full">
              {forums.map((group) => (
                <ForumCard key={group.id} group={group} />
              ))}
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
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Forums Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Be the first to create a community forum and bring people together!
              </p>
              <CreateForumDialog open={isCreateOpen} onOpenChange={setCreateOpen} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
