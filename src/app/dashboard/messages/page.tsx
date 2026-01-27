'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { getLinkedUserIds, getLinkedProfiles } from '@/lib/family-linking';
import { MessageSquare, Plus } from 'lucide-react';

type Chat = { memberIds: string[] };
type LinkedUser = { id: string; firstName?: string; lastName?: string };

export default function MessagesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [linked, setLinked] = useState<LinkedUser[]>([]);

  const chatsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'chats'),
            where('memberIds', 'array-contains', user.uid),
            limit(50)
          )
        : null,
    [firestore, user]
  );
  const { data: chats } = useCollection<Chat>(chatsQuery);

  useEffect(() => {
    if (!user || !firestore) return;
    getLinkedUserIds(firestore, user.uid).then((ids) => {
      getLinkedProfiles(firestore, ids).then((profiles) => setLinked(profiles as LinkedUser[]));
    });
  }, [user, firestore]);

  const otherMemberId = (chat: Chat) => (chat.memberIds || []).find((id) => id !== user?.uid);
  const displayName = (uid: string) => {
    const p = linked.find((x) => x.id === uid);
    return p ? [p.firstName, p.lastName].filter(Boolean).join(' ').trim() || 'Unknown' : 'Unknown';
  };

  const handleStartChat = async (otherId: string) => {
    if (!user) return;
    const ids = [user.uid, otherId].sort();
    const chatId = ids.join('_');
    const { doc, setDoc } = await import('firebase/firestore');
    const chatRef = doc(firestore, 'chats', chatId);
    await setDoc(chatRef, { memberIds: ids }, { merge: true });
    router.push(`/dashboard/messages/${chatId}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
          <MessageSquare className="h-8 w-8 text-primary" />
          Messages
        </h1>
        <p className="text-muted-foreground">
          Chat with your linked family members.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Start a chat</CardTitle>
            <CardDescription>Choose a linked family member to message.</CardDescription>
          </CardHeader>
          <CardContent>
            {linked.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Link with family on the Family page to start messaging.
              </p>
            ) : (
              <div className="space-y-2">
                {linked.map((u) => (
                  <Button
                    key={u.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleStartChat(u.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Chat with {[u.firstName, u.lastName].filter(Boolean).join(' ').trim() || 'family'}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Your conversations</CardTitle>
            <CardDescription>Open a chat to view and send messages.</CardDescription>
          </CardHeader>
          <CardContent>
            {!chats?.length ? (
              <p className="text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
              <ul className="space-y-2">
                {chats.map((c) => {
                  const id = (c as { id?: string }).id;
                  const other = otherMemberId(c);
                  if (!id || !other) return null;
                  return (
                    <li key={id}>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href={`/dashboard/messages/${id}`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {displayName(other)}
                        </Link>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
