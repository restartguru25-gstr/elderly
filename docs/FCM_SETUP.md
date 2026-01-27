# FCM (Push Notifications) Setup

## 1. VAPID key

1. Open [Firebase Console](https://console.firebase.google.com) → your project → **Project settings** (gear) → **Cloud Messaging**.
2. Under **Web configuration**, create or copy the **Key pair** (VAPID key).
3. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_FCM_VAPID_KEY=your-vapid-key-here
   ```
4. Restart the dev server.

Without `NEXT_PUBLIC_FCM_VAPID_KEY`, push permission and token registration are skipped.

## 2. Service worker

The app registers `/firebase-messaging-sw.js` (from `public/`). It uses the Firebase compat scripts and handles **background** messages when the tab is closed.

Foreground messages are handled in the app via `onMessage`; you can show a toast (e.g. in `MainLayout` or a provider).

## 3. Storing the FCM token

When the user enables notifications, the client:

- Requests permission.
- Registers the service worker and gets an FCM token.
- Saves it to the user profile: `users/{uid}.fcmToken`.

Ensure your Firestore rules allow users to update their own `fcmToken` (and `notificationPreferences`). The existing `updateUserProfile` flow does this.

## 4. Sending push messages (Cloud Functions)

Use **Firebase Cloud Messaging** (Admin SDK) in Cloud Functions to send to a specific token when events occur (e.g. reminder created, emergency alert).

Example (Node.js):

```js
const admin = require('firebase-admin');

async function sendPushToUser(uid, title, body) {
  const snap = await admin.firestore().collection('users').doc(uid).get();
  const token = snap.data()?.fcmToken;
  if (!token) return;

  await admin.messaging().send({
    token,
    notification: { title, body },
    webpush: {
      fcmOptions: { link: 'https://yourapp.com/dashboard' },
    },
  });
}
```

Trigger this from:

- **Reminders**: when a document is created in `users/{seniorId}/reminders`.
- **Emergency**: when a document is created in `users/{userId}/emergencyAlerts`.
- **Community**: when a new post appears in a forum the user follows (if you add that).

## 5. Notification preferences

`users/{uid}.notificationPreferences` can store:

- `pushReminders`
- `pushEmergency`
- `pushCommunity`

Respect these in your Cloud Functions before sending. The profile form can be extended to edit these (see `UserProfileAddon` and `updateUserProfile`).

## 6. HTTPS

FCM and service workers require **HTTPS** in production. Localhost is treated as secure.
