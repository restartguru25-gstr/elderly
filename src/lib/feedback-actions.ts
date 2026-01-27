'use client';

import { collection, serverTimestamp, Firestore } from 'firebase/firestore';
import { addDoc } from 'firebase/firestore';

export type FeedbackData = {
  userId: string;
  email?: string;
  rating: number;
  comment: string;
  page?: string;
};

export async function submitFeedback(
  firestore: Firestore,
  data: FeedbackData
): Promise<void> {
  const col = collection(firestore, 'feedback');
  await addDoc(col, {
    ...data,
    createdAt: serverTimestamp(),
  });
}
