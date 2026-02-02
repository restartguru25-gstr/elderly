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
  setDoc,
  serverTimestamp,
  writeBatch,
  Firestore,
  Timestamp,
} from 'firebase/firestore';
import type { HealthQuestion, HealthCheckinAnswer, HealthProfile } from './health-checkin-types';

const HEALTH_QUESTIONS_COL = 'healthQuestions';
const HEALTH_CHECKIN_ANSWERS_COL = 'healthCheckinAnswers';
const HEALTH_PROFILE_COL = 'healthProfileData';
const HEALTH_PROFILE_DOC_ID = 'current';

/** Get date string YYYY-MM-DD for today */
export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0]!;
}

/** Check if user has completed today's Daily Health Check-in */
export async function hasCompletedTodayCheckin(
  firestore: Firestore,
  userId: string
): Promise<boolean> {
  if (!userId) return false;
  const today = getTodayDateString();
  const colRef = collection(firestore, 'users', userId, HEALTH_CHECKIN_ANSWERS_COL);
  const q = query(colRef, where('date', '==', today), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

/** Get questions for a given day number (1–20), enabled only */
export async function getQuestionsForDay(
  firestore: Firestore,
  day: number
): Promise<HealthQuestion[]> {
  const colRef = collection(firestore, HEALTH_QUESTIONS_COL);
  const q = query(
    colRef,
    where('day', '==', day),
    where('enabled', '==', true),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as HealthQuestion));
}

/** Get user's current "day" based on distinct check-in dates (1 = first day ever) */
export async function getUserCurrentDay(
  firestore: Firestore,
  userId: string
): Promise<number> {
  if (!userId) return 1;
  const colRef = collection(firestore, 'users', userId, HEALTH_CHECKIN_ANSWERS_COL);
  const q = query(colRef, orderBy('date', 'asc'));
  const snap = await getDocs(q);
  const dates = new Set<string>();
  snap.docs.forEach((d) => {
    const date = (d.data() as HealthCheckinAnswer).date;
    if (date) dates.add(date);
  });
  return Math.min(dates.size + 1, 20);
}

/** Get user's answers for a given date */
export async function getAnswersForDate(
  firestore: Firestore,
  userId: string,
  date: string
): Promise<HealthCheckinAnswer[]> {
  if (!userId) return [];
  const colRef = collection(firestore, 'users', userId, HEALTH_CHECKIN_ANSWERS_COL);
  const q = query(colRef, where('date', '==', date));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as HealthCheckinAnswer));
  list.sort((a, b) => (a.questionId || '').localeCompare(b.questionId || ''));
  return list;
}

/** Filter questions by conditional logic (showIfPreviousAnswer) */
export function filterByConditions(
  questions: HealthQuestion[],
  answers: Map<string, string>
): HealthQuestion[] {
  return questions.filter((q) => {
    if (!q.showIfQuestionId || !q.showIfAnswer) return true;
    const prevAnswer = answers.get(q.showIfQuestionId);
    return prevAnswer === q.showIfAnswer;
  });
}

/** Get today's questions for user, respecting day and conditions. Excludes already-answered. */
export async function getTodaysQuestions(
  firestore: Firestore,
  userId: string
): Promise<HealthQuestion[]> {
  const day = await getUserCurrentDay(firestore, userId);
  const allForDay = await getQuestionsForDay(firestore, day);
  const today = getTodayDateString();
  const existingAnswers = await getAnswersForDate(firestore, userId, today);
  const answerMap = new Map(existingAnswers.map((a) => [a.questionId, a.answer]));
  const answeredIds = new Set(existingAnswers.filter((a) => a.questionId !== '_skipped').map((a) => a.questionId));

  const result: HealthQuestion[] = [];
  for (const q of allForDay) {
    if (answeredIds.has(q.id)) continue;
    if (!q.showIfQuestionId || !q.showIfAnswer) {
      result.push(q);
    } else {
      const prevAnswer = answerMap.get(q.showIfQuestionId);
      if (prevAnswer === q.showIfAnswer) result.push(q);
    }
    if (result.length >= 3) break;
  }
  return result;
}

