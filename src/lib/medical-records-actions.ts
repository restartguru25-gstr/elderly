'use client';

import {
  Firestore,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import {
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { addDocumentNonBlocking } from '@/firebase';
import { makeSearchTokens } from '@/lib/search-tokens';

/**
 * Uploads a medical document to Firebase Storage and creates a corresponding
 * metadata document in Firestore.
 * @param firestore The Firestore instance.
 * @param storage The Firebase Storage instance.
 * @param userId The user's ID.
 * @param file The file to upload.
 */
export async function uploadMedicalDocument(
  firestore: Firestore,
  storage: FirebaseStorage,
  userId: string,
  file: File
) {
  if (!userId) throw new Error('User ID is required to upload a document.');
  if (!file) throw new Error('File is required to upload.');

  // 1. Upload the file to Firebase Storage
  const storageRef = ref(storage, `users/${userId}/medical_docs/${Date.now()}_${file.name}`);
  const uploadResult = await uploadBytes(storageRef, file);
  const fileUrl = await getDownloadURL(uploadResult.ref);

  // 2. Create the metadata document in Firestore
  const docsCollectionRef = collection(firestore, 'users', userId, 'medical_docs');
  const docData = {
    userId,
    fileName: file.name,
    fileUrl,
    fileType: file.type,
    searchTokens: makeSearchTokens(file.name),
    createdAt: serverTimestamp(),
  };

  // This uses a non-blocking write.
  addDocumentNonBlocking(docsCollectionRef, docData);

  return { ...docData, id: 'optimistic-id' }; // Return data for optimistic UI update
}
