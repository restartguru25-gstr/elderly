'use client';

import { doc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';

export type PartnerApplicationStatus = 'pending' | 'approved' | 'rejected';

export type PartnerApplication = {
  type: string;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  status: PartnerApplicationStatus;
  createdAt: unknown;
};

export function updatePartnerApplicationStatus(
  firestore: Firestore,
  applicationId: string,
  status: PartnerApplicationStatus
) {
  if (!applicationId) throw new Error('Application ID is required.');
  const ref = doc(firestore, 'partnerApplications', applicationId);
  return updateDocumentNonBlocking(ref, { status, updatedAt: serverTimestamp() });
}

export function deletePartnerApplication(firestore: Firestore, applicationId: string) {
  if (!applicationId) throw new Error('Application ID is required.');
  const ref = doc(firestore, 'partnerApplications', applicationId);
  return deleteDocumentNonBlocking(ref);
}
