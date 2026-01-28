'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { getApp } from 'firebase/app';
import { useUser, useFirestore } from '@/firebase';
import { updateUserProfile } from '@/lib/user-actions';

const FCM_SW_PATH = '/firebase-messaging-sw.js';
const VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY ?? '';

async function getFcmServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator)) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration();
    const scriptURL =
      existing?.active?.scriptURL ||
      existing?.waiting?.scriptURL ||
      existing?.installing?.scriptURL ||
      '';

    // If a different SW is already controlling the origin, don't overwrite it.
    // (If you later add a real PWA service worker, the FCM handlers should be merged into that SW.)
    if (existing && scriptURL && !scriptURL.endsWith(FCM_SW_PATH)) {
      console.warn(
        '[FCM] Another service worker is already registered; skipping FCM SW registration to avoid conflicts.',
        scriptURL
      );
      return null;
    }

    // Register (or re-register) the Firebase messaging SW.
    // updateViaCache helps avoid stale SW script caching in some browsers.
    return await navigator.serviceWorker.register(FCM_SW_PATH, {
      // TS lib dom type may not include this in all setups.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateViaCache: 'none' as any,
    });
  } catch (e) {
    console.warn('[FCM] Failed to register messaging service worker:', e);
    return null;
  }
}

export function useFCM() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState<boolean | null>(null);

  const requestPermissionAndToken = useCallback(async () => {
    if (typeof window === 'undefined' || !user || !VAPID_KEY) return null;
    try {
      const ok = await isSupported();
      setSupported(ok ?? false);
      if (!ok) return null;
      const messaging = getMessaging(getApp());
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return null;
      const reg = await getFcmServiceWorkerRegistration();
      if (!reg) return null;
      const t = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
      setToken(t);
      if (t) await updateUserProfile(firestore, user.uid, { fcmToken: t });
      return t;
    } catch (e) {
      console.warn('FCM setup failed:', e);
      setSupported(false);
      return null;
    }
  }, [user, firestore]);

  useEffect(() => {
    if (!user || typeof window === 'undefined') return;
    let mounted = true;
    isSupported().then((ok) => {
      if (!mounted) return;
      setSupported(ok ?? false);
      if (!ok) return;
      if (!VAPID_KEY) return;
      const messaging = getMessaging(getApp());
      const perm = Notification.permission;
      setPermission(perm);
      if (perm !== 'granted') return;
      getFcmServiceWorkerRegistration()
        .then((reg) => {
          if (!reg) return null;
          return getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
        })
        .then((t) => {
          if (!mounted || !t) return;
          setToken(t);
          updateUserProfile(firestore, user.uid, { fcmToken: t }).catch(() => {});
        })
        .catch(() => {});
    });
    return () => { mounted = false; };
  }, [user, firestore]);

  return { token, permission, supported, requestPermissionAndToken };
}

export function useFCMForegroundHandler(onMessageFn: (payload: unknown) => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let unsub: (() => void) | undefined;
    isSupported().then((ok) => {
      if (!ok) return;
      const messaging = getMessaging(getApp());
      unsub = onMessage(messaging, (payload) => onMessageFn(payload));
    });
    return () => { unsub?.(); };
  }, [onMessageFn]);
}
