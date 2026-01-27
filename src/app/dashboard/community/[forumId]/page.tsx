
'use client';

import React, { useState } from 'react';
import {
  useDoc,
  usePaginatedCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { joinCommunityForum, createPostInForum } from '@/lib/community-actions';
import { WithId } from '@/firebase/firestore/use-collection';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

type CommunityForum = {
  name: string;
  description: string;
  memberIds: string[];
  interest: string;
  imageId: string;
  createdAt: any;
};

type Post = {
    authorId: string;
    authorName: string;
    content: string;
    createdAt: any;
}

const postSchema = z.object({
    content: z.string().min(1, "Post content cannot be empty.").max(1000, "Post is too long."),
})

type PostFormValues = z.infer<typeof postSchema>;


function PostCard({ post }: { post: WithId<Post> }) {
  // A simple function to generate initials from a name
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

  return (
    <div className="flex items-start gap-4">
      <Avatar>
        <AvatarFallback>{getInitials(post.authorName)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{post.authorName}</p>
          <p className="text-xs text-muted-foreground">
            {post.createdAt ? format(post.createdAt.toDate(), 'PP p') : ''}
          </p>
        </div>
        <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap">{post.content}</p>
      </div>
    </div>
  );
}


export default function ForumDetailPage() {
  const { forumId } = useParams() as { forumId: string };
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [isJoining, setIsJoining] = useState(false);

  const forumRef = useMemoFirebase(
    () => (forumId ? doc(firestore, 'communityForums', forumId) : null),
    [firestore, forumId]
  );
  const { data: forum, isLoading: isForumLoading } = useDoc<CommunityForum>(forumRef);
  
  const postsQuery = useMemoFirebase(
    () => forumId ? query(collection(firestore, `communityForums/${forumId}/posts`), orderBy('createdAt', 'asc')) : null,
    [firestore, forumId]
  );
  const {
    data: posts,
    isLoading: arePostsLoading,
    hasMore,
    isLoadingMore,
    loadMore,
  } = usePaginatedCollection<Post>(postsQuery, { pageSize: 20 });

  const isMember = user && forum ? forum.memberIds.includes(user.uid) : false;

  const form = useForm<PostFormValues>({
      resolver: zodResolver(postSchema),
      defaultValues: { content: '' },
  });

  const handleJoin = () => {
    if (!user) return;
    setIsJoining(true);
    joinCommunityForum(firestore, forumId, user.uid)
      .then(() => {
        toast({
          title: 'Joined!',
          description: `You are now a member of ${forum?.name}`,
        });
      })
      .finally(() => setIsJoining(false));
  };
  
  const handlePostSubmit = (values: PostFormValues) => {
    if(!user || !isMember) return;
    const authorName = user.displayName || 'Anonymous';
    createPostInForum(firestore, forumId, user.uid, authorName, values.content);
    form.reset();
  }

  if (isForumLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!forum) {
    return <div>Forum not found.</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{forum.name}</CardTitle>
          <CardDescription>{forum.description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">{forum.memberIds.length} members</div>
            {!isMember && (
                <Button onClick={handleJoin} disabled={isJoining}>
                    {isJoining && <Loader2 className="mr-2 animate-spin" />}
                    Join Forum
                </Button>
            )}
        </CardFooter>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Posts</h2>
        
        {arePostsLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        ) : posts && posts.length > 0 ? (
            <div className="space-y-6">
                {posts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
        ) : (
            <p className="text-muted-foreground">No posts in this forum yet. Be the first to start the conversation!</p>
        )}

        {posts && posts.length > 0 && hasMore && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => void loadMore()}
              disabled={isLoadingMore}
            >
              {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Load more
            </Button>
          </div>
        )}

        {isMember && (
            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handlePostSubmit)} className="flex items-start gap-4">
                            <Avatar>
                                <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <FormField 
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Write a post..." 
                                                className="min-h-[60px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" size="icon" disabled={form.formState.isSubmitting}>
                                <Send />
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}

    