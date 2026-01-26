'use client';

import { doc, setDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';

export type UserProfileAddon = {
  firstName: string;
  lastName: string;
  userType: 'senior' | 'guardian';
  phone: string | null;
  emergencyContacts: string;
  healthConditions: string;
}

/**
 * Creates a user profile document in Firestore.
 * @param firestore The Firestore instance.
 * @param user The Firebase Auth User object.
 * @param additionalData Additional data for the user profile.
 */
export async function createUserProfile(
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
    emergencyContacts: additionalData.emergencyContacts,
    healthConditions: additionalData.healthConditions,
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(userRef, profileData);
    console.log('User profile created successfully for user:', user.uid);
  } catch (error) {
    console.error('Error creating user profile:', error);
    // Re-throw the error to be caught by the calling function
    throw new Error('Failed to create user profile in database.');
  }
}

/**
 * Updates a user profile document in Firestore.
 * @param firestore The Firestore instance.
 * @param userId The user's ID.
 * @param data The data to update.
 */
export async function updateUserProfile(
  firestore: Firestore,
  userId: string,
  data: Partial<UserProfileAddon>
) {
  if (!userId) throw new Error('User ID is required to update a profile.');
  const userRef = doc(firestore, 'users', userId);

  try {
    // Using setDoc with merge: true is equivalent to an update,
    // but it can also create the document if it doesn't exist.
    await setDoc(userRef, data, { merge: true });
    console.log('User profile updated successfully for user:', userId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile in database.');
  }
}
