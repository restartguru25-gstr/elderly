
'use client';

import { collection, doc, serverTimestamp, setDoc, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';

type MedicationData = {
  name: string;
  dosage: string;
  schedule: string;
  reminderEnabled?: boolean;
  reminderTimes?: string[]; // HH:MM (24h)
  timezone?: string;
};

export function createMedication(
  firestore: Firestore,
  userId: string,
  medicationData: MedicationData
) {
  if (!userId) throw new Error('User ID is required to add a medication.');
  const col = collection(firestore, 'users', userId, 'medications');
  const data = {
    userId,
    ...medicationData,
    reminderEnabled: medicationData.reminderEnabled ?? false,
    reminderTimes: Array.isArray(medicationData.reminderTimes) ? medicationData.reminderTimes : [],
    timezone: medicationData.timezone ?? 'Asia/Kolkata',
    createdAt: serverTimestamp(),
  };
  return addDocumentNonBlocking(col, data);
}

/**
 * Logs a medication dose. Returns a Promise so callers can await, retry, and show optimistic UI.
 */
export function logMedication(
  firestore: Firestore,
  userId: string,
  medicationId: string,
  logData: { taken: boolean; date: string }
): Promise<void> {
  if (!userId || !medicationId) throw new Error('User ID and Medication ID are required.');
  const logId = `${medicationId}_${logData.date}`;
  const logRef = doc(firestore, 'users', userId, 'medication_logs', logId);
  const data = {
    userId,
    medicationId,
    taken: logData.taken,
    date: logData.date,
    timestamp: serverTimestamp(),
  };
  return setDoc(logRef, data, { merge: true });
}
