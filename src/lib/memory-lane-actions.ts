'use client';

import {
  Firestore,
  collection,
  serverTimestamp,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

export type CreateMemoryInput = {
  title: string;
  story: string;
  memoryDate: Date;
  photoFile?: File | null;
};

export async function createMemoryEntry(
  firestore: Firestore,
  storage: FirebaseStorage,
  userId: string,
  input: CreateMemoryInput
) {
  if (!userId) throw new Error('User ID is required.');
  if (!input.title.trim()) throw new Error('Title is required.');
  if (!input.story.trim()) throw new Error('Story is required.');
  if (!(input.memoryDate instanceof Date) || Number.isNaN(input.memoryDate.getTime())) {
    throw new Error('A valid date is required.');
  }

  let photoUrl: string | null = null;
  let photoPath: string | null = null;

  if (input.photoFile) {
    const file = input.photoFile;
    photoPath = `users/${userId}/memories/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, photoPath);
    const uploadResult = await uploadBytes(storageRef, file);
    photoUrl = await getDownloadURL(uploadResult.ref);
  }

  const colRef = collection(firestore, 'users', userId, 'memories');
  const docRef = await addDoc(colRef, {
    title: input.title.trim(),
    story: input.story.trim(),
    memoryDate: Timestamp.fromDate(input.memoryDate),
    photoUrl,
    photoPath,
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id, photoUrl };
}

