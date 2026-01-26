
'use client';

import { collection, serverTimestamp, Firestore, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';

type MedicationData = {
  name: string;
  dosage: string;
  schedule: string;
};

export function createMedication(
  firestore: Firestore,
  userId: string,
  medicationData: MedicationData
) {
  if (!userId) {
    throw new Error('User ID is required to add a medication.');
  }

  const medicationsCollectionRef = collection(firestore, 'users', userId, 'medications');

  const data = {
    userId,
    ...medicationData,
    createdAt: serverTimestamp(),
  };

  return addDocumentNonBlocking(medicationsCollectionRef, data)
}

export function logMedication(firestore: Firestore, userId: string, medicationId: string, logData: { taken: boolean; date: string }) {
    if (!userId || !medicationId) {
        throw new Error('User ID and Medication ID are required.');
    }

    const logId = `${medicationId}_${logData.date}`;
    const logRef = doc(firestore, `users/${userId}/medication_logs`, logId);

    const data = {
        userId,
        medicationId,
        taken: logData.taken,
        date: logData.date,
        timestamp: serverTimestamp(),
    };

    return setDocumentNonBlocking(logRef, data, { merge: true });
}
