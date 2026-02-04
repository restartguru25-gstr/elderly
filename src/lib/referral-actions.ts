'use client';

import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  query,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import type { ReferralConfig, ReferralTier } from './referral-types';

const REFERRAL_CONFIG_DOC = 'referralConfig';
const REFERRALS_COL = 'referrals';
const USERS_COL = 'users';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous 0,O,1,I
const CODE_LEN = 8;

function generateCode(): string {
  let s = '';
  for (let i = 0; i < CODE_LEN; i++) {
    s += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return s;
}

/** Generate a unique referral code for a user */
export async function getOrCreateReferralCode(
  firestore: Firestore,
  userId: string
): Promise<string> {
  const userRef = doc(firestore, USERS_COL, userId);
  const snap = await getDoc(userRef);
  const existing = snap.data()?.referralCode;
  if (existing && typeof existing === 'string') return existing;

  for (let attempt = 0; attempt < 20; attempt++) {
    const code = generateCode();
    const q = query(
      collection(firestore, USERS_COL),
      where('referralCode', '==', code),
      limit(1)
    );
    const exists = await getDocs(q);
    if (exists.empty) {
      await updateDoc(userRef, {
        referralCode: code,
        referralCount: (snap.data()?.referralCount ?? 0),
        updatedAt: serverTimestamp(),
      });
      return code;
    }
  }
  throw new Error('Could not generate unique referral code');
}

/** Resolve referral code to userId */
export async function resolveReferralCode(
  firestore: Firestore,
  code: string
): Promise<string | null> {
  if (!code || code.length < 4) return null;
  const c = code.trim().toUpperCase();
  const q = query(
    collection(firestore, USERS_COL),
    where('referralCode', '==', c),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].id;
}

/** Record a referral when a new user signs up with a referral code.
 * Cloud Function onReferralCreated increments referrer's referralCount. */
export async function recordReferral(
  firestore: Firestore,
  referrerId: string,
  refereeId: string,
  refereeEmail?: string
): Promise<void> {
  const refCol = collection(firestore, REFERRALS_COL);
  await addDoc(refCol, {
    referrerId,
    refereeId,
    refereeEmail: refereeEmail || null,
    createdAt: serverTimestamp(),
  });
}

/** Get referral config (admin-defined tiers) */
export async function getReferralConfig(firestore: Firestore): Promise<ReferralConfig | null> {
  const ref = doc(firestore, REFERRAL_CONFIG_DOC, 'settings');
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as ReferralConfig;
}

/** Update referral config (admin only) */
export async function updateReferralConfig(
  firestore: Firestore,
  data: Partial<ReferralConfig>
): Promise<void> {
  const ref = doc(firestore, REFERRAL_CONFIG_DOC, 'settings');
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Create initial referral config if missing */
export async function ensureReferralConfig(firestore: Firestore): Promise<void> {
  const ref = doc(firestore, REFERRAL_CONFIG_DOC, 'settings');
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    tiers: [
      { threshold: 5, rewardType: 'monetary', rewardDescription: 'Rs 500' },
      { threshold: 10, rewardType: 'medical_test', rewardDescription: 'Free health checkup' },
      { threshold: 20, rewardType: 'gift_coupon', rewardDescription: 'Children gift voucher' },
    ],
    enabled: true,
    updatedAt: serverTimestamp(),
  });
}

/** Get user's referral count */
export async function getUserReferralCount(
  firestore: Firestore,
  userId: string
): Promise<number> {
  const userRef = doc(firestore, USERS_COL, userId);
  const snap = await getDoc(userRef);
  return snap.data()?.referralCount ?? 0;
}

/** List users with their referral counts (admin), sorted by count desc */
export async function listUsersWithReferrals(
  firestore: Firestore
): Promise<{ id: string; email?: string; firstName?: string; referralCode?: string; referralCount: number }[]> {
  const q = query(collection(firestore, USERS_COL), limit(500));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      email: data.email,
      firstName: data.firstName,
      referralCode: data.referralCode,
      referralCount: data.referralCount ?? 0,
    };
  });
  list.sort((a, b) => b.referralCount - a.referralCount);
  return list;
}
