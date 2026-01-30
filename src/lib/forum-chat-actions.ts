'use client';

import { collection, serverTimestamp, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';

/**
 * Sends a chat message to a community forum's real-time chat.
 * @param firestore Firestore instance
 * @param forumId The ID of the community forum
 * @param senderId The UID of the message sender
 * @param senderName Display name of the sender (denormalized for performance)
 * @param text The message text content
 */
export function sendForumChatMessage(
  firestore: Firestore,
  forumId: string,
  senderId: string,
  senderName: string,
  text: string
) {
  if (!forumId || !senderId || !text.trim()) {
    throw new Error('Forum ID, Sender ID, and message text are required.');
  }

  const chatMessagesRef = collection(
    firestore,
    'communityForums',
    forumId,
    'chatMessages'
  );

  const messageData = {
    senderId,
    senderName: senderName || 'Anonymous',
    text: text.trim(),
    timestamp: serverTimestamp(),
  };

  return addDocumentNonBlocking(chatMessagesRef, messageData);
}
