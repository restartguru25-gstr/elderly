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

export type ShopProductInput = {
  name: string;
  price: number;
  originalPrice: number;
  coins: number;
  rating: number;
  reviews: number;
  imageId: string;
  category: string;
};

export type ShopProduct = ShopProductInput & {
  id: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export function createShopProduct(firestore: Firestore, data: ShopProductInput) {
  const col = collection(firestore, 'shopProducts');
  return addDocumentNonBlocking(col, {
    name: data.name.trim(),
    price: Math.round(data.price),
    originalPrice: Math.round(data.originalPrice),
    coins: Math.max(0, Math.round(data.coins)),
    rating: Math.min(5, Math.max(0, data.rating)),
    reviews: Math.max(0, Math.round(data.reviews)),
    imageId: data.imageId.trim(),
    category: data.category.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateShopProduct(
  firestore: Firestore,
  productId: string,
  data: Partial<ShopProductInput>
) {
  const ref = doc(firestore, 'shopProducts', productId);
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (data.name !== undefined) payload.name = data.name.trim();
  if (data.price !== undefined) payload.price = Math.round(data.price);
  if (data.originalPrice !== undefined) payload.originalPrice = Math.round(data.originalPrice);
  if (data.coins !== undefined) payload.coins = Math.max(0, Math.round(data.coins));
  if (data.rating !== undefined) payload.rating = Math.min(5, Math.max(0, data.rating));
  if (data.reviews !== undefined) payload.reviews = Math.max(0, Math.round(data.reviews));
  if (data.imageId !== undefined) payload.imageId = data.imageId.trim();
  if (data.category !== undefined) payload.category = data.category.trim();
  return updateDocumentNonBlocking(ref, payload);
}

export function deleteShopProduct(firestore: Firestore, productId: string) {
  return deleteDocumentNonBlocking(doc(firestore, 'shopProducts', productId));
}
