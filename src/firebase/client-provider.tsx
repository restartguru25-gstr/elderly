'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase/init';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const { services, error: initError } = useMemo(() => {
    try {
      return { services: initializeFirebase(), error: null as Error | null };
    } catch (e) {
      return { services: null, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, []);

  if (initError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <h1 className="text-xl font-semibold text-foreground">ElderLink</h1>
        <p className="max-w-md text-muted-foreground">
          Could not connect to services. Please check your connection and refresh.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
        >
          Refresh page
        </button>
      </div>
    );
  }

  if (!services) return null;

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
      storage={services.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
