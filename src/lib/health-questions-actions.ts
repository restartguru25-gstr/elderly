'use client';

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import type { HealthQuestion } from './health-checkin-types';

const HEALTH_QUESTIONS_COL = 'healthQuestions';

export async function createHealthQuestion(
  firestore: Firestore,
  data: Omit<HealthQuestion, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const colRef = collection(firestore, HEALTH_QUESTIONS_COL);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateHealthQuestion(
  firestore: Firestore,
  questionId: string,
  data: Partial<Omit<HealthQuestion, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(firestore, HEALTH_QUESTIONS_COL, questionId);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteHealthQuestion(
  firestore: Firestore,
  questionId: string
): Promise<void> {
  const docRef = doc(firestore, HEALTH_QUESTIONS_COL, questionId);
  await deleteDoc(docRef);
}

export async function listHealthQuestions(
  firestore: Firestore
): Promise<(HealthQuestion & { id: string })[]> {
  const colRef = collection(firestore, HEALTH_QUESTIONS_COL);
  const q = query(colRef, orderBy('day', 'asc'), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as HealthQuestion & { id: string }));
}
