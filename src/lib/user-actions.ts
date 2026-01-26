'use server';

import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { initializeFirebase } from '@/firebase/init';

// NOTE: This is a server-side action.
// We initialize a server-side instance of Firebase to interact with Firestore.

export type UserProfileAddon = {
  firstName: string;
  lastName: string;
  userType: 'senior' | 'guardian';
  phone: string | null;
}

/**
 * Creates a user profile document in Firestore.
 * @param user The Firebase Auth User object.
 * @param additionalData Additional data for the user profile.
 */
export async function createUserProfile(user: User, additionalData: UserProfileAddon) {
  // We need to get a Firestore instance here.
  // This function runs on the server, so we initialize a new instance.
  const { firestore } = initializeFirebase();
  
  if (!user) throw new Error('User object is required to create a profile.');

  const userRef = doc(firestore, 'users', user.uid);

  const profileData = {
    id: user.uid,
    email: user.email,
    firstName: additionalData.firstName,
    lastName: additionalData.lastName,
    userType: additionalData.userType,
    phone: additionalData.phone || user.phoneNumber || '',
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
