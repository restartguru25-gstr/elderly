'use client';

import { doc, serverTimestamp, Firestore } from 'firebase/firestore';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';

export type AdminUserProfileUpdate = {
  userType?: 'senior' | 'guardian' | 'provider' | 'admin';
  isAdmin?: boolean;
};

/**
 * Admin-only: update a user's profile with limited fields (userType, isAdmin).
 * Firestore rules must allow update for isAdmin().
 */
export function updateUserProfileAsAdmin(
  firestore: Firestore,
  userId: string,
  data: AdminUserProfileUpdate
) {
  if (!userId) throw new Error('User ID is required.');
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (data.userType !== undefined) payload.userType = data.userType;
  if (data.isAdmin !== undefined) payload.isAdmin = data.isAdmin;
  if (Object.keys(payload).length <= 1) throw new Error('At least one of userType or isAdmin must be provided.');
  const userRef = doc(firestore, 'users', userId);
  return updateDocumentNonBlocking(userRef, payload);
}

/**
 * Admin-only: delete a skill listing. Firestore rules must allow delete for isAdmin().
 */
export function deleteSkillListing(firestore: Firestore, skillId: string) {
  if (!skillId) throw new Error('Skill listing ID is required.');
  const skillRef = doc(firestore, 'skillListings', skillId);
  return deleteDocumentNonBlocking(skillRef);
}
