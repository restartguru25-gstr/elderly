'use client';

import {
  collection,
  doc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';

export type DoctorInput = {
  name: string;
  specialty: string;
  imageId?: string | null;
};

export type Doctor = DoctorInput & {
  id: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export function createDoctor(firestore: Firestore, data: DoctorInput) {
  const col = collection(firestore, 'doctors');
  return addDocumentNonBlocking(col, {
    name: data.name.trim(),
    specialty: data.specialty.trim(),
    imageId: data.imageId?.trim() || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateDoctor(
  firestore: Firestore,
  doctorId: string,
  data: Partial<DoctorInput>
) {
  const ref = doc(firestore, 'doctors', doctorId);
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (data.name !== undefined) payload.name = data.name.trim();
  if (data.specialty !== undefined) payload.specialty = data.specialty.trim();
  if (data.imageId !== undefined) payload.imageId = data.imageId?.trim() || null;
  return updateDocumentNonBlocking(ref, payload);
}

export function deleteDoctor(firestore: Firestore, doctorId: string) {
  return deleteDocumentNonBlocking(doc(firestore, 'doctors', doctorId));
}
