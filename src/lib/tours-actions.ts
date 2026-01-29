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

export type TourInput = {
  title: string;
  location: string;
  duration: string;
  price: number;
  originalPrice: number;
  imageId: string;
  transport: 'Plane' | 'Train' | 'Bus';
  rating: number;
  reviews: number;
  features: string[];
};

export type Tour = TourInput & {
  id: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export function createTour(firestore: Firestore, data: TourInput) {
  const col = collection(firestore, 'tours');
  return addDocumentNonBlocking(col, {
    title: data.title.trim(),
    location: data.location.trim(),
    duration: data.duration.trim(),
    price: Math.round(data.price),
    originalPrice: Math.round(data.originalPrice),
    imageId: data.imageId.trim(),
    transport: data.transport,
    rating: Math.min(5, Math.max(0, data.rating)),
    reviews: Math.max(0, Math.round(data.reviews)),
    features: Array.isArray(data.features) ? data.features.filter(Boolean).map((s) => String(s).trim()) : [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateTour(
  firestore: Firestore,
  tourId: string,
  data: Partial<TourInput>
) {
  const ref = doc(firestore, 'tours', tourId);
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (data.title !== undefined) payload.title = data.title.trim();
  if (data.location !== undefined) payload.location = data.location.trim();
  if (data.duration !== undefined) payload.duration = data.duration.trim();
  if (data.price !== undefined) payload.price = Math.round(data.price);
  if (data.originalPrice !== undefined) payload.originalPrice = Math.round(data.originalPrice);
  if (data.imageId !== undefined) payload.imageId = data.imageId.trim();
  if (data.transport !== undefined) payload.transport = data.transport;
  if (data.rating !== undefined) payload.rating = Math.min(5, Math.max(0, data.rating));
  if (data.reviews !== undefined) payload.reviews = Math.max(0, Math.round(data.reviews));
  if (data.features !== undefined) payload.features = Array.isArray(data.features) ? data.features.filter(Boolean).map((s) => String(s).trim()) : [];
  return updateDocumentNonBlocking(ref, payload);
}

export function deleteTour(firestore: Firestore, tourId: string) {
  return deleteDocumentNonBlocking(doc(firestore, 'tours', tourId));
}
