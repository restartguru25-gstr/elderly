'use client';

import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/browser';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * In strict mode, it throws any received error to be caught by Next.js's global-error.tsx.
 * In non-strict mode (default), it logs to Sentry + shows a toast, without crashing the app.
 */
export function FirebaseErrorListener() {
  // Use the specific error type for the state for type safety.
  const [error, setError] = useState<FirestorePermissionError | null>(null);
  const { toast } = useToast();

  const strictRules =
    typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_STRICT_FIRESTORE_RULES === 'true';

  useEffect(() => {
    // The callback now expects a strongly-typed error, matching the event payload.
    const handleError = (error: FirestorePermissionError) => {
      Sentry.captureException(error);
      if (strictRules) {
        // Set error in state to trigger a re-render, then throw below.
        setError(error);
        return;
      }

      // Non-strict: surface the issue, but don't crash the app.
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Permissions issue',
        description:
          'Some data could not be loaded due to Firestore permissions. If this happens in production, please deploy the latest firestore.rules.',
      });
    };

    // The typed emitter will enforce that the callback for 'permission-error'
    // matches the expected payload type (FirestorePermissionError).
    errorEmitter.on('permission-error', handleError);

    // Unsubscribe on unmount to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // On re-render, if an error exists in state, throw it.
  if (error && strictRules) {
    throw error;
  }

  // This component renders nothing.
  return null;
}
