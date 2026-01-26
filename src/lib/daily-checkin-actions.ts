
'use client';

import { collection, serverTimestamp, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';

/**
 * Creates a daily check-in document in Firestore.
 * @param firestore The Firestore instance.
 * @param userId The user's ID.
 */
export function createDailyCheckin(firestore: Firestore, userId: string) {
  if (!userId) throw new Error('User ID is required to create a check-in.');

  const checkinCollectionRef = collection(firestore, 'users', userId, 'daily_checkins');

  const checkinData = {
    userId,
    timestamp: serverTimestamp(),
    status: 'ok',
  };

  return addDocumentNonBlocking(checkinCollectionRef, checkinData);
}
