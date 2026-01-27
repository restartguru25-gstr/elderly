'use client';

import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';

const LINK_CODE_LENGTH = 8;
const ALPHANUMERIC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // exclude ambiguous 0/O, 1/I

function generateCode(): string {
  let code = '';
  const arr = new Uint8Array(LINK_CODE_LENGTH);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < LINK_CODE_LENGTH; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < LINK_CODE_LENGTH; i++) {
    code += ALPHANUMERIC[arr[i]! % ALPHANUMERIC.length];
  }
  return code;
}

/**
 * Ensures the senior has a link code. If missing, generates one and stores it
 * in linkCodes/{code} and users/{seniorId}.linkCode. Returns the code.
 */
export async function ensureSeniorLinkCode(
  firestore: Firestore,
  seniorId: string
): Promise<string> {
  const userRef = doc(firestore, 'users', seniorId);
  const userSnap = await getDoc(userRef);
  const existing = userSnap.exists() ? (userSnap.data() as { linkCode?: string }).linkCode : undefined;
  if (existing && typeof existing === 'string' && existing.length > 0) {
    const existingRef = doc(firestore, 'linkCodes', existing.toUpperCase());
    const existingSnap = await getDoc(existingRef);
    if (existingSnap.exists() && (existingSnap.data() as { seniorId?: string }).seniorId === seniorId) {
      return existing;
    }
  }

  let code: string;
  let attempts = 0;
  const maxAttempts = 20;
  do {
    code = generateCode().toUpperCase();
    const codeRef = doc(firestore, 'linkCodes', code);
    const snap = await getDoc(codeRef);
    if (!snap.exists()) break;
    attempts++;
  } while (attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    throw new Error('Could not generate a unique link code. Please try again.');
  }

  const codeRef = doc(firestore, 'linkCodes', code);
  await setDoc(codeRef, { seniorId, createdAt: serverTimestamp() });
  await updateDoc(userRef, { linkCode: code });
  return code;
}

export type LinkResult = { seniorId: string; seniorName?: string };

/**
 * Links a guardian to a senior using the senior's link code. Updates both
 * users' linkedProfiles. Idempotent: safe to call if already linked.
 */
export async function linkGuardianToSeniorByCode(
  firestore: Firestore,
  code: string,
  guardianId: string
): Promise<LinkResult> {
  const normalized = code.trim().toUpperCase().replace(/\s/g, '');
  if (!normalized) throw new Error('Please enter a valid link code.');

  const codeRef = doc(firestore, 'linkCodes', normalized);
  const codeSnap = await getDoc(codeRef);
  if (!codeSnap.exists()) {
    throw new Error('Invalid or expired link code. Please check and try again.');
  }

  const { seniorId } = codeSnap.data() as { seniorId?: string };
  if (!seniorId) throw new Error('Invalid link code.');

  if (seniorId === guardianId) {
    throw new Error("You can't link to yourself.");
  }

  const seniorRef = doc(firestore, 'users', seniorId);
  const guardianRef = doc(firestore, 'users', guardianId);
  const [seniorSnap, guardianSnap] = await Promise.all([getDoc(seniorRef), getDoc(guardianRef)]);

  if (!seniorSnap.exists()) throw new Error('Senior account not found.');
  const seniorData = seniorSnap.data() as { userType?: string; firstName?: string; lastName?: string; linkedProfiles?: string[] };
  if (seniorData.userType !== 'senior') {
    throw new Error('This code belongs to a family member, not a senior. Use their code from the Family page.');
  }

  if (!guardianSnap.exists()) throw new Error('Your profile was not found. Please complete your profile first.');
  const guardianData = guardianSnap.data() as { userType?: string };
  if (guardianData.userType !== 'guardian') {
    throw new Error('Only guardians can link to a senior. Update your profile role to "Guardian" first.');
  }

  const seniorLinked = (seniorData.linkedProfiles ?? []).includes(guardianId);
  const guardianLinked = ((guardianSnap.data() as { linkedProfiles?: string[] }).linkedProfiles ?? []).includes(seniorId);
  if (seniorLinked && guardianLinked) {
    const name = [seniorData.firstName, seniorData.lastName].filter(Boolean).join(' ').trim() || 'Your parent';
    return { seniorId, seniorName: name };
  }

  await Promise.all([
    updateDoc(seniorRef, { linkedProfiles: arrayUnion(guardianId) }),
    updateDoc(guardianRef, { linkedProfiles: arrayUnion(seniorId) }),
  ]);

  const seniorName = [seniorData.firstName, seniorData.lastName].filter(Boolean).join(' ').trim() || 'Your parent';
  return { seniorId, seniorName };
}

/**
 * Returns linked user IDs for a user from their profile.
 */
export async function getLinkedUserIds(
  firestore: Firestore,
  userId: string
): Promise<string[]> {
  const userRef = doc(firestore, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return [];
  const data = snap.data() as { linkedProfiles?: string[] };
  return Array.isArray(data.linkedProfiles) ? data.linkedProfiles : [];
}

/**
 * Fetches minimal profile info (id, firstName, lastName, userType, phone) for given user IDs.
 */
export async function getLinkedProfiles(
  firestore: Firestore,
  userIds: string[]
): Promise<Array<{ id: string; firstName?: string; lastName?: string; userType?: string; phone?: string }>> {
  if (userIds.length === 0) return [];
  const results = await Promise.all(
    userIds.map(async (id) => {
      const ref = doc(firestore, 'users', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      const d = snap.data() as { firstName?: string; lastName?: string; userType?: string; phone?: string };
      return { id, firstName: d.firstName, lastName: d.lastName, userType: d.userType, phone: d.phone };
    })
  );
  return results.filter((r): r is NonNullable<typeof r> => r != null);
}
