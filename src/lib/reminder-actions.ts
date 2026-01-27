'use client';

import {
  collection,
  doc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';

export type ReminderData = {
  fromGuardianId: string;
  fromGuardianName?: string;
  message: string;
  read?: boolean;
};

/**
 * Creates a reminder for a senior (from a linked guardian).
 * Stored in users/{seniorId}/reminders.
 */
export function createReminder(
  firestore: Firestore,
  seniorId: string,
  data: ReminderData
) {
  if (!seniorId) throw new Error('Senior ID is required.');
  const col = collection(firestore, 'users', seniorId, 'reminders');
  return addDocumentNonBlocking(col, {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * Marks a reminder as read.
 */
export function markReminderRead(
  firestore: Firestore,
  seniorId: string,
  reminderId: string
) {
  if (!seniorId || !reminderId) throw new Error('Senior ID and reminder ID are required.');
  const ref = doc(firestore, 'users', seniorId, 'reminders', reminderId);
  return updateDocumentNonBlocking(ref, { read: true });
}
