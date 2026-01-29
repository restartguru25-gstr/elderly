'use client';

import { useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  CollectionReference,
  DocumentData,
  FirestoreError,
  Query,
  QueryDocumentSnapshot,
  getDocs,
  limit,
  query as buildQuery,
  startAfter,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { InternalQuery, WithId } from './use-collection';

export type PaginatedSource =
  | ((CollectionReference<DocumentData> | Query<DocumentData>) & { __memo?: boolean })
  | null
  | undefined;

export type UsePaginatedCollectionOptions = {
  pageSize?: number;
};

export interface UsePaginatedCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: FirestoreError | Error | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Cursor-based pagination for Firestore queries (non-real-time).
 * Use for long lists where `onSnapshot` is unnecessary/expensive.
 */
export function usePaginatedCollection<T = any>(
  memoizedTargetRefOrQuery: PaginatedSource,
  opts?: UsePaginatedCollectionOptions
): UsePaginatedCollectionResult<T> {
  const pageSize = opts?.pageSize ?? 20;

  const getPathForError = (src: CollectionReference<DocumentData> | Query<DocumentData>) => {
    return src.type === 'collection'
      ? (src as CollectionReference).path
      : (src as unknown as InternalQuery)._query.path.canonicalString();
  };

  if (memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error(memoizedTargetRefOrQuery + ' was not properly memoized using useMemoFirebase');
  }

  const queryClient = useQueryClient();

  const queryKey = useMemo(() => {
    if (!memoizedTargetRefOrQuery) return ['firestore', 'paginated', 'null'];
    return ['firestore', 'paginated', getPathForError(memoizedTargetRefOrQuery), pageSize];
  }, [memoizedTargetRefOrQuery, pageSize]);

  const infinite = useInfiniteQuery({
    queryKey,
    enabled: !!memoizedTargetRefOrQuery,
    initialPageParam: null as QueryDocumentSnapshot<DocumentData> | null,
    queryFn: async ({ pageParam }) => {
      if (!memoizedTargetRefOrQuery) {
        return { items: [] as WithId<T>[], lastDoc: null, hasMore: false };
      }
      try {
        const q = pageParam
          ? buildQuery(memoizedTargetRefOrQuery, startAfter(pageParam), limit(pageSize))
          : buildQuery(memoizedTargetRefOrQuery, limit(pageSize));
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({ ...(d.data() as T), id: d.id }));
        return {
          items,
          lastDoc: (snap.docs[snap.docs.length - 1] ?? null) as QueryDocumentSnapshot<DocumentData> | null,
          hasMore: snap.size === pageSize,
        };
      } catch (e) {
        const path = getPathForError(memoizedTargetRefOrQuery);
        const contextualError = new FirestorePermissionError({ operation: 'list', path });
        errorEmitter.emit('permission-error', contextualError);
        const isPermissionDenied =
          (e as { code?: string })?.code === 'permission-denied' ||
          String((e as Error)?.message ?? '').toLowerCase().includes('permission');
        if (isPermissionDenied) {
          return { items: [] as WithId<T>[], lastDoc: null, hasMore: false };
        }
        throw contextualError;
      }
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.lastDoc ?? undefined : undefined),
  });

  const data = infinite.data ? infinite.data.pages.flatMap((p) => p.items) : null;
  const hasMore = infinite.hasNextPage ?? false;
  const isLoadingMore = infinite.isFetchingNextPage;
  const error = (infinite.error as FirestoreError | Error | null) ?? null;

  const loadMore = useCallback(async () => {
    if (!memoizedTargetRefOrQuery) return;
    if (!hasMore) return;
    await infinite.fetchNextPage();
  }, [memoizedTargetRefOrQuery, hasMore, infinite]);

  const refresh = useCallback(async () => {
    if (!memoizedTargetRefOrQuery) return;
    queryClient.removeQueries({ queryKey });
    await infinite.refetch();
  }, [memoizedTargetRefOrQuery, queryClient, queryKey, infinite]);

  return {
    data,
    isLoading: infinite.isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}

