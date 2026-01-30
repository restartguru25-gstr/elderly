'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { sendForumChatMessage } from '@/lib/forum-chat-actions';
import { MessageCircle, X, ArrowLeft, Send, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type Forum = {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  imageId?: string;
};

type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp?: { toDate: () => Date };
};

export function CommunityQuickChat() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch user's joined forums
  const forumsQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(
            collection(firestore, 'communityForums'),
            where('memberIds', 'array-contains', user.uid),
            limit(20)
          )
        : null,
    [firestore, user?.uid]
  );
  const { data: forums, isLoading: forumsLoading } = useCollection<Forum>(forumsQuery);

  // Fetch chat messages for selected forum
  const messagesQuery = useMemoFirebase(
    () =>
      selectedForum && firestore
        ? query(
            collection(firestore, 'communityForums', selectedForum.id, 'chatMessages'),
            orderBy('timestamp', 'desc'),
            limit(50)
          )
        : null,
    [firestore, selectedForum?.id]
  );
  const { data: messagesRaw, isLoading: messagesLoading } = useCollection<ChatMessage>(messagesQuery);

  // Reverse messages so newest is at bottom
  const messages = messagesRaw ? [...messagesRaw].reverse() : null;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current && messages) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when entering chat view
  useEffect(() => {
    if (selectedForum && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedForum]);

  const handleSendMessage = useCallback(async () => {
    const text = messageInput.trim();
    if (!user || !selectedForum || !text || sending || !firestore) return;

    setSending(true);
    try {
      sendForumChatMessage(
        firestore,
        selectedForum.id,
        user.uid,
        user.displayName || 'Anonymous',
        text
      );
      setMessageInput('');
    } finally {
      setSending(false);
    }
  }, [user, selectedForum, messageInput, sending, firestore]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedForum(null);
    setMessageInput('');
  };

  const handleBackToForums = () => {
    setSelectedForum(null);
    setMessageInput('');
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 md:bottom-6">
      {/* Chat Panel */}
      {isOpen && (
        <Card className="absolute bottom-16 left-0 w-80 sm:w-96 shadow-soft-lg border-2 animate-fade-in-up overflow-hidden">
          <CardHeader className="py-3 px-4 border-b bg-gradient-primary text-white">
            <div className="flex items-center justify-between">
              {selectedForum ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={handleBackToForums}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-sm font-semibold truncate flex-1 mx-2">
                    {selectedForum.name}
                  </CardTitle>
                </>
              ) : (
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Community Chat
                </CardTitle>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {!selectedForum ? (
              // Forum List View
              <div className="max-h-80 overflow-y-auto">
                {forumsLoading ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Loading forums...
                  </div>
                ) : !forums || forums.length === 0 ? (
                  <div className="p-6 text-center">
                    <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      You haven&apos;t joined any forums yet.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Join a community to start chatting!
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {forums.map((forum) => (
                      <li key={forum.id}>
                        <button
                          onClick={() => setSelectedForum(forum)}
                          className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                        >
                          <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
                            {forum.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{forum.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {forum.memberIds.length} member{forum.memberIds.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              // Chat View
              <div className="flex flex-col h-80">
                <ScrollArea className="flex-1 p-3" ref={scrollRef}>
                  {messagesLoading ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      Loading messages...
                    </div>
                  ) : !messages || messages.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      No messages yet. Be the first to say hello!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => {
                        const isOwn = msg.senderId === user.uid;
                        return (
                          <div
                            key={msg.id}
                            className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                          >
                            <div
                              className={cn(
                                'max-w-[80%] rounded-xl px-3 py-2',
                                isOwn
                                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                                  : 'bg-muted rounded-bl-sm'
                              )}
                            >
                              {!isOwn && (
                                <p className="text-xs font-medium mb-0.5 text-primary">
                                  {msg.senderName}
                                </p>
                              )}
                              <p className="text-sm break-words">{msg.text}</p>
                              <p
                                className={cn(
                                  'text-xs mt-1',
                                  isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                )}
                              >
                                {msg.timestamp?.toDate
                                  ? format(msg.timestamp.toDate(), 'h:mm a')
                                  : ''}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-3 border-t bg-background">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 h-9 text-sm"
                      disabled={sending}
                    />
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={sending || !messageInput.trim()}
                      className="h-9 w-9 p-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Toggle Button */}
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className={cn(
                'rounded-full h-12 w-12 sm:h-14 sm:w-14 shadow-soft-lg transition-all',
                isOpen
                  ? 'bg-primary text-white'
                  : 'bg-gradient-primary text-white hover:scale-110 hover:shadow-warm'
              )}
              onClick={() => (isOpen ? handleClose() : setIsOpen(true))}
              aria-label={isOpen ? 'Close community chat' : 'Open community chat'}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{isOpen ? 'Close community chat' : 'Community chat'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
