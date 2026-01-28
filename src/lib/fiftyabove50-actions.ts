'use client';

import {
  Firestore,
  addDoc,
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { makeSearchTokens } from '@/lib/search-tokens';

export const FIFTY_ABOVE_FIFTY_CONTEST_ID = '50above50';

export type FiftyAboveFiftySubmissionStatus = 'pending' | 'approved' | 'rejected';

export type CreateFiftyAboveFiftySubmissionInput = {
  title: string;
  categoryId: string;
  description: string;
  age: number;
  mediaUrl?: string | null;
  photoFile?: File | null;
};

export async function createFiftyAboveFiftySubmission(
  firestore: Firestore,
  storage: FirebaseStorage,
  user: { uid: string; displayName?: string | null; email?: string | null },
  input: CreateFiftyAboveFiftySubmissionInput
) {
  if (!user?.uid) throw new Error('You must be signed in.');
  if (!input.title.trim()) throw new Error('Title is required.');
  if (!input.categoryId) throw new Error('Category is required.');
  if (!input.description.trim()) throw new Error('Description is required.');
  if (!Number.isFinite(input.age) || input.age < 50) throw new Error('Age must be 50 or above.');

  let photoUrl: string | null = null;
  let photoPath: string | null = null;

  if (input.photoFile) {
    const file = input.photoFile;
    photoPath = `contests/${FIFTY_ABOVE_FIFTY_CONTEST_ID}/submissions/${user.uid}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, photoPath);
    const uploadResult = await uploadBytes(storageRef, file);
    photoUrl = await getDownloadURL(uploadResult.ref);
  }

  const colRef = collection(
    firestore,
    'contests',
    FIFTY_ABOVE_FIFTY_CONTEST_ID,
    'submissions'
  );

  const authorName = user.displayName || user.email || 'Participant';
  const mediaUrl = (input.mediaUrl || '').trim();

  const docRef = await addDoc(colRef, {
    userId: user.uid,
    authorName,
    title: input.title.trim(),
    categoryId: input.categoryId,
    description: input.description.trim(),
    age: Math.floor(input.age),
    mediaUrl: mediaUrl ? mediaUrl : null,
    photoUrl,
    photoPath,
    status: 'pending' as FiftyAboveFiftySubmissionStatus,
    voteCount: 0,
    searchTokens: makeSearchTokens(
      `${input.title} ${input.categoryId} ${authorName} ${mediaUrl ? mediaUrl : ''}`
    ),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id };
}

export async function castFiftyAboveFiftyVote(
  firestore: Firestore,
  submissionId: string,
  voterId: string
) {
  if (!voterId) throw new Error('You must be signed in.');
  if (!submissionId) throw new Error('Submission ID is required.');

  const voteRef = doc(
    firestore,
    'contests',
    FIFTY_ABOVE_FIFTY_CONTEST_ID,
    'submissions',
    submissionId,
    'votes',
    voterId
  );

  await runTransaction(firestore, async (tx) => {
    const existing = await tx.get(voteRef);
    if (existing.exists()) {
      throw new Error('You already voted for this entry.');
    }
    tx.set(voteRef, { voterId, createdAt: serverTimestamp() });
  });
}

export async function updateFiftyAboveFiftySubmissionStatus(
  firestore: Firestore,
  submissionId: string,
  status: FiftyAboveFiftySubmissionStatus
) {
  if (!submissionId) throw new Error('Submission ID is required.');
  const refDoc = doc(
    firestore,
    'contests',
    FIFTY_ABOVE_FIFTY_CONTEST_ID,
    'submissions',
    submissionId
  );

  // Small guard: do not downgrade approved → pending accidentally.
  const snap = await getDoc(refDoc);
  if (!snap.exists()) throw new Error('Submission not found.');
  const current = (snap.data() as any)?.status as FiftyAboveFiftySubmissionStatus | undefined;
  if (current === 'approved' && status === 'pending') throw new Error('Cannot revert approval.');

  await updateDoc(refDoc, {
    status,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

