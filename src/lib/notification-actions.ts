'use client';

import { doc, Firestore, updateDoc } from 'firebase/firestore';

export function markNotificationRead(
  firestore: Firestore,
  userId: string,
  notificationId: string
) {
  if (!userId || !notificationId) throw new Error('User ID and notification ID are required.');
  const ref = doc(firestore, 'users', userId, 'notifications', notificationId);
  return updateDoc(ref, { read: true });
}

