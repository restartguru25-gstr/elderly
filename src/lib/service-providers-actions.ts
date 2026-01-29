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

export type ServiceProviderInput = {
  name: string;
  type: string;
  description: string;
  contact?: string | null;
  imageId?: string | null;
};

export type ServiceProvider = ServiceProviderInput & {
  id: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export function createServiceProvider(firestore: Firestore, data: ServiceProviderInput) {
  const col = collection(firestore, 'serviceProviders');
  return addDocumentNonBlocking(col, {
    name: data.name.trim(),
    type: data.type.trim(),
    description: data.description.trim(),
    contact: data.contact?.trim() || null,
    imageId: data.imageId?.trim() || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateServiceProvider(
  firestore: Firestore,
  providerId: string,
  data: Partial<ServiceProviderInput>
) {
  const ref = doc(firestore, 'serviceProviders', providerId);
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (data.name !== undefined) payload.name = data.name.trim();
  if (data.type !== undefined) payload.type = data.type.trim();
  if (data.description !== undefined) payload.description = data.description.trim();
  if (data.contact !== undefined) payload.contact = data.contact?.trim() || null;
  if (data.imageId !== undefined) payload.imageId = data.imageId?.trim() || null;
  return updateDocumentNonBlocking(ref, payload);
}

export function deleteServiceProvider(firestore: Firestore, providerId: string) {
  return deleteDocumentNonBlocking(doc(firestore, 'serviceProviders', providerId));
}
