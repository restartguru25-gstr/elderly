
'use client';

import { collection, serverTimestamp, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';

type SkillListingData = {
  title: string;
  category: string;
  description: string;
  imageId: string;
};

export function createSkillListing(
  firestore: Firestore,
  authorId: string,
  authorName: string,
  listingData: SkillListingData
) {
  if (!authorId) {
    throw new Error('Author ID is required to create a skill listing.');
  }

  const skillsCollectionRef = collection(firestore, 'skillListings');

  const data = {
    authorId,
    authorName,
    ...listingData,
    createdAt: serverTimestamp(),
  };

  return addDocumentNonBlocking(skillsCollectionRef, data);
}
