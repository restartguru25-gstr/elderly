
'use client';

import { collection, serverTimestamp, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';

type MoodCheckinData = {
  notes: string;
  moodScore: number;
};

/**
 * Creates a mood check-in document in Firestore.
 * @param firestore The Firestore instance.
 * @param userId The user's ID.
 * @param moodData The mood check-in data.
 */
export function createMoodCheckin(
  firestore: Firestore,
  userId: string,
  moodData: MoodCheckinData
) {
  if (!userId) {
    throw new Error('User ID is required to create a mood check-in.');
  }

  const moodCollectionRef = collection(
    firestore,
    'users',
    userId,
    'moodCheckins'
  );

  const data = {
    userId,
    ...moodData,
    timestamp: serverTimestamp(),
  };

  return addDocumentNonBlocking(moodCollectionRef, data);
}
