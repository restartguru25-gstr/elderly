
'use client';

import { doc, serverTimestamp, Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { setDocumentNonBlocking } from '@/firebase';

export type UserProfileAddon = {
  firstName: string;
  lastName:string;
  userType: 'senior' | 'guardian';
  phone?: string | null;
  emergencyContacts?: string;
  healthConditions?: string;
}

/**
 * Creates a user profile document in Firestore.
 * @param firestore The Firestore instance.
 * @param user The Firebase Auth User object.
 * @param additionalData Additional data for the user profile.
 */
export function createUserProfile(
  firestore: Firestore,
  user: User,
  additionalData: UserProfileAddon
) {
  if (!user) throw new Error('User object is required to create a profile.');

  const userRef = doc(firestore, 'users', user.uid);

  const profileData = {
    id: user.uid,
    email: user.email,
    firstName: additionalData.firstName,
    lastName: additionalData.lastName,
    userType: additionalData.userType,
    phone: additionalData.phone || user.phoneNumber || '',
    emergencyContacts: additionalData.emergencyContacts || '',
    healthConditions: additionalData.healthConditions || '',
    createdAt: serverTimestamp(),
  };

  // Do not await, let the auth provider handle optimistic updates
  return setDocumentNonBlocking(userRef, profileData, { merge: false });
}

/**
 * Updates a user profile document in Firestore.
 * @param firestore The Firestore instance.
 * @param userId The user's ID.
 * @param data The data to update.
 */
export function updateUserProfile(
  firestore: Firestore,
  userId: string,
  data: Partial<UserProfileAddon>
) {
  if (!userId) throw new Error('User ID is required to update a profile.');
  const userRef = doc(firestore, 'users', userId);

  return setDocumentNonBlocking(userRef, data, { merge: true });
}
