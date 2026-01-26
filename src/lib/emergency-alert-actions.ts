
'use client';

import { collection, serverTimestamp, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';


type Location = {
  latitude: number;
  longitude: number;
};

/**
 * Creates an emergency alert document in Firestore.
 * @param firestore The Firestore instance.
 * @param userId The user's ID.
 * @param location The user's location.
 */
export function createEmergencyAlert(
  firestore: Firestore,
  userId: string,
  location: Location
) {
  if (!userId) throw new Error('User ID is required to create an alert.');

  const alertsCollectionRef = collection(firestore, 'users', userId, 'emergencyAlerts');

  const alertData = {
    userId,
    timestamp: serverTimestamp(),
    location: `${location.latitude}, ${location.longitude}`,
    status: 'pending',
  };

  return addDocumentNonBlocking(alertsCollectionRef, alertData);
}
