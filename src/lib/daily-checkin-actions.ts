'use client';

import { addDoc, collection, serverTimestamp, Firestore } from 'firebase/firestore';

/**
 * Creates a daily check-in document in Firestore.
 * @param firestore The Firestore instance.
 * @param userId The user's ID.
 */
export async function createDailyCheckin(firestore: Firestore, userId: string) {
  if (!userId) throw new Error('User ID is required to create a check-in.');

  const checkinCollectionRef = collection(firestore, 'users', userId, 'daily_checkins');

  const checkinData = {
    userId,
    timestamp: serverTimestamp(),
    status: 'ok',
  };

  try {
    await addDoc(checkinCollectionRef, checkinData);
  } catch (error) {
    console.error('Error creating daily check-in:', error);
    throw new Error('Failed to create daily check-in.');
  }
}
