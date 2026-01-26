
'use client';

import { collection, serverTimestamp, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';

type VitalData = {
  type: 'blood_pressure' | 'blood_sugar' | 'spo2' | 'weight';
  value: string;
};

export function createVital(
  firestore: Firestore,
  userId: string,
  vitalData: VitalData
) {
  if (!userId) {
    throw new Error('User ID is required to log a vital.');
  }

  const vitalsCollectionRef = collection(firestore, 'users', userId, 'vitals');

  const data = {
    userId,
    ...vitalData,
    timestamp: serverTimestamp(),
  };

  return addDocumentNonBlocking(vitalsCollectionRef, data);
}
