
'use client';

import { doc, serverTimestamp, Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { setDocumentNonBlocking } from '@/firebase';

export type UserProfileAddon = {
  firstName: string;
  lastName:string;
  userType: 'senior' | 'guardian' | 'provider' | 'admin';
  phone?: string | null;
  age?: number;
  emergencyContacts?: string[];
  healthConditions?: string[];
  language?: string;
  permissions?: {
    vitals: boolean;
    location: boolean;
  };
  linkedProfiles?: string[];
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
  additionalData: Partial<UserProfileAddon>
) {
  if (!user) throw new Error('User object is required to create a profile.');

  const userRef = doc(firestore, 'users', user.uid);

  const profileData = {
    id: user.uid,
    email: user.email,
    firstName: additionalData.firstName || 'New',
    lastName: additionalData.lastName || 'User',
    userType: additionalData.userType || 'guardian',
    phone: additionalData.phone || user.phoneNumber || '',
    age: additionalData.age || null,
    emergencyContacts: additionalData.emergencyContacts || [],
    healthConditions: additionalData.healthConditions || [],
    language: additionalData.language || 'en',
    permissions: additionalData.permissions || { vitals: true, location: true },
    linkedProfiles: additionalData.linkedProfiles || [],
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

  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  }

  return setDocumentNonBlocking(userRef, updateData, { merge: true });
}
