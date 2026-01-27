'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { getApp } from 'firebase/app';
import { useUser, useFirestore } from '@/firebase';
import { updateUserProfile } from '@/lib/user-actions';

const FCM_SW_PATH = '/firebase-messaging-sw.js';
const VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY ?? '';

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
      const reg = await navigator.serviceWorker.register(FCM_SW_PATH);
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
      setPermission(Notification.permission);
      navigator.serviceWorker
        .register(FCM_SW_PATH)
        .then((reg) => getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg }))
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
