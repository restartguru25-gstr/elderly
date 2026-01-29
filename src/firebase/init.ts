'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';

export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp: FirebaseApp;

    if (process.env.NODE_ENV === 'development') {
      // Local dev: always use config. Parameterless initializeApp() throws app/no-options when not on App Hosting.
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      // Production: try App Hosting env vars first, then fall back to config.
      try {
        firebaseApp = initializeApp();
      } catch (e) {
        const isNoOptions = (e as { code?: string })?.code === 'app/no-options';
        if (!isNoOptions && process.env.NODE_ENV === 'production') {
          console.warn('Firebase automatic init failed. Falling back to config.', e);
        }
        firebaseApp = initializeApp(firebaseConfig);
      }
    }

    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp)
  };
}