/** Save answers and update health profile */
export async function submitHealthCheckinAnswers(
  firestore: Firestore,
  userId: string,
  answers: { questionId: string; answer: string }[]
): Promise<void> {
  if (!userId || answers.length === 0) return;
  const today = getTodayDateString();
  const batch = writeBatch(firestore);
  const colRef = collection(firestore, 'users', userId, HEALTH_CHECKIN_ANSWERS_COL);

  for (const { questionId, answer } of answers) {
    const docRef = doc(colRef);
    batch.set(docRef, {
      userId,
      questionId,
      answer,
      date: today,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();

  // Update health profile asynchronously
  updateHealthProfileFromAnswers(firestore, userId).catch(() => {});
}

/** Mark check-in as skipped for today (no questions answered) */
export async function skipHealthCheckin(
  firestore: Firestore,
  userId: string
): Promise<void> {
  if (!userId) return;
  const today = getTodayDateString();
  const colRef = collection(firestore, 'users', userId, HEALTH_CHECKIN_ANSWERS_COL);
  await addDoc(colRef, {
    userId,
    questionId: '_skipped',
    answer: 'skipped',
    date: today,
    createdAt: serverTimestamp(),
  });
}

/** Compute and persist summarized health profile from all answers */
export async function updateHealthProfileFromAnswers(
  firestore: Firestore,
  userId: string
): Promise<void> {
  if (!userId) return;
  const colRef = collection(firestore, 'users', userId, HEALTH_CHECKIN_ANSWERS_COL);
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(200));
  const snap = await getDocs(q);
  const answers = snap.docs.map((d) => d.data() as HealthCheckinAnswer);

  const profile: HealthProfile = {
    diabetes: 'unknown',
    bp: 'no',
    mobility: 'low',
    mental_wellbeing: 'good',
    profile_last_updated: serverTimestamp(),
  };

  // Map question IDs to profile fields (admin can use conventions)
  for (const a of answers) {
    if (a.questionId === '_skipped') continue;
    const ans = (a.answer || '').toLowerCase();
    if (a.questionId.includes('diabetes') || a.questionId.includes('sugar')) {
      if (ans === 'yes') profile.diabetes = 'yes';
      else if (ans === 'no') profile.diabetes = 'no';
    } else if (a.questionId.includes('bp') || a.questionId.includes('blood') || a.questionId.includes('pressure')) {
      if (ans === 'yes') profile.bp = 'yes';
      else if (ans === 'sometimes') profile.bp = 'sometimes';
      else if (ans === 'no') profile.bp = 'no';
    } else if (a.questionId.includes('mobility') || a.questionId.includes('walk') || a.questionId.includes('move')) {
      if (ans === 'low' || ans === '🙁') profile.mobility = 'high';
      else if (ans === 'medium' || ans === '😐') profile.mobility = 'medium';
      else if (ans === 'high' || ans === '🙂') profile.mobility = 'low';
    } else if (a.questionId.includes('mood') || a.questionId.includes('feel') || a.questionId.includes('wellbeing')) {
      if (ans === '🙁' || ans === 'low') profile.mental_wellbeing = 'low';
      else if (ans === '😐' || ans === 'moderate') profile.mental_wellbeing = 'moderate';
      else if (ans === '🙂' || ans === 'good') profile.mental_wellbeing = 'good';
    }
  }

  const profileRef = doc(firestore, 'users', userId, HEALTH_PROFILE_COL, HEALTH_PROFILE_DOC_ID);
  await setDoc(profileRef, profile, { merge: true });
}

/** Check if user has ever given consent (first check-in only) */
export async function hasGivenHealthConsent(
  firestore: Firestore,
  userId: string
): Promise<boolean> {
  if (!userId) return false;
  const colRef = collection(firestore, 'users', userId, HEALTH_CHECKIN_ANSWERS_COL);
  const q = query(colRef, limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}
