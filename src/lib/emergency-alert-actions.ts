'use client';

import { addDoc, collection, serverTimestamp, Firestore } from 'firebase/firestore';

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
export async function createEmergencyAlert(
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

  try {
    await addDoc(alertsCollectionRef, alertData);
    console.log('Emergency alert created successfully for user:', userId);
  } catch (error) {
    console.error('Error creating emergency alert:', error);
    throw new Error('Failed to send emergency alert.');
  }
}
