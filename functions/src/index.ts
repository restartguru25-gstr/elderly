import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';

initializeApp();

type UserProfile = {
  fcmToken?: string | null;
  notificationPreferences?: {
    pushCommunity?: boolean;
  };
};

export const onCommunityPostCreated = onDocumentCreated(
  'communityForums/{forumId}/posts/{postId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const forumId = event.params.forumId as string;
    const postId = event.params.postId as string;
    const post = snap.data() as {
      authorId?: string;
      authorName?: string;
      content?: string;
      createdAt?: any;
    };

    const db = getFirestore();
    const forumSnap = await db.doc(`communityForums/${forumId}`).get();
    if (!forumSnap.exists) return;

    const forum = forumSnap.data() as { name?: string; memberIds?: string[] };
    const memberIds = Array.isArray(forum.memberIds) ? forum.memberIds : [];
    const recipients = memberIds.filter((uid) => uid && uid !== post.authorId);

    const title = forum.name ? `New post in ${forum.name}` : 'New community post';
    const body = post.content ? String(post.content).slice(0, 140) : 'Open to view.';
    const link = `/dashboard/community/${forumId}`;

    for (const uid of recipients) {
      // Create in-app notification doc (for NotificationCenter inbox)
      await db.doc(`users/${uid}/notifications/${forumId}_${postId}`).set(
        {
          type: 'community_post',
          title,
          body,
          link,
          read: false,
          data: {
            forumId,
            postId,
            authorId: post.authorId ?? null,
            authorName: post.authorName ?? null,
          },
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Optional push via FCM
      const userSnap = await db.doc(`users/${uid}`).get();
      if (!userSnap.exists) continue;
      const profile = userSnap.data() as UserProfile;
      const pushAllowed = profile.notificationPreferences?.pushCommunity ?? true;
      const token = profile.fcmToken ?? null;
      if (!pushAllowed || !token) continue;

      try {
        await getMessaging().send({
          token,
          notification: { title, body },
          data: {
            type: 'community_post',
            forumId,
            postId,
            link,
          },
        });
      } catch {
        // ignore push failures; in-app notification is already stored
      }
    }
  }
);

function nowInTimeZone(timeZone: string): { date: string; time: string } {
  // YYYY-MM-DD and HH:MM in the given timezone
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = dtf.formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const date = `${get('year')}-${get('month')}-${get('day')}`;
  const time = `${get('hour')}:${get('minute')}`;
  return { date, time };
}

type MedicationDoc = {
  userId: string;
  name: string;
  reminderEnabled?: boolean;
  reminderTimes?: string[];
  timezone?: string;
};

type UserPrefs = {
  fcmToken?: string | null;
  notificationPreferences?: {
    pushReminders?: boolean;
  };
};

export const medicationReminderScheduler = onSchedule('every 5 minutes', async () => {
  const db = getFirestore();
  const medsSnap = await db.collectionGroup('medications').where('reminderEnabled', '==', true).get();
  if (medsSnap.empty) return;

  // Cache user profiles per run
  const userCache = new Map<string, UserPrefs>();

  for (const docSnap of medsSnap.docs) {
    const med = docSnap.data() as MedicationDoc;
    const userId = med.userId;
    if (!userId) continue;

    const tz = med.timezone || 'Asia/Kolkata';
    const { date, time } = nowInTimeZone(tz);
    const times = Array.isArray(med.reminderTimes) ? med.reminderTimes : [];
    if (!times.includes(time)) continue;

    // Skip if already logged as taken today
    const logId = `${docSnap.id}_${date}`;
    const logRef = db.doc(`users/${userId}/medication_logs/${logId}`);
    const logSnap = await logRef.get();
    if (logSnap.exists && (logSnap.data() as any)?.taken === true) continue;

    // Idempotency: notification doc id per med/date/time
    const notifId = `medrem_${docSnap.id}_${date}_${time.replace(':', '')}`;
    const notifRef = db.doc(`users/${userId}/notifications/${notifId}`);
    const existing = await notifRef.get();
    if (existing.exists) continue;

    const title = 'Medication reminder';
    const body = med.name ? `Time to take ${med.name} (${time})` : `Time to take your medication (${time})`;
    const link = '/dashboard/medications';

    await notifRef.set({
      type: 'medication_reminder',
      title,
      body,
      link,
      read: false,
      data: { medicationId: docSnap.id, date, time },
      createdAt: FieldValue.serverTimestamp(),
    });

    // Push via FCM if allowed
    let prefs = userCache.get(userId);
    if (!prefs) {
      const u = await db.doc(`users/${userId}`).get();
      prefs = (u.exists ? (u.data() as UserPrefs) : {}) as UserPrefs;
      userCache.set(userId, prefs);
    }

    const pushAllowed = prefs.notificationPreferences?.pushReminders ?? true;
    const token = prefs.fcmToken ?? null;
    if (!pushAllowed || !token) continue;

    try {
      await getMessaging().send({
        token,
        notification: { title, body },
        data: {
          type: 'medication_reminder',
          medicationId: docSnap.id,
          date,
          time,
          link,
        },
      });
    } catch {
      // ignore push failures
    }
  }
});

/**
 * 50Above50 voting: increment voteCount when a new vote is created.
 * Note: Functions bypass Firestore rules via Admin SDK.
 */
export const onFiftyAboveFiftyVoteCreated = onDocumentCreated(
  'contests/50above50/submissions/{submissionId}/votes/{voterId}',
  async (event) => {
    const submissionId = event.params.submissionId as string;
    const db = getFirestore();
    const ref = db.doc(`contests/50above50/submissions/${submissionId}`);
    await ref.set(
      {
        voteCount: FieldValue.increment(1),
        lastVotedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }
);

