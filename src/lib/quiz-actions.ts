'use client';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  Firestore,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import type { Quiz, QuizQuestion } from './quiz-types';

/** Sponsor brand image specifications */
export const SPONSOR_BRAND_IMAGE_SPECS = {
  /** Recommended dimensions (square) */
  recommendedWidth: 200,
  recommendedHeight: 200,
  maxWidth: 400,
  maxHeight: 400,
  /** Max file size in bytes (500 KB) */
  maxFileSizeBytes: 500 * 1024,
  /** Allowed MIME types */
  allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  allowedExtensions: ['.png', '.jpg', '.jpeg', '.webp'],
} as const;

/** Upload sponsor brand image and return the download URL */
export async function uploadSponsorBrandImage(
  storage: FirebaseStorage,
  file: File,
  quizId?: string
): Promise<string> {
  const ext = file.name.toLowerCase().match(/\.[a-z]+$/)?.[0] || '.png';
  const base = quizId
    ? `quizzes/sponsor_brands/${quizId}_${Date.now()}${ext}`
    : `quizzes/sponsor_brands/${Date.now()}_${file.name.replace(/[^a-z0-9.-]/gi, '_')}`;
  const storageRef = ref(storage, base);
  const result = await uploadBytes(storageRef, file);
  return getDownloadURL(result.ref);
}

const QUIZZES_COL = 'quizzes';
const QUIZ_QUESTIONS_COL = 'questions';

/** Admin: Create a new quiz */
export async function createQuiz(
  firestore: Firestore,
  data: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const colRef = collection(firestore, QUIZZES_COL);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Admin: Update a quiz */
export async function updateQuiz(
  firestore: Firestore,
  quizId: string,
  data: Partial<Omit<Quiz, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(firestore, QUIZZES_COL, quizId);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

/** Admin: Delete a quiz and its questions */
export async function deleteQuiz(firestore: Firestore, quizId: string): Promise<void> {
  const questionsRef = collection(firestore, QUIZZES_COL, quizId, QUIZ_QUESTIONS_COL);
  const snap = await getDocs(questionsRef);
  const batch = writeBatch(firestore);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  await deleteDoc(doc(firestore, QUIZZES_COL, quizId));
}

/** Admin: Add a question to a quiz */
export async function createQuizQuestion(
  firestore: Firestore,
  quizId: string,
  data: Omit<QuizQuestion, 'id'>
): Promise<string> {
  const colRef = collection(firestore, QUIZZES_COL, quizId, QUIZ_QUESTIONS_COL);
  const docRef = await addDoc(colRef, data);
  const current = await getQuizQuestions(firestore, quizId);
  await updateQuiz(firestore, quizId, { questionCount: current.length + 1 });
  return docRef.id;
}

/** Admin: Update a quiz question */
export async function updateQuizQuestion(
  firestore: Firestore,
  quizId: string,
  questionId: string,
  data: Partial<Omit<QuizQuestion, 'id'>>
): Promise<void> {
  const docRef = doc(firestore, QUIZZES_COL, quizId, QUIZ_QUESTIONS_COL, questionId);
  await updateDoc(docRef, data);
}

/** Admin: Delete a quiz question */
export async function deleteQuizQuestion(
  firestore: Firestore,
  quizId: string,
  questionId: string
): Promise<void> {
  const docRef = doc(firestore, QUIZZES_COL, quizId, QUIZ_QUESTIONS_COL, questionId);
  await deleteDoc(docRef);
  const questions = await getQuizQuestions(firestore, quizId);
  await updateQuiz(firestore, quizId, { questionCount: questions.length });
}

/** Admin: List all quizzes (any status) */
export async function listAllQuizzes(firestore: Firestore): Promise<(Quiz & { id: string })[]> {
  const colRef = collection(firestore, QUIZZES_COL);
  const q = query(colRef, orderBy('quizDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quiz & { id: string }));
}

export async function listLiveQuizzes(firestore: Firestore): Promise<(Quiz & { id: string })[]> {
  const colRef = collection(firestore, QUIZZES_COL);
  const q = query(
    colRef,
    where('status', '==', 'live'),
    orderBy('quizDate', 'desc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quiz & { id: string }));
}

export async function getQuiz(
  firestore: Firestore,
  quizId: string
): Promise<(Quiz & { id: string }) | null> {
  const docRef = doc(firestore, QUIZZES_COL, quizId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Quiz & { id: string };
}

export async function getQuizQuestions(
  firestore: Firestore,
  quizId: string
): Promise<(QuizQuestion & { id: string })[]> {
  const colRef = collection(firestore, QUIZZES_COL, quizId, QUIZ_QUESTIONS_COL);
  const q = query(colRef, orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizQuestion & { id: string }));
}
