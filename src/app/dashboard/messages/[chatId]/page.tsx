'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';

type Message = { senderId: string; text: string; timestamp?: { toDate: () => Date } };

export default function MessageThreadPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatRef = useMemoFirebase(
    () => (chatId && firestore ? doc(firestore, 'chats', chatId) : null),
    [firestore, chatId]
  );
  const { data: chat } = useDoc(chatRef);

  const messagesQuery = useMemoFirebase(
    () =>
      chatId && firestore
        ? query(
            collection(firestore, 'chats', chatId, 'messages'),
            orderBy('timestamp', 'asc'),
            limit(100)
          )
        : null,
    [firestore, chatId]
  );
  const { data: messages } = useCollection<Message>(messagesQuery);

  const isMember = chat && user && (chat.memberIds as string[] | undefined)?.includes(user.uid);

  useEffect(() => {
    if (!chat && chatRef) return;
    if (chat && user && !isMember) {
      router.replace('/dashboard/messages');
      return;
    }
  }, [chat, user, isMember, router, chatRef]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!user || !chatId || !text || sending) return;
    setSending(true);
    try {
      await addDoc(collection(firestore, 'chats', chatId, 'messages'), {
        senderId: user.uid,
        text,
        timestamp: serverTimestamp(),
      });
      setInput('');
    } finally {
      setSending(false);
    }
  }, [user, chatId, input, sending, firestore]);

  if (!chat || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!isMember) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/messages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Chat</h1>
      </div>

      <Card className="border-2 flex flex-col max-h-[70vh]">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div
            ref={scrollRef}
            className="flex-1 space-y-2 overflow-y-auto rounded-lg bg-muted/30 p-3 min-h-[200px]"
          >
            {!messages?.length ? (
              <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
            ) : (
              messages.map((m) => {
                const isOwn = m.senderId === user.uid;
                return (
                  <div
                    key={m.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{m.text}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {m.timestamp?.toDate ? format(m.timestamp.toDate(), 'MMM d, h:mm a') : ''}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            />
            <Button onClick={send} disabled={sending || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
